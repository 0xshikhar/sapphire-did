"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationRouter = void 0;
const express_1 = require("express");
const recommendation_service_1 = require("../services/recommendation.service");
const user_controller_1 = require("./user.controller");
exports.recommendationRouter = (0, express_1.Router)();
const recommendationService = new recommendation_service_1.RecommendationService();
/**
 * Get recommendations for a given dataset from a pool of available datasets.
 * POST /recommendations/for-dataset
 */
exports.recommendationRouter.post('/for-dataset', user_controller_1.authenticateUser, async (req, res) => {
    try {
        const { seedDataset, availableDatasets, options } = req.body;
        if (!seedDataset || !availableDatasets) {
            return res.status(400).json({ error: 'seedDataset and availableDatasets are required.' });
        }
        const recommendations = await recommendationService.getRecommendationsForDataset(seedDataset, availableDatasets, options);
        res.status(200).json(recommendations);
    }
    catch (error) {
        console.error('Get Recommendations Error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});
/**
 * Perform an enhanced search over a pool of available datasets.
 * POST /recommendations/search
 */
exports.recommendationRouter.post('/search', user_controller_1.authenticateUser, async (req, res) => {
    try {
        const { query, availableDatasets, options } = req.body;
        if (!query || !availableDatasets) {
            return res.status(400).json({ error: 'query and availableDatasets are required.' });
        }
        const results = await recommendationService.enhancedSearch(query, availableDatasets, options);
        res.status(200).json(results);
    }
    catch (error) {
        console.error('Enhanced Search Error:', error);
        res.status(500).json({ error: 'Failed to perform enhanced search' });
    }
});
