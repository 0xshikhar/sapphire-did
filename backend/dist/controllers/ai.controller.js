"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const ai_service_1 = require("../services/ai.service");
const express_validator_1 = require("express-validator");
class AIController {
    constructor() {
        this.aiService = new ai_service_1.AIService();
    }
    /**
     * Enhance metadata description using AI
     */
    async enhanceDescription(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ error: 'Invalid input', details: errors.array() });
                return;
            }
            const { title, description, tags } = req.body;
            const enhancedDescription = await this.aiService.generateEnhancedDescription(title || '', description || '', tags || []);
            res.json({ enhancedDescription });
        }
        catch (error) {
            console.error('Error enhancing description:', error);
            res.status(500).json({ error: 'Failed to enhance description' });
        }
    }
    /**
     * Extract tags from text content
     */
    async extractTags(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ error: 'Invalid input', details: errors.array() });
                return;
            }
            const { content, mimeType } = req.body;
            if (!content) {
                res.status(400).json({ error: 'Content is required' });
                return;
            }
            // Convert content to buffer for processing
            const contentBuffer = Buffer.from(content, 'utf-8');
            const tags = await this.aiService.extractTags(contentBuffer, mimeType || 'text/plain');
            res.json({ tags });
        }
        catch (error) {
            console.error('Error extracting tags:', error);
            res.status(500).json({ error: 'Failed to extract tags' });
        }
    }
    /**
     * Suggest cultural heritage categories
     */
    async suggestCategories(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ error: 'Invalid input', details: errors.array() });
                return;
            }
            const { tags, metadata } = req.body;
            const categories = await this.aiService.suggestCulturalCategories(tags || [], metadata || {});
            res.json({ categories });
        }
        catch (error) {
            console.error('Error suggesting categories:', error);
            res.status(500).json({ error: 'Failed to suggest categories' });
        }
    }
    /**
     * Process file upload with AI analysis
     */
    async analyzeFile(req, res) {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({ error: 'No file uploaded' });
                return;
            }
            // Extract tags from file
            const tags = await this.aiService.extractTags(file.buffer, file.mimetype);
            // Generate enhanced description if text content is available
            let enhancedDescription = '';
            if (file.mimetype.startsWith('text/')) {
                const textContent = file.buffer.toString('utf-8', 0, Math.min(5000, file.buffer.length));
                enhancedDescription = await this.aiService.generateEnhancedDescription(file.originalname, 'Uploaded file analysis', tags);
            }
            // Suggest cultural categories
            const categories = await this.aiService.suggestCulturalCategories(tags, {
                filename: file.originalname,
                mimeType: file.mimetype,
                size: file.size
            });
            res.json({
                filename: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                tags,
                enhancedDescription,
                suggestedCategories: categories,
                analysis: {
                    processedAt: new Date().toISOString(),
                    aiEnabled: true
                }
            });
        }
        catch (error) {
            console.error('Error analyzing file:', error);
            res.status(500).json({ error: 'Failed to analyze file' });
        }
    }
}
exports.AIController = AIController;
