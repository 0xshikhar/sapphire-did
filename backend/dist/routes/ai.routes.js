"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
const aiController = new ai_controller_1.AIController();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common file types for cultural heritage
        const allowedMimeTypes = [
            'text/plain',
            'text/csv',
            'application/pdf',
            'application/json',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('File type not supported for AI analysis'));
        }
    }
});
/**
 * @route POST /api/ai/enhance-description
 * @desc Enhance metadata description using AI
 * @access Public (in development)
 */
router.post('/enhance-description', [
    (0, express_validator_1.body)('title').optional().isString().trim(),
    (0, express_validator_1.body)('description').optional().isString().trim(),
    (0, express_validator_1.body)('tags').optional().isArray()
], aiController.enhanceDescription.bind(aiController));
/**
 * @route POST /api/ai/extract-tags
 * @desc Extract tags from text content
 * @access Public (in development)
 */
router.post('/extract-tags', [
    (0, express_validator_1.body)('content').notEmpty().withMessage('Content is required'),
    (0, express_validator_1.body)('mimeType').optional().isString().trim()
], aiController.extractTags.bind(aiController));
/**
 * @route POST /api/ai/suggest-categories
 * @desc Suggest cultural heritage categories
 * @access Public (in development)
 */
router.post('/suggest-categories', [
    (0, express_validator_1.body)('tags').optional().isArray(),
    (0, express_validator_1.body)('metadata').optional().isObject()
], aiController.suggestCategories.bind(aiController));
/**
 * @route POST /api/ai/analyze-file
 * @desc Analyze uploaded file with AI
 * @access Public (in development)
 */
router.post('/analyze-file', upload.single('file'), aiController.analyzeFile.bind(aiController));
exports.default = router;
