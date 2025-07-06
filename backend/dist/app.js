"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const user_controller_1 = require("./controllers/user.controller");
const dataset_controller_1 = require("./controllers/dataset.controller");
const gdpr_controller_1 = require("./controllers/gdpr.controller");
const recommendation_controller_1 = require("./controllers/recommendation.controller");
const did_controller_1 = require("./controllers/did.controller");
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const dataverse_routes_1 = __importDefault(require("./routes/dataverse.routes"));
const body_parser_1 = require("body-parser");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Initialize Express app
const app = (0, express_1.default)();
// Load environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
// Ensure upload directory exists
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
// Configure middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, body_parser_1.json)({ limit: '5mb' })); // JSON body parsing
app.use((0, body_parser_1.urlencoded)({ extended: true })); // URL-encoded body parsing
// Configure logging
if (NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    // Create a log directory if it doesn't exist
    const logDir = 'logs';
    if (!fs_1.default.existsSync(logDir)) {
        fs_1.default.mkdirSync(logDir);
    }
    // Create a write stream for logs
    const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(logDir, 'access.log'), { flags: 'a' });
    app.use((0, morgan_1.default)('combined', { stream: accessLogStream }));
}
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        version: process.env.npm_package_version || '1.0.0',
        environment: NODE_ENV
    });
});
// Configure routes
app.use('/api/users', user_controller_1.userRouter);
app.use('/api/datasets', dataset_controller_1.datasetRouter);
app.use('/api/dids', did_controller_1.didRouter);
app.use('/api/gdpr', gdpr_controller_1.gdprRouter);
app.use('/api/recommendations', recommendation_controller_1.recommendationRouter);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/dataverse', dataverse_routes_1.default);
// API Documentation route
app.get('/api/docs', (req, res) => {
    res.status(200).json({
        name: 'Sapphire API',
        description: 'GDPR-compliant Decentralised Identifier (DID) system API',
        version: process.env.npm_package_version || '1.0.0',
        endpoints: {
            users: '/api/users',
            datasets: '/api/datasets',
            dids: '/api/dids'
        },
        documentation: 'https://github.com/yourusername/sapphire/blob/main/README.md'
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `The requested resource ${req.path} was not found`
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        error: message,
        stack: NODE_ENV === 'development' ? err.stack : undefined
    });
});
exports.default = app;
