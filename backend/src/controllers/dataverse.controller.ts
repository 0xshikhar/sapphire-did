import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { DataverseService } from '../services/dataverse.service';
import { DatasetService } from '../services/dataset.service';
import { db } from '../services/database.service';
import { Prisma } from '@prisma/client';

export class DataverseController {
  private dataverseService = new DataverseService();
  private datasetService = new DatasetService();

  /**
   * Create a new dataset in Dataverse with DID integration
   */
  async createDataset(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Invalid input', details: errors.array() });
        return;
      }

      const { id: userId } = req.user!; // req.user is now typed
      const { 
        dataverseAlias, 
        metadata, 
        apiToken,
        createLocalCopy = true 
      } = req.body;

      if (!apiToken) {
        res.status(401).json({ error: 'Dataverse API token is required' });
        return;
      }

      // Create dataset in Dataverse
      const result = await this.dataverseService.createDataset(
        dataverseAlias,
        metadata,
        apiToken,
        true // Always create DID
      );

      let localDataset;

      // Create local copy if requested
      if (createLocalCopy && result.dataverseResponse.status === 'OK') {
        const localMetadata: Prisma.JsonObject = {
          title: metadata.title,
          description: metadata.description,
          hash: 'dataverse-dataset', // Placeholder hash for Dataverse datasets
          path: result.dataverseResponse.data.persistentId,
          fileSize: 0, // Will be updated when files are added
          mimeType: 'application/dataverse+json',
          metadata: {
            ...metadata,
            dataverseId: result.dataverseResponse.data.persistentId,
            datasetId: result.dataverseResponse.data.id,
            dataverseUrl: `https://dataverse.harvard.edu/dataset.xhtml?persistentId=${result.dataverseResponse.data.persistentId}`,
            createdInDataverse: true
          },
          aiTags: [], // Will be populated when files are added
          isPublic: false // Dataverse datasets start as draft
        };

        // Create local dataset record with DID
        localDataset = await db.dataset.create({
          data: {
            title: localMetadata.title as string,
            description: localMetadata.description as string,
            fileHash: localMetadata.hash as string,
            filePath: localMetadata.path as string,
            fileSize: localMetadata.fileSize as number,
            mimeType: localMetadata.mimeType as string,
            metadata: localMetadata.metadata || {},
            aiTags: localMetadata.aiTags as string[],
            isPublic: localMetadata.isPublic as boolean,
            did: result.did!,
            ownerId: userId // Corrected from userId
          }
        });

        // Store DID document
        if (result.did && result.didDocument) {
          await db.dIDDocument.create({
            data: {
              did: result.did,
              document: result.didDocument as Prisma.JsonObject,
              version: 1,
              userId // This is correct for DIDDocument model
            }
          });
        }
      }

      res.status(201).json({
        status: 'success',
        dataverse: {
          persistentId: result.dataverseResponse.data.persistentId,
          datasetId: result.dataverseResponse.data.id,
          url: `https://dataverse.harvard.edu/dataset.xhtml?persistentId=${result.dataverseResponse.data.persistentId}`
        },
        did: result.did,
        localDataset: localDataset || null,
        message: 'Dataset created successfully in Dataverse'
      });
    } catch (error: any) {
      console.error('Error creating Dataverse dataset:', error);
      res.status(500).json({ 
        error: 'Failed to create dataset in Dataverse',
        details: error.message 
      });
    }
  }

  /**
   * Upload file to Dataverse dataset
   */
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      const { id: ownerId } = req.user!;
      const { datasetId } = req.params; // This is the dataverse persistentId
      const { apiToken, metadata = {}, enhanceWithAI = true } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      if (!apiToken) {
        res.status(401).json({ error: 'Dataverse API token is required' });
        return;
      }

      // Upload file to Dataverse
      const result = await this.dataverseService.uploadFile(
        datasetId,
        file.buffer,
        file.originalname,
        file.mimetype,
        metadata,
        apiToken,
        enhanceWithAI
      );

      // Update local dataset if it exists
      const localDataset = await db.dataset.findFirst({
        where: {
          // Correct way to query a JSON field in Prisma
          metadata: {
            path: ['dataverseId'],
            equals: datasetId,
          },
          ownerId
        }
      });

      if (localDataset) {
        const currentMetadata = localDataset.metadata as Prisma.JsonObject;
        const updatedMetadata: Prisma.JsonObject = {
          ...currentMetadata,
          fileCount: ((currentMetadata.fileCount as number) || 0) + 1,
          lastFileUpload: new Date().toISOString()
        };

        const updatedTags = result.aiEnhancements ? 
          [...new Set([...localDataset.aiTags, ...result.aiEnhancements.tags])] :
          localDataset.aiTags;

        await db.dataset.update({
          where: { id: localDataset.id },
          data: {
            metadata: updatedMetadata,
            aiTags: updatedTags,
            fileSize: localDataset.fileSize + file.size // Corrected from 'size'
          }
        });
      }

      res.json({
        status: 'success',
        dataverse: result.dataverseResponse,
        aiEnhancements: result.aiEnhancements,
        message: 'File uploaded successfully to Dataverse'
      });
    } catch (error: any) {
      console.error('Error uploading file to Dataverse:', error);
      res.status(500).json({ 
        error: 'Failed to upload file to Dataverse',
        details: error.message 
      });
    }
  }

  /**
   * Sync local dataset with Dataverse
   */
  async syncDataset(req: Request, res: Response): Promise<void> {
    try {
      const { id: ownerId } = req.user!;
      const { datasetId } = req.params;
      const { apiToken } = req.body;

      if (!apiToken) {
        res.status(401).json({ error: 'Dataverse API token is required' });
        return;
      }

      // Find local dataset
      const localDataset = await db.dataset.findFirst({
        where: {
          id: datasetId,
          ownerId
        }
      });

      if (!localDataset) {
        res.status(404).json({ error: 'Local dataset not found' });
        return;
      }

      const dataverseId = (localDataset.metadata as Prisma.JsonObject)?.dataverseId as string;

      if (!dataverseId) {
        res.status(400).json({ error: 'Dataset is not linked to Dataverse' });
        return;
      }

      // Perform sync
      const syncResult = await this.dataverseService.syncDataset(
        localDataset.id,
        dataverseId,
        apiToken
      );

      res.json({
        status: 'success',
        sync: syncResult,
        message: 'Dataset synchronization completed'
      });
    } catch (error: any) {
      console.error('Error syncing dataset with Dataverse:', error);
      res.status(500).json({ 
        error: 'Failed to sync dataset with Dataverse',
        details: error.message 
      });
    }
  }

  /**
   * Get Dataverse dataset metadata
   */
  async getDataverseDataset(req: Request, res: Response): Promise<void> {
    try {
      const { datasetId } = req.params;
      const { apiToken } = req.query;

      const metadata = await this.dataverseService.getDatasetMetadata(
        datasetId,
        apiToken as string
      );

      res.json({
        status: 'success',
        metadata,
        message: 'Dataset metadata retrieved from Dataverse'
      });
    } catch (error: any) {
      console.error('Error fetching Dataverse dataset:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dataset from Dataverse',
        details: error.message 
      });
    }
  }

  /**
   * List user's datasets with Dataverse integration status
   */
  async listDatasetsWithDataverseStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id: ownerId } = req.user!;

      const datasets = await db.dataset.findMany({
        where: { ownerId }, // Corrected from userId
        include: {
          owner: { select: { id: true, email: true, did: true } }, // Corrected from 'user'
          shares: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Add Dataverse integration status
      const datasetsWithStatus = datasets.map(dataset => {
        const metadata = dataset.metadata as Prisma.JsonObject;
        return {
          ...dataset,
          dataverseIntegration: {
            isLinked: !!metadata?.dataverseId,
            dataverseId: metadata?.dataverseId || null,
            dataverseUrl: metadata?.dataverseUrl || null,
            createdInDataverse: !!metadata?.createdInDataverse,
            lastSync: metadata?.lastSync || null
          }
        }
      });

      res.json({
        status: 'success',
        datasets: datasetsWithStatus,
        message: 'Datasets retrieved with Dataverse integration status'
      });
    } catch (error: any) {
      console.error('Error listing datasets with Dataverse status:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve datasets',
        details: error.message 
      });
    }
  }
}