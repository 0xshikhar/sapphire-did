"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
class RecommendationService {
    async getRecommendationsForDataset(seedDataset, availableDatasets, options = {}) {
        const { maxResults = 5, minScore = 0.4, includeTypes = ['similar', 'complementary', 'educational', 'research'] } = options;
        const recommendations = [];
        for (const dataset of availableDatasets) {
            if (dataset.id === seedDataset.id)
                continue;
            const score = this.calculateMockRelevanceScore(seedDataset, dataset);
            if (score < minScore)
                continue;
            const type = this.determineMockRecommendationType(seedDataset, dataset);
            if (!includeTypes.includes(type))
                continue;
            const matchReason = this.generateMatchReason(seedDataset, dataset, type, score);
            recommendations.push({ dataset, score, matchReason, type });
        }
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
    }
    async enhancedSearch(query, availableDatasets, options = {}) {
        // This is a simplified mock search. A real implementation would be more complex.
        const { maxResults = 10 } = options;
        const queryText = (query.text || '').toLowerCase();
        const queryTags = new Set(query.tags || []);
        const scoredResults = availableDatasets.map(dataset => {
            let score = 0;
            const datasetName = (dataset.name || '').toLowerCase();
            const datasetSubjects = new Set(dataset.subjects || []);
            if (queryText && datasetName.includes(queryText)) {
                score += 0.5;
            }
            if (queryTags.size > 0) {
                const tagMatches = [...datasetSubjects].filter(subject => queryTags.has(subject));
                score += (tagMatches.length / queryTags.size) * 0.5;
            }
            return Object.assign(Object.assign({}, dataset), { score });
        });
        return scoredResults
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
    }
    calculateMockRelevanceScore(seedDataset, targetDataset) {
        let score = 0.3;
        const seedTitle = (seedDataset.name || '').toLowerCase();
        const targetTitle = (targetDataset.name || '').toLowerCase();
        if (seedTitle && targetTitle) {
            const titleWords = new Set(seedTitle.split(/\W+/).filter(w => w.length > 3));
            const targetWords = new Set(targetTitle.split(/\W+/).filter(w => w.length > 3));
            let matches = 0;
            for (const word of titleWords) {
                if (targetWords.has(word))
                    matches++;
            }
            score += (matches / Math.max(1, titleWords.size)) * 0.2;
        }
        const seedSubjects = new Set(seedDataset.subjects || []);
        const targetSubjects = new Set(targetDataset.subjects || []);
        if (seedSubjects.size > 0 && targetSubjects.size > 0) {
            let matches = 0;
            for (const subject of seedSubjects) {
                if (targetSubjects.has(subject))
                    matches++;
            }
            score += (matches / Math.max(1, seedSubjects.size)) * 0.3;
        }
        if (seedDataset.publisher && targetDataset.publisher && seedDataset.publisher === targetDataset.publisher) {
            score += 0.1;
        }
        score += Math.random() * 0.1;
        return Math.min(1.0, score);
    }
    determineMockRecommendationType(seedDataset, targetDataset) {
        const val = Math.floor(Math.random() * 4);
        switch (val) {
            case 0: return 'similar';
            case 1: return 'complementary';
            case 2: return 'educational';
            default: return 'research';
        }
    }
    generateMatchReason(seedDataset, targetDataset, type, score) {
        const seedTitle = seedDataset.name || 'this dataset';
        switch (type) {
            case 'similar': return `Similar subject matter to ${seedTitle}`;
            case 'complementary': return `Complements ${seedTitle} with additional context`;
            case 'educational': return `Educational resource related to the topics in ${seedTitle}`;
            case 'research': return `Research that builds upon or references similar concepts`;
            default: return `Related to ${seedTitle}`;
        }
    }
}
exports.RecommendationService = RecommendationService;
