"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const dataverse_controller_1 = require("../controllers/dataverse.controller");
const router = (0, express_1.Router)();
const dataverseController = new dataverse_controller_1.DataverseController();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for Dataverse uploads
    },
    fileFilter: (req, file, cb) => {
        // Allow most file types for cultural heritage uploads
        const allowedMimeTypes = [
            'text/plain',
            'text/csv',
            'application/pdf',
            'application/json',
            'application/xml',
            'text/xml',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/tiff',
            'audio/mpeg',
            'audio/wav',
            'video/mp4',
            'video/avi',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
            'application/x-tar'
        ];
        if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('text/')) {
            cb(null, true);
        }
        else {
            cb(new Error(`File type ${file.mimetype} not supported for Dataverse upload`));
        }
    }
});
/**
 * @route POST /api/dataverse/datasets
 * @desc Create a new dataset in Dataverse with DID integration
 * @access Private (requires authentication)
 */
router.post('/datasets', [
    (0, express_validator_1.body)('dataverseAlias')
        .notEmpty()
        .withMessage('Dataverse alias is required')
        .isString()
        .trim(),
    (0, express_validator_1.body)('metadata.title')
        .notEmpty()
        .withMessage('Dataset title is required')
        .isString()
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Title must be between 3 and 255 characters'),
    (0, express_validator_1.body)('metadata.description')
        .notEmpty()
        .withMessage('Dataset description is required')
        .isString()
        .trim()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),
    (0, express_validator_1.body)('metadata.authors')
        .isArray({ min: 1 })
        .withMessage('At least one author is required'),
    (0, express_validator_1.body)('metadata.authors.*.name')
        .notEmpty()
        .withMessage('Author name is required')
        .isString()
        .trim(),
    (0, express_validator_1.body)('metadata.contacts')
        .isArray({ min: 1 })
        .withMessage('At least one contact is required'),
    (0, express_validator_1.body)('metadata.contacts.*.name')
        .notEmpty()
        .withMessage('Contact name is required')
        .isString()
        .trim(),
    (0, express_validator_1.body)('metadata.contacts.*.email')
        .isEmail()
        .withMessage('Valid contact email is required'),
    (0, express_validator_1.body)('metadata.subjects')
        .isArray({ min: 1 })
        .withMessage('At least one subject is required'),
    (0, express_validator_1.body)('apiToken')
        .notEmpty()
        .withMessage('Dataverse API token is required')
        .isString()
        .trim(),
    (0, express_validator_1.body)('createLocalCopy')
        .optional()
        .isBoolean()
        .withMessage('createLocalCopy must be a boolean')
], dataverseController.createDataset.bind(dataverseController));
/**
 * @route POST /api/dataverse/datasets/:datasetId/files
 * @desc Upload a file to an existing Dataverse dataset
 * @access Private (requires authentication)
 */
router.post('/datasets/:datasetId/files', upload.single('file'), [
    (0, express_validator_1.param)('datasetId')
        .notEmpty()
        .withMessage('Dataset ID is required')
        .isString()
        .trim(),
    (0, express_validator_1.body)('apiToken')
        .notEmpty()
        .withMessage('Dataverse API token is required')
        .isString()
        .trim(),
    (0, express_validator_1.body)('metadata.description')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    (0, express_validator_1.body)('metadata.directoryLabel')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Directory label must not exceed 255 characters'),
    (0, express_validator_1.body)('metadata.categories')
        .optional()
        .isArray()
        .withMessage('Categories must be an array'),
    (0, express_validator_1.body)('metadata.restrict')
        .optional()
        .isBoolean()
        .withMessage('Restrict must be a boolean'),
    (0, express_validator_1.body)('enhanceWithAI')
        .optional()
        .isBoolean()
        .withMessage('enhanceWithAI must be a boolean')
], dataverseController.uploadFile.bind(dataverseController));
/**
 * @route POST /api/dataverse/datasets/:datasetId/sync
 * @desc Sync local dataset with Dataverse
 * @access Private (requires authentication)
 */
router.post('/datasets/:datasetId/sync', [
    (0, express_validator_1.param)('datasetId')
        .notEmpty()
        .withMessage('Dataset ID is required')
        .isString()
        .trim(),
    (0, express_validator_1.body)('apiToken')
        .notEmpty()
        .withMessage('Dataverse API token is required')
        .isString()
        .trim(),
    (0, express_validator_1.body)('direction')
        .optional()
        .isIn(['bidirectional', 'to_dataverse', 'from_dataverse'])
        .withMessage('Direction must be bidirectional, to_dataverse, or from_dataverse')
], dataverseController.syncDataset.bind(dataverseController));
/**
 * @route GET /api/dataverse/datasets/:datasetId
 * @desc Get dataset metadata from Dataverse
 * @access Public
 */
router.get('/datasets/:datasetId', [
    (0, express_validator_1.param)('datasetId')
        .notEmpty()
        .withMessage('Dataset ID is required')
        .isString()
        .trim(),
    (0, express_validator_1.query)('apiToken')
        .optional()
        .isString()
        .trim()
], dataverseController.getDataverseDataset.bind(dataverseController));
/**
 * @route GET /api/dataverse/datasets
 * @desc List user's datasets with Dataverse integration status
 * @access Private (requires authentication)
 */
router.get('/datasets', dataverseController.listDatasetsWithDataverseStatus.bind(dataverseController));
exports.default = router;
