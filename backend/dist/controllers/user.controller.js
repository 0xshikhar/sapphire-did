"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.userRouter = void 0;
const express_1 = require("express");
const user_service_1 = require("../services/user.service");
const gdpr_service_1 = require("../services/gdpr.service");
const jwt = __importStar(require("jsonwebtoken"));
exports.userRouter = (0, express_1.Router)();
const userService = new user_service_1.UserService();
const gdprService = new gdpr_service_1.GDPRService();
/**
 * Middleware to authenticate user from JWT token
 */
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Invalid authorization format' });
        }
        const jwtSecret = process.env.JWT_SECRET || 'sapphire-dev-secret';
        const decoded = jwt.verify(token, jwtSecret);
        if (!decoded || !decoded.userId || !decoded.did) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }
        // Attach user to request object
        req.user = { id: decoded.userId, did: decoded.did };
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication error' });
    }
};
exports.authenticateUser = authenticateUser;
/**
 * Get current user profile
 * GET /users/me
 */
exports.userRouter.get('/me', exports.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = await userService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});
/**
 * Update user profile
 * PATCH /users/me
 */
exports.userRouter.patch('/me', exports.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { profile } = req.body;
        if (!profile || typeof profile !== 'object') {
            return res.status(400).json({ error: 'Profile data is required' });
        }
        const updatedUser = await userService.updateUserProfile(userId, profile);
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
/**
 * Export user data (GDPR data portability)
 * GET /users/export-data
 */
exports.userRouter.get('/export-data', exports.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userData = await gdprService.exportUserData(userId);
        // Record the export
        await gdprService.recordDataAccess(userId, 'user', userId, 'read', req.ip, req.headers['user-agent']);
        // Set filename with user ID and date
        const filename = `user-data-${userId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(userData);
    }
    catch (error) {
        console.error('Data export error:', error);
        res.status(500).json({ error: 'Failed to export user data' });
    }
});
/**
 * Delete user account (GDPR right to erasure)
 * DELETE /users/me
 */
exports.userRouter.delete('/me', exports.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { confirmation } = req.body;
        if (confirmation !== 'DELETE_MY_ACCOUNT') {
            return res.status(400).json({
                error: 'Please provide confirmation to delete your account'
            });
        }
        // Choose soft delete by default for safety
        const softDelete = req.query.hardDelete !== 'true';
        await gdprService.deleteUserData(userId, softDelete);
        res.status(200).json({
            message: softDelete
                ? 'Account anonymized successfully'
                : 'Account deleted successfully'
        });
    }
    catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});
/**
 * Manage user consent
 * POST /users/consent
 */
exports.userRouter.post('/consent', exports.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { consentType, isGranted } = req.body;
        if (!consentType || typeof isGranted !== 'boolean') {
            return res.status(400).json({
                error: 'Consent type and granted status are required'
            });
        }
        const consent = await gdprService.recordConsent(userId, consentType, isGranted, req.ip, req.headers['user-agent']);
        res.status(200).json({
            message: `Consent ${isGranted ? 'granted' : 'revoked'} successfully`,
            consent
        });
    }
    catch (error) {
        console.error('Consent management error:', error);
        res.status(500).json({ error: 'Failed to update consent preferences' });
    }
});
/**
 * Get user consent history
 * GET /users/consent
 */
exports.userRouter.get('/consent', exports.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const consents = await gdprService.getUserConsents(userId);
        res.status(200).json(consents);
    }
    catch (error) {
        console.error('Get consent history error:', error);
        res.status(500).json({ error: 'Failed to retrieve consent history' });
    }
});
/**
 * Revoke a specific consent
 * DELETE /users/consent/:id
 */
exports.userRouter.delete('/consent/:id', exports.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const consentId = req.params.id;
        const updatedConsent = await gdprService.revokeConsent(consentId, userId);
        res.status(200).json({
            message: 'Consent revoked successfully',
            consent: updatedConsent
        });
    }
    catch (error) {
        if (error.message.includes('not found') || error.message.includes('Not authorized')) {
            return res.status(404).json({ error: error.message });
        }
        console.error('Revoke consent error:', error);
        res.status(500).json({ error: 'Failed to revoke consent' });
    }
});
