import { db } from './database.service'
import { DIDService } from './did.service'
import { AIService } from './ai.service'
import { Dataset, Prisma, DatasetShare } from '@prisma/client'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

interface UploadedFile {
  buffer: Buffer
  originalname: string
  mimetype: string
  size: number
}

/**
 * Service for dataset management
 */
export class DatasetService {
  private didService = new DIDService()
  private aiService: AIService

  constructor() {
    this.aiService = new AIService()
  }

  /**
   * Create a new dataset with DID
   * @param ownerId User ID who owns the dataset
   * @param file Uploaded file
   * @param metadata Additional metadata for the dataset
   * @returns Created dataset
   */
  async createDataset(
    ownerId: string,
    file: UploadedFile,
    metadata: any
  ): Promise<Dataset> {
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex')

    const existingDataset = await db.dataset.findUnique({ where: { fileHash } })
    if (existingDataset) {
      throw new Error('A dataset with this file already exists')
    }

    const uploadDir = process.env.UPLOAD_DIR || 'uploads'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, file.buffer)

    let aiTags: string[] = []
    try {
      aiTags = await this.aiService.extractTags(file.buffer, file.mimetype)
    } catch (error) {
      console.error('Error extracting AI tags:', error)
      aiTags = []
    }

    const did = await this.didService.createDID()

    const dataset = await db.dataset.create({
      data: {
        did,
        title: metadata.title || file.originalname,
        description: metadata.description,
        fileHash,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date(),
          ...metadata,
        },
        aiTags,
        isPublic: !!metadata.isPublic,
        ownerId,
      },
    })

    await db.dIDDocument.create({
      data: {
        did,
        document: await this.didService.createDatasetDIDDocument(did, dataset),
        userId: ownerId,
        version: 1,
      },
    })

    return dataset
  }

  /**
   * Search datasets based on a query string
   * @param query Search query
   * @param userId Optional user ID to filter results for ownership
   * @returns Array of matching datasets
   */
  async searchDatasets(query: string, userId?: string): Promise<Dataset[]> {
    const whereClause: Prisma.DatasetWhereInput = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { aiTags: { has: query } },
      ],
    }

    if (userId) {
      whereClause.OR?.push({ ownerId: userId })
    } else {
      whereClause.isPublic = true
    }

    return db.dataset.findMany({
      where: whereClause,
      include: { owner: true, shares: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Get a dataset by its DID
   * @param did DID of the dataset
   * @returns Dataset or null if not found
   */
  async getDatasetByDID(did: string): Promise<Dataset | null> {
    return db.dataset.findUnique({
      where: { did },
      include: { owner: true, shares: true },
    })
  }

  /**
   * Get a dataset by its ID
   * @param id ID of the dataset
   * @returns Dataset or null if not found
   */
  async getDatasetById(id: string): Promise<Dataset | null> {
    return db.dataset.findUnique({
      where: { id },
      include: { owner: true, shares: true },
    })
  }

  /**
   * Get all datasets owned by a user
   * @param ownerId User ID
   * @returns Array of datasets
   */
  async getUserDatasets(ownerId: string): Promise<Dataset[]> {
    return db.dataset.findMany({
      where: { ownerId },
      include: { shares: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Get all datasets owned by a user, identified by their DID.
   * @param userDid The DID of the user.
   * @returns Array of datasets.
   */
  async getDatasetsByDID(userDid: string): Promise<Dataset[]> {
    const user = await db.user.findUnique({
      where: { did: userDid },
      select: { id: true },
    })

    if (!user) {
      return []
    }

    return this.getUserDatasets(user.id)
  }

  /**
   * Update dataset metadata
   * @param datasetId Dataset ID
   * @param userId User ID performing the update (for authorization)
   * @param updates Data to update
   * @returns Updated dataset
   */
  async updateDataset(
    datasetId: string,
    userId: string,
    updates: Partial<{
      title: string
      description: string
      metadata: any
      isPublic: boolean
    }>
  ): Promise<Dataset> {
    const dataset = await db.dataset.findUnique({ where: { id: datasetId } })
    if (!dataset) throw new Error('Dataset not found')
    if (dataset.ownerId !== userId) throw new Error('Not authorized')

    const updateData: any = { ...updates }
    if (updates.metadata) {
      updateData.metadata = {
        ...(dataset.metadata as object),
        ...updates.metadata,
        updatedAt: new Date(),
      }
    }

    return db.dataset.update({
      where: { id: datasetId },
      data: updateData,
      include: { shares: true },
    })
  }

  /**
   * Delete a dataset
   * @param datasetId Dataset ID
   * @param userId User ID performing the deletion (for authorization)
   * @returns Success status
   */
  async deleteDataset(datasetId: string, userId: string): Promise<boolean> {
    const dataset = await db.dataset.findUnique({ where: { id: datasetId } })
    if (!dataset) throw new Error('Dataset not found')
    if (dataset.ownerId !== userId) throw new Error('Not authorized')

    try {
      if (fs.existsSync(dataset.filePath)) {
        fs.unlinkSync(dataset.filePath)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }

    await db.dataset.delete({ where: { id: datasetId } })
    return true
  }

  // --- Dataset Sharing --- //

  /**
   * Share a dataset with another user.
   * @param datasetId The ID of the dataset to share.
   * @param ownerId The ID of the user sharing the dataset (must be owner).
   * @param sharedWithEmail The email of the user to share with.
   * @param permission The permission level (e.g., 'VIEW', 'EDIT').
   * @returns The created DatasetShare record.
   */
  async shareDataset(
    datasetId: string,
    ownerId: string,
    sharedWithEmail: string,
    permission: string
  ): Promise<DatasetShare> {
    const dataset = await this.getDatasetById(datasetId)
    if (!dataset || dataset.ownerId !== ownerId) {
      throw new Error('Dataset not found or not authorized to share.')
    }

    const sharedWithUser = await db.user.findUnique({ where: { email: sharedWithEmail } })
    if (!sharedWithUser) {
      throw new Error(`User with email ${sharedWithEmail} not found.`)
    }

    if (sharedWithUser.id === ownerId) {
      throw new Error('Cannot share a dataset with yourself.')
    }

    const existingShare = await db.datasetShare.findFirst({
      where: { datasetId, sharedWithId: sharedWithUser.id },
    })

    if (existingShare) {
      throw new Error('Dataset already shared with this user.')
    }

    return db.datasetShare.create({
      data: {
        datasetId,
        sharedById: ownerId,
        sharedWithId: sharedWithUser.id,
        permission,
      },
    })
  }

  /**
   * Get all datasets shared with a specific user.
   * @param userId The ID of the user.
   * @returns A list of datasets shared with the user.
   */
  async getSharedWithUser(userId: string) {
    return db.datasetShare.findMany({
      where: { sharedWithId: userId },
      include: {
        dataset: { include: { owner: true } },
        sharedBy: true,
      },
    })
  }

  /**
   * Get all datasets a user has shared with others.
   * @param userId The ID of the user who shared the datasets.
   * @returns A list of the user's shares.
   */
  async getSharedByUser(userId: string) {
    return db.datasetShare.findMany({
      where: { sharedById: userId },
      include: {
        dataset: true,
        sharedWith: true,
      },
    })
  }

  /**
   * Revoke a dataset share.
   * @param shareId The ID of the share to revoke.
   * @param ownerId The ID of the user revoking the share (must be owner).
   */
  async revokeShare(shareId: string, ownerId: string): Promise<void> {
    const share = await db.datasetShare.findUnique({
      where: { id: shareId },
      include: { dataset: true },
    })

    if (!share || share.dataset.ownerId !== ownerId) {
      throw new Error('Share not found or not authorized to revoke.')
    }

    await db.datasetShare.delete({ where: { id: shareId } })
  }
}

