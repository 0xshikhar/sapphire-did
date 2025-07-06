import { Router, Request, Response } from 'express'
import { DatasetService } from '../services/dataset.service'
import { GDPRService } from '../services/gdpr.service'
import { AIService } from '../services/ai.service'
import { authenticateUser } from './user.controller'
import { AuthenticatedRequest } from '../types/request.types'
import multer from 'multer'

// Configure multer for memory storage (we'll process and save files manually)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
})

export const datasetRouter = Router()
const datasetService = new DatasetService()
const gdprService = new GDPRService()
const aiService = new AIService()

/**
 * Get all datasets linked to the authenticated user's DID.
 * GET /datasets/my-datasets
 */
datasetRouter.get('/my-datasets', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userDid = req.user?.did;
        if (!userDid) {
            return res.status(400).json({ error: 'User DID not found in token' });
        }

        const datasets = await datasetService.getDatasetsByDID(userDid);

        res.status(200).json(datasets);
    } catch (error) {
        console.error('Get My Datasets Error:', error);
        res.status(500).json({ error: 'Failed to get user datasets' });
    }
});

/**
 * Upload a new dataset
 * POST /datasets
 */
datasetRouter.post('/', authenticateUser, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id as string
        const file = req.file

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        // Extract metadata from the request body
        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {}

        // Add title if not provided
        if (!metadata.title) {
            metadata.title = file.originalname
        }

        // Create the dataset
        const dataset = await datasetService.createDataset(userId, file, metadata)

        // Record the dataset creation in audit log
        await gdprService.recordDataAccess(
            userId,
            'dataset',
            dataset.id,
            'create',
            req.ip,
            req.headers['user-agent']
        )

        res.status(201).json(dataset)
    } catch (error: any) {
        console.error('Dataset upload error:', error)
        res.status(500).json({ error: `Failed to upload dataset: ${error.message}` })
    }
})

/**
 * Get all datasets for current user
 * GET /datasets
 */
datasetRouter.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id as string
        const datasets = await datasetService.getUserDatasets(userId)

        res.status(200).json(datasets)
    } catch (error) {
        console.error('Get datasets error:', error)
        res.status(500).json({ error: 'Failed to retrieve datasets' })
    }
})

/**
 * Search datasets
 * GET /datasets/search
 */
datasetRouter.get('/search', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const query = req.query.q as string

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' })
        }

        // If user is authenticated, include their private datasets in search
        const userId = req.user?.id

        const datasets = await datasetService.searchDatasets(query, userId)

        res.status(200).json(datasets)
    } catch (error) {
        console.error('Search datasets error:', error)
        res.status(500).json({ error: 'Failed to search datasets' })
    }
})

/**
 * Get dataset by ID
 * GET /datasets/:id
 */
datasetRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const datasetId = req.params.id
        const dataset = await datasetService.getDatasetById(datasetId)

        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' })
        }

        // Check if dataset is public or user owns it
        if (!dataset.isPublic && (!req.user || dataset.ownerId !== req.user.id)) {
            return res.status(403).json({ error: 'Not authorized to access this dataset' })
        }

        // If user is authenticated, record the access
        if (req.user) {
            await gdprService.recordDataAccess(
                req.user.id,
                'dataset',
                dataset.id,
                'read',
                req.ip,
                req.headers['user-agent']
            )
        }

        res.status(200).json(dataset)
    } catch (error) {
        console.error('Get dataset error:', error)
        res.status(500).json({ error: 'Failed to retrieve dataset' })
    }
})

/**
 * Get dataset by DID
 * GET /datasets/did/:did
 */
datasetRouter.get('/did/:did', async (req: AuthenticatedRequest, res: Response) => {
    try {
        const did = req.params.did
        const dataset = await datasetService.getDatasetByDID(did)

        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' })
        }

        // Check if dataset is public or user owns it
        if (!dataset.isPublic && (!req.user || dataset.ownerId !== req.user.id)) {
            return res.status(403).json({ error: 'Not authorized to access this dataset' })
        }

        // If user is authenticated, record the access
        if (req.user) {
            await gdprService.recordDataAccess(
                req.user.id,
                'dataset',
                dataset.id,
                'read',
                req.ip,
                req.headers['user-agent']
            )
        }

        res.status(200).json(dataset)
    } catch (error) {
        console.error('Get dataset by DID error:', error)
        res.status(500).json({ error: 'Failed to retrieve dataset' })
    }
})

/**
 * Update dataset metadata
 * PATCH /datasets/:id
 */
datasetRouter.patch('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id as string
        const datasetId = req.params.id
        const updates = req.body

        // Validate updates
        const allowedFields = ['title', 'description', 'metadata', 'isPublic']
        const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field))

        if (invalidFields.length > 0) {
            return res.status(400).json({
                error: `Invalid fields: ${invalidFields.join(', ')}`
            })
        }

        // Update the dataset
        const updatedDataset = await datasetService.updateDataset(
            datasetId,
            userId,
            updates
        )

        // Record the update
        await gdprService.recordDataAccess(
            userId,
            'dataset',
            datasetId,
            'update',
            req.ip,
            req.headers['user-agent']
        )

        res.status(200).json(updatedDataset)
    } catch (error: any) {
        if (error.message.includes('Not authorized')) {
            return res.status(403).json({ error: error.message })
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message })
        }
        console.error('Update dataset error:', error)
        res.status(500).json({ error: 'Failed to update dataset' })
    }
})

/**
 * Delete dataset
 * DELETE /datasets/:id
 */
datasetRouter.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id as string
        const datasetId = req.params.id

        // Delete the dataset
        await datasetService.deleteDataset(datasetId, userId)

        // Record the deletion
        await gdprService.recordDataAccess(
            userId,
            'dataset',
            datasetId,
            'delete',
            req.ip,
            req.headers['user-agent']
        )

        res.status(200).json({ message: 'Dataset deleted successfully' })
    } catch (error: any) {
        if (error.message.includes('Not authorized')) {
            return res.status(403).json({ error: error.message })
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: error.message })
        }
        console.error('Delete dataset error:', error)
        res.status(500).json({ error: 'Failed to delete dataset' })
    }
})

/**
 * Get AI-suggested categories for a dataset
 * GET /datasets/:id/suggest-categories
 */
datasetRouter.get('/:id/suggest-categories', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id as string
        const datasetId = req.params.id

        // Get the dataset
        const dataset = await datasetService.getDatasetById(datasetId)

        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' })
        }

        // Check if user has access
        if (dataset.ownerId !== userId && !dataset.isPublic) {
            return res.status(403).json({ error: 'Not authorized to access this dataset' })
        }

        // Get suggestions
        const categories = await aiService.suggestCulturalCategories(
            dataset.aiTags as string[],
            dataset.metadata
        )

        res.status(200).json({
            datasetId: dataset.id,
            suggestedCategories: categories
        })
    } catch (error) {
        console.error('Get category suggestions error:', error)
        res.status(500).json({ error: 'Failed to get category suggestions' })
    }
})

/**
 * Get access history for a dataset
 * GET /datasets/:id/access-history
 */
datasetRouter.get('/:id/access-history', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id as string
        const datasetId = req.params.id

        // Get the dataset
        const dataset = await datasetService.getDatasetById(datasetId)

        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' })
        }

        // Check if user owns the dataset
        if (dataset.ownerId !== userId) {
            return res.status(403).json({ error: 'Not authorized to view access history' })
        }

        // Get access history
        const accessHistory = await gdprService.getResourceAccessHistory('dataset', datasetId)

        res.status(200).json(accessHistory)
    } catch (error) {
        console.error('Get access history error:', error)
        res.status(500).json({ error: 'Failed to retrieve access history' })
    }
})
