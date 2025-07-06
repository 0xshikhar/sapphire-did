import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../types/request.types';
import { GDPRService } from '../services/gdpr.service';
import { authenticateUser } from './user.controller'; // Assuming this is the correct path
import { ConsentType, ALL_CONSENT_TYPES } from '../config/consent.config';

export const gdprRouter = Router();
const gdprService = new GDPRService();

/**
 * Get the current user's consent status for all defined consent types.
 * GET /gdpr/status
 */
gdprRouter.get('/status', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const consentStatus = await gdprService.getConsentStatus(userId);
    res.status(200).json(consentStatus);
  } catch (error) {
    console.error('Get Consent Status Error:', error);
    res.status(500).json({ error: 'Failed to retrieve consent status' });
  }
});

/**
 * Update a user's consent for a specific type.
 * POST /gdpr/consent
 */
gdprRouter.post('/consent', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const { consentType, isGranted } = req.body as { consentType: ConsentType; isGranted: boolean };

    if (!consentType || !ALL_CONSENT_TYPES.includes(consentType) || typeof isGranted !== 'boolean') {
      return res.status(400).json({ error: 'Invalid input: consentType and isGranted are required.' });
    }

    await gdprService.recordConsent(
      userId,
      consentType,
      isGranted,
      req.ip,
      req.headers['user-agent']
    );

    res.status(200).json({ message: 'Consent updated successfully' });
  } catch (error) {
    console.error('Update Consent Error:', error);
    res.status(500).json({ error: 'Failed to update consent' });
  }
});

/**
 * Export all user data for the authenticated user.
 * POST /gdpr/export
 */
gdprRouter.post('/export', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const userData = await gdprService.exportUserData(userId);

    res.setHeader('Content-Disposition', 'attachment; filename="sapphire_user_data.json"');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(userData);
  } catch (error) {
    console.error('Export User Data Error:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

/**
 * Delete all data for the authenticated user.
 * DELETE /gdpr/account
 */
gdprRouter.delete('/account', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id as string;
    // Using hard delete as per typical user expectation for this action
    await gdprService.deleteUserData(userId, false);

    res.status(200).json({ message: 'User account and all associated data have been permanently deleted.' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});
