"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataverseController = void 0;
const express_validator_1 = require("express-validator");
const dataverse_service_1 = require("../services/dataverse.service");
const dataset_service_1 = require("../services/dataset.service");
const database_service_1 = require("../services/database.service");
class DataverseController {
    constructor() {
        this.dataverseService = new dataverse_service_1.DataverseService();
        this.datasetService = new dataset_service_1.DatasetService();
    }
    /**
     * Create a new dataset in Dataverse with DID integration
     */
    async createDataset(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ error: 'Invalid input', details: errors.array() });
                return;
            }
            const { id: userId } = req.user; // req.user is now typed
            const { dataverseAlias, metadata, apiToken, createLocalCopy = true } = req.body;
            if (!apiToken) {
                res.status(401).json({ error: 'Dataverse API token is required' });
                return;
            }
            // Create dataset in Dataverse
            const result = await this.dataverseService.createDataset(dataverseAlias, metadata, apiToken, true // Always create DID
            );
            let localDataset;
            // Create local copy if requested
            if (createLocalCopy && result.dataverseResponse.status === 'OK') {
                const localMetadata = {
                    title: metadata.title,
                    description: metadata.description,
                    hash: 'dataverse-dataset', // Placeholder hash for Dataverse datasets
                    path: result.dataverseResponse.data.persistentId,
                    fileSize: 0, // Will be updated when files are added
                    mimeType: 'application/dataverse+json',
                    metadata: Object.assign(Object.assign({}, metadata), { dataverseId: result.dataverseResponse.data.persistentId, datasetId: result.dataverseResponse.data.id, dataverseUrl: `https://dataverse.harvard.edu/dataset.xhtml?persistentId=${result.dataverseResponse.data.persistentId}`, createdInDataverse: true }),
                    aiTags: [], // Will be populated when files are added
                    isPublic: false // Dataverse datasets start as draft
                };
                // Create local dataset record with DID
                localDataset = await database_service_1.db.dataset.create({
                    data: {
                        title: localMetadata.title,
                        description: localMetadata.description,
                        fileHash: localMetadata.hash,
                        filePath: localMetadata.path,
                        fileSize: localMetadata.fileSize,
                        mimeType: localMetadata.mimeType,
                        metadata: localMetadata.metadata || {},
                        aiTags: localMetadata.aiTags,
                        isPublic: localMetadata.isPublic,
                        did: result.did,
                        ownerId: userId // Corrected from userId
                    }
                });
                // Store DID document
                if (result.did && result.didDocument) {
                    await database_service_1.db.dIDDocument.create({
                        data: {
                            did: result.did,
                            document: result.didDocument,
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
        }
        catch (error) {
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
    async uploadFile(req, res) {
        try {
            const { id: ownerId } = req.user;
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
            const result = await this.dataverseService.uploadFile(datasetId, file.buffer, file.originalname, file.mimetype, metadata, apiToken, enhanceWithAI);
            // Update local dataset if it exists
            const localDataset = await database_service_1.db.dataset.findFirst({
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
                const currentMetadata = localDataset.metadata;
                const updatedMetadata = Object.assign(Object.assign({}, currentMetadata), { fileCount: (currentMetadata.fileCount || 0) + 1, lastFileUpload: new Date().toISOString() });
                const updatedTags = result.aiEnhancements ?
                    [...new Set([...localDataset.aiTags, ...result.aiEnhancements.tags])] :
                    localDataset.aiTags;
                await database_service_1.db.dataset.update({
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
        }
        catch (error) {
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
    async syncDataset(req, res) {
        var _a;
        try {
            const { id: ownerId } = req.user;
            const { datasetId } = req.params;
            const { apiToken } = req.body;
            if (!apiToken) {
                res.status(401).json({ error: 'Dataverse API token is required' });
                return;
            }
            // Find local dataset
            const localDataset = await database_service_1.db.dataset.findFirst({
                where: {
                    id: datasetId,
                    ownerId
                }
            });
            if (!localDataset) {
                res.status(404).json({ error: 'Local dataset not found' });
                return;
            }
            const dataverseId = (_a = localDataset.metadata) === null || _a === void 0 ? void 0 : _a.dataverseId;
            if (!dataverseId) {
                res.status(400).json({ error: 'Dataset is not linked to Dataverse' });
                return;
            }
            // Perform sync
            const syncResult = await this.dataverseService.syncDataset(localDataset.id, dataverseId, apiToken);
            res.json({
                status: 'success',
                sync: syncResult,
                message: 'Dataset synchronization completed'
            });
        }
        catch (error) {
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
    async getDataverseDataset(req, res) {
        try {
            const { datasetId } = req.params;
            const { apiToken } = req.query;
            const metadata = await this.dataverseService.getDatasetMetadata(datasetId, apiToken);
            res.json({
                status: 'success',
                metadata,
                message: 'Dataset metadata retrieved from Dataverse'
            });
        }
        catch (error) {
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
    async listDatasetsWithDataverseStatus(req, res) {
        try {
            const { id: ownerId } = req.user;
            const datasets = await database_service_1.db.dataset.findMany({
                where: { ownerId }, // Corrected from userId
                include: {
                    owner: { select: { id: true, email: true, did: true } }, // Corrected from 'user'
                    shares: true
                },
                orderBy: { createdAt: 'desc' }
            });
            // Add Dataverse integration status
            const datasetsWithStatus = datasets.map(dataset => {
                const metadata = dataset.metadata;
                return Object.assign(Object.assign({}, dataset), { dataverseIntegration: {
                        isLinked: !!(metadata === null || metadata === void 0 ? void 0 : metadata.dataverseId),
                        dataverseId: (metadata === null || metadata === void 0 ? void 0 : metadata.dataverseId) || null,
                        dataverseUrl: (metadata === null || metadata === void 0 ? void 0 : metadata.dataverseUrl) || null,
                        createdInDataverse: !!(metadata === null || metadata === void 0 ? void 0 : metadata.createdInDataverse),
                        lastSync: (metadata === null || metadata === void 0 ? void 0 : metadata.lastSync) || null
                    } });
            });
            res.json({
                status: 'success',
                datasets: datasetsWithStatus,
                message: 'Datasets retrieved with Dataverse integration status'
            });
        }
        catch (error) {
            console.error('Error listing datasets with Dataverse status:', error);
            res.status(500).json({
                error: 'Failed to retrieve datasets',
                details: error.message
            });
        }
    }
}
exports.DataverseController = DataverseController;
