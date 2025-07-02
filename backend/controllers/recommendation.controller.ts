import { Router, Request, Response } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { authenticateUser } from './user.controller';

export const recommendationRouter = Router();
const recommendationService = new RecommendationService();

/**
 * Get recommendations for a given dataset from a pool of available datasets.
 * POST /recommendations/for-dataset
 */
recommendationRouter.post('/for-dataset', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { seedDataset, availableDatasets, options } = req.body;

    if (!seedDataset || !availableDatasets) {
      return res.status(400).json({ error: 'seedDataset and availableDatasets are required.' });
    }

    const recommendations = await recommendationService.getRecommendationsForDataset(
      seedDataset,
      availableDatasets,
      options
    );

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Get Recommendations Error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * Perform an enhanced search over a pool of available datasets.
 * POST /recommendations/search
 */
recommendationRouter.post('/search', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { query, availableDatasets, options } = req.body;

    if (!query || !availableDatasets) {
      return res.status(400).json({ error: 'query and availableDatasets are required.' });
    }

    const results = await recommendationService.enhancedSearch(
      query,
      availableDatasets,
      options
    );

    res.status(200).json(results);
  } catch (error) {
    console.error('Enhanced Search Error:', error);
    res.status(500).json({ error: 'Failed to perform enhanced search' });
  }
});
