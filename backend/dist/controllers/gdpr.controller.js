"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gdprRouter = void 0;
const express_1 = require("express");
const gdpr_service_1 = require("../services/gdpr.service");
const user_controller_1 = require("./user.controller"); // Assuming this is the correct path
const consent_config_1 = require("../config/consent.config");
exports.gdprRouter = (0, express_1.Router)();
const gdprService = new gdpr_service_1.GDPRService();
/**
 * Get the current user's consent status for all defined consent types.
 * GET /gdpr/status
 */
exports.gdprRouter.get('/status', user_controller_1.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const consentStatus = await gdprService.getConsentStatus(userId);
        res.status(200).json(consentStatus);
    }
    catch (error) {
        console.error('Get Consent Status Error:', error);
        res.status(500).json({ error: 'Failed to retrieve consent status' });
    }
});
/**
 * Update a user's consent for a specific type.
 * POST /gdpr/consent
 */
exports.gdprRouter.post('/consent', user_controller_1.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { consentType, isGranted } = req.body;
        if (!consentType || !consent_config_1.ALL_CONSENT_TYPES.includes(consentType) || typeof isGranted !== 'boolean') {
            return res.status(400).json({ error: 'Invalid input: consentType and isGranted are required.' });
        }
        await gdprService.recordConsent(userId, consentType, isGranted, req.ip, req.headers['user-agent']);
        res.status(200).json({ message: 'Consent updated successfully' });
    }
    catch (error) {
        console.error('Update Consent Error:', error);
        res.status(500).json({ error: 'Failed to update consent' });
    }
});
/**
 * Export all user data for the authenticated user.
 * POST /gdpr/export
 */
exports.gdprRouter.post('/export', user_controller_1.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userData = await gdprService.exportUserData(userId);
        res.setHeader('Content-Disposition', 'attachment; filename="sapphire_user_data.json"');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(userData);
    }
    catch (error) {
        console.error('Export User Data Error:', error);
        res.status(500).json({ error: 'Failed to export user data' });
    }
});
/**
 * Delete all data for the authenticated user.
 * DELETE /gdpr/account
 */
exports.gdprRouter.delete('/account', user_controller_1.authenticateUser, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Using hard delete as per typical user expectation for this action
        await gdprService.deleteUserData(userId, false);
        res.status(200).json({ message: 'User account and all associated data have been permanently deleted.' });
    }
    catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});
