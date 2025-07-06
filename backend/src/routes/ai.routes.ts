import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { AIController } from '../controllers/ai.controller';

const router = Router();
const aiController = new AIController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
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
    } else {
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
  body('title').optional().isString().trim(),
  body('description').optional().isString().trim(),
  body('tags').optional().isArray()
], aiController.enhanceDescription.bind(aiController));

/**
 * @route POST /api/ai/extract-tags
 * @desc Extract tags from text content
 * @access Public (in development)
 */
router.post('/extract-tags', [
  body('content').notEmpty().withMessage('Content is required'),
  body('mimeType').optional().isString().trim()
], aiController.extractTags.bind(aiController));

/**
 * @route POST /api/ai/suggest-categories
 * @desc Suggest cultural heritage categories
 * @access Public (in development)
 */
router.post('/suggest-categories', [
  body('tags').optional().isArray(),
  body('metadata').optional().isObject()
], aiController.suggestCategories.bind(aiController));

/**
 * @route POST /api/ai/analyze-file
 * @desc Analyze uploaded file with AI
 * @access Public (in development)
 */
router.post('/analyze-file', 
  upload.single('file'),
  aiController.analyzeFile.bind(aiController)
);

export default router;