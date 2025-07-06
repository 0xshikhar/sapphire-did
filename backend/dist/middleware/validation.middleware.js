"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.validateContentType = exports.createSuccessResponse = exports.createErrorResponse = exports.validate = void 0;
const express_validator_1 = require("express-validator");
/**
 * Middleware to validate request data using express-validator
 * @param validations Array of validation chains to apply
 */
const validate = (validations) => {
    return async (req, res, next) => {
        // Execute all validations
        await Promise.all(validations.map(validation => validation.run(req)));
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        // Format validation errors
        const formattedErrors = errors.array({ onlyFirstError: true }).map(err => {
            switch (err.type) {
                case 'field':
                    return {
                        field: err.path,
                        message: err.msg,
                        value: err.value,
                    };
                case 'alternative':
                    return {
                        field: 'alternatives',
                        message: err.msg,
                        nestedErrors: err.nestedErrors.map((nested) => nested.path),
                    };
                default:
                    return {
                        field: 'unknown',
                        message: err.msg,
                    };
            }
        });
        // Return validation errors
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: formattedErrors
        });
    };
};
exports.validate = validate;
/**
 * Helper function to create custom error responses
 */
const createErrorResponse = (res, status, message, details) => {
    return res.status(status).json({
        status: 'error',
        message,
        details: details || undefined
    });
};
exports.createErrorResponse = createErrorResponse;
/**
 * Helper function to create success responses
 */
const createSuccessResponse = (res, status, message, data) => {
    return res.status(status).json({
        status: 'success',
        message,
        data: data || undefined
    });
};
exports.createSuccessResponse = createSuccessResponse;
/**
 * Middleware to validate content type for specific routes
 * @param allowedTypes Array of allowed MIME types
 */
const validateContentType = (allowedTypes) => {
    return (req, res, next) => {
        var _a;
        // Skip validation if no content type (e.g. GET requests)
        if (!req.headers['content-type'] && req.method === 'GET') {
            return next();
        }
        const contentType = ((_a = req.headers['content-type']) === null || _a === void 0 ? void 0 : _a.split(';')[0].trim()) || '';
        if (allowedTypes.includes(contentType)) {
            return next();
        }
        return (0, exports.createErrorResponse)(res, 415, `Unsupported Content-Type. Expected one of: ${allowedTypes.join(', ')}`, { provided: contentType });
    };
};
exports.validateContentType = validateContentType;
/**
 * Middleware to handle async errors in route handlers
 * @param fn Async route handler function
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
