"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasetService = void 0;
const database_service_1 = require("./database.service");
const did_service_1 = require("./did.service");
const ai_service_1 = require("./ai.service");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Service for dataset management
 */
class DatasetService {
    constructor() {
        this.didService = new did_service_1.DIDService();
        this.aiService = new ai_service_1.AIService();
    }
    /**
     * Create a new dataset with DID
     * @param ownerId User ID who owns the dataset
     * @param file Uploaded file
     * @param metadata Additional metadata for the dataset
     * @returns Created dataset
     */
    async createDataset(ownerId, file, metadata) {
        const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
        const existingDataset = await database_service_1.db.dataset.findUnique({ where: { fileHash } });
        if (existingDataset) {
            throw new Error('A dataset with this file already exists');
        }
        const uploadDir = process.env.UPLOAD_DIR || 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        let aiTags = [];
        try {
            aiTags = await this.aiService.extractTags(file.buffer, file.mimetype);
        }
        catch (error) {
            console.error('Error extracting AI tags:', error);
            aiTags = [];
        }
        const did = await this.didService.createDID();
        const dataset = await database_service_1.db.dataset.create({
            data: {
                did,
                title: metadata.title || file.originalname,
                description: metadata.description,
                fileHash,
                filePath,
                fileSize: file.size,
                mimeType: file.mimetype,
                metadata: Object.assign({ originalName: file.originalname, uploadedAt: new Date() }, metadata),
                aiTags,
                isPublic: !!metadata.isPublic,
                ownerId,
            },
        });
        await database_service_1.db.dIDDocument.create({
            data: {
                did,
                document: await this.didService.createDatasetDIDDocument(did, dataset),
                userId: ownerId,
                version: 1,
            },
        });
        return dataset;
    }
    /**
     * Search datasets based on a query string
     * @param query Search query
     * @param userId Optional user ID to filter results for ownership
     * @returns Array of matching datasets
     */
    async searchDatasets(query, userId) {
        var _a;
        const whereClause = {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { aiTags: { has: query } },
            ],
        };
        if (userId) {
            (_a = whereClause.OR) === null || _a === void 0 ? void 0 : _a.push({ ownerId: userId });
        }
        else {
            whereClause.isPublic = true;
        }
        return database_service_1.db.dataset.findMany({
            where: whereClause,
            include: { owner: true, shares: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Get a dataset by its DID
     * @param did DID of the dataset
     * @returns Dataset or null if not found
     */
    async getDatasetByDID(did) {
        return database_service_1.db.dataset.findUnique({
            where: { did },
            include: { owner: true, shares: true },
        });
    }
    /**
     * Get a dataset by its ID
     * @param id ID of the dataset
     * @returns Dataset or null if not found
     */
    async getDatasetById(id) {
        return database_service_1.db.dataset.findUnique({
            where: { id },
            include: { owner: true, shares: true },
        });
    }
    /**
     * Get all datasets owned by a user
     * @param ownerId User ID
     * @returns Array of datasets
     */
    async getUserDatasets(ownerId) {
        return database_service_1.db.dataset.findMany({
            where: { ownerId },
            include: { shares: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Get all datasets owned by a user, identified by their DID.
     * @param userDid The DID of the user.
     * @returns Array of datasets.
     */
    async getDatasetsByDID(userDid) {
        const user = await database_service_1.db.user.findUnique({
            where: { did: userDid },
            select: { id: true },
        });
        if (!user) {
            return [];
        }
        return this.getUserDatasets(user.id);
    }
    /**
     * Update dataset metadata
     * @param datasetId Dataset ID
     * @param userId User ID performing the update (for authorization)
     * @param updates Data to update
     * @returns Updated dataset
     */
    async updateDataset(datasetId, userId, updates) {
        const dataset = await database_service_1.db.dataset.findUnique({ where: { id: datasetId } });
        if (!dataset)
            throw new Error('Dataset not found');
        if (dataset.ownerId !== userId)
            throw new Error('Not authorized');
        const updateData = Object.assign({}, updates);
        if (updates.metadata) {
            updateData.metadata = Object.assign(Object.assign(Object.assign({}, dataset.metadata), updates.metadata), { updatedAt: new Date() });
        }
        return database_service_1.db.dataset.update({
            where: { id: datasetId },
            data: updateData,
            include: { shares: true },
        });
    }
    /**
     * Delete a dataset
     * @param datasetId Dataset ID
     * @param userId User ID performing the deletion (for authorization)
     * @returns Success status
     */
    async deleteDataset(datasetId, userId) {
        const dataset = await database_service_1.db.dataset.findUnique({ where: { id: datasetId } });
        if (!dataset)
            throw new Error('Dataset not found');
        if (dataset.ownerId !== userId)
            throw new Error('Not authorized');
        try {
            if (fs.existsSync(dataset.filePath)) {
                fs.unlinkSync(dataset.filePath);
            }
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
        await database_service_1.db.dataset.delete({ where: { id: datasetId } });
        return true;
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
    async shareDataset(datasetId, ownerId, sharedWithEmail, permission) {
        const dataset = await this.getDatasetById(datasetId);
        if (!dataset || dataset.ownerId !== ownerId) {
            throw new Error('Dataset not found or not authorized to share.');
        }
        const sharedWithUser = await database_service_1.db.user.findUnique({ where: { email: sharedWithEmail } });
        if (!sharedWithUser) {
            throw new Error(`User with email ${sharedWithEmail} not found.`);
        }
        if (sharedWithUser.id === ownerId) {
            throw new Error('Cannot share a dataset with yourself.');
        }
        const existingShare = await database_service_1.db.datasetShare.findFirst({
            where: { datasetId, sharedWithId: sharedWithUser.id },
        });
        if (existingShare) {
            throw new Error('Dataset already shared with this user.');
        }
        return database_service_1.db.datasetShare.create({
            data: {
                datasetId,
                sharedById: ownerId,
                sharedWithId: sharedWithUser.id,
                permission,
            },
        });
    }
    /**
     * Get all datasets shared with a specific user.
     * @param userId The ID of the user.
     * @returns A list of datasets shared with the user.
     */
    async getSharedWithUser(userId) {
        return database_service_1.db.datasetShare.findMany({
            where: { sharedWithId: userId },
            include: {
                dataset: { include: { owner: true } },
                sharedBy: true,
            },
        });
    }
    /**
     * Get all datasets a user has shared with others.
     * @param userId The ID of the user who shared the datasets.
     * @returns A list of the user's shares.
     */
    async getSharedByUser(userId) {
        return database_service_1.db.datasetShare.findMany({
            where: { sharedById: userId },
            include: {
                dataset: true,
                sharedWith: true,
            },
        });
    }
    /**
     * Revoke a dataset share.
     * @param shareId The ID of the share to revoke.
     * @param ownerId The ID of the user revoking the share (must be owner).
     */
    async revokeShare(shareId, ownerId) {
        const share = await database_service_1.db.datasetShare.findUnique({
            where: { id: shareId },
            include: { dataset: true },
        });
        if (!share || share.dataset.ownerId !== ownerId) {
            throw new Error('Share not found or not authorized to revoke.');
        }
        await database_service_1.db.datasetShare.delete({ where: { id: shareId } });
    }
}
exports.DatasetService = DatasetService;
