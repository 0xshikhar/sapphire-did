"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GDPRService = void 0;
const database_service_1 = require("./database.service");
const consent_config_1 = require("../config/consent.config");
/**
 * Service for GDPR compliance features
 * Handles data protection, consent management, and user rights
 */
class GDPRService {
    /**
     * Record user consent for a specific purpose
     * @param userId User ID
     * @param consentType Type of consent (e.g., 'data_processing', 'marketing')
     * @param isGranted Whether consent is granted or denied
     * @param ipAddress Optional IP address for audit
     * @param userAgent Optional user agent for audit
     * @returns Created consent record
     */
    async recordConsent(userId, consentType, isGranted, ipAddress, userAgent) {
        // Revoke previous consent of same type if it exists
        await database_service_1.db.consentRecord.updateMany({
            where: {
                userId,
                consentType,
                isGranted: true,
                revokedAt: null
            },
            data: { revokedAt: new Date() }
        });
        // Create new consent record
        const consentRecord = await database_service_1.db.consentRecord.create({
            data: {
                userId,
                consentType,
                isGranted,
                ipAddress,
                userAgent
            }
        });
        // Log the consent action in audit trail
        await database_service_1.db.auditLog.create({
            data: {
                action: isGranted ? 'grant_consent' : 'revoke_consent',
                resource: 'consent',
                resourceId: consentRecord.id,
                userId,
                ipAddress,
                userAgent,
                details: { consentType }
            }
        });
        return consentRecord;
    }
    /**
     * Check if user has given consent for a specific purpose
     * @param userId User ID
     * @param consentType Type of consent to check
     * @returns Whether consent is currently valid
     */
    async hasValidConsent(userId, consentType) {
        const consent = await database_service_1.db.consentRecord.findFirst({
            where: {
                userId,
                consentType,
                isGranted: true,
                revokedAt: null
            },
            orderBy: {
                consentedAt: 'desc'
            }
        });
        return !!consent;
    }
    /**
     * Get all consent records for a user
     * @param userId User ID
     * @returns Array of consent records
     */
    /**
     * Get the current status of all consent types for a user.
     * @param userId User ID
     * @returns A map of consent types to their grant status.
     */
    async getConsentStatus(userId) {
        const activeConsents = await database_service_1.db.consentRecord.findMany({
            where: {
                userId,
                isGranted: true,
                revokedAt: null,
                consentType: { in: consent_config_1.ALL_CONSENT_TYPES },
            },
            distinct: ['consentType'],
            orderBy: {
                consentedAt: 'desc',
            },
        });
        const consentStatus = {};
        for (const type of consent_config_1.ALL_CONSENT_TYPES) {
            consentStatus[type] = activeConsents.some(c => c.consentType === type);
        }
        return consentStatus;
    }
    /**
     * Get all historical consent records for a user.
     * @param userId User ID
     * @returns Array of consent records, ordered by date.
     */
    async getConsentHistory(userId) {
        return await database_service_1.db.consentRecord.findMany({
            where: { userId },
            orderBy: { consentedAt: 'desc' },
        });
    }
    /**
     * Revoke a user's active consent for a specific type.
     * This is more user-friendly than revoking by a specific ID.
     * @param userId User ID
     * @param consentType The type of consent to revoke
     * @returns The updated (revoked) consent record, or null if no active consent was found.
     */
    async revokeConsentByType(userId, consentType) {
        const activeConsent = await database_service_1.db.consentRecord.findFirst({
            where: {
                userId,
                consentType,
                isGranted: true,
                revokedAt: null,
            },
            orderBy: {
                consentedAt: 'desc',
            },
        });
        if (!activeConsent) {
            // No active consent of this type to revoke.
            // This is not an error condition.
            return null;
        }
        return this.revokeConsent(activeConsent.id, userId);
    }
    /**
     * Get all consent records for a user
     * @param userId User ID
     * @returns Array of consent records
     * @deprecated Use getConsentHistory for a full list or getConsentStatus for current state.
     */
    async getUserConsents(userId) {
        return await database_service_1.db.consentRecord.findMany({
            where: { userId },
            orderBy: { consentedAt: 'desc' }
        });
    }
    /**
     * Revoke a specific consent record
     * @param consentId Consent record ID
     * @param userId User ID performing the revocation (for authorization)
     * @returns Updated consent record
     */
    async revokeConsent(consentId, userId) {
        const consent = await database_service_1.db.consentRecord.findUnique({
            where: { id: consentId }
        });
        if (!consent) {
            throw new Error('Consent record not found');
        }
        if (consent.userId !== userId) {
            throw new Error('Not authorized to revoke this consent');
        }
        if (consent.revokedAt) {
            throw new Error('Consent already revoked');
        }
        return await database_service_1.db.consentRecord.update({
            where: { id: consentId },
            data: { revokedAt: new Date() }
        });
    }
    /**
     * Export all user data for GDPR data portability
     * @param userId User ID
     * @returns Complete user data object
     */
    async exportUserData(userId) {
        // Check if user exists
        const userExists = await database_service_1.db.user.findUnique({
            where: { id: userId }
        });
        if (!userExists) {
            throw new Error('User not found');
        }
        // Gather all data related to the user
        const [user, datasets, consents, didDocuments, shares, auditLogs] = await Promise.all([
            database_service_1.db.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    did: true,
                    profile: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            database_service_1.db.dataset.findMany({
                where: { ownerId: userId },
                include: {
                    shares: true,
                },
            }),
            database_service_1.db.consentRecord.findMany({
                where: { userId },
            }),
            database_service_1.db.dIDDocument.findMany({
                where: { userId },
            }),
            database_service_1.db.datasetShare.findMany({
                where: {
                    OR: [{ sharedById: userId }, { sharedWithId: userId }],
                },
            }),
            database_service_1.db.auditLog.findMany({
                where: { userId },
            }),
        ]);
        return {
            user,
            datasets,
            consents,
            didDocuments,
            shares,
            auditLogs,
            exportDate: new Date(),
            exportFormat: 'JSON',
            gdprInfo: {
                controller: 'Sapphire DID Project',
                contactEmail: 'privacy@sapphire-project.example.com',
                exportRequestedAt: new Date(),
                dataRetentionPolicy: 'https://sapphire-project.example.com/#/retention',
            },
        };
    }
    /**
     * Delete all user data (right to erasure / right to be forgotten)
     * @param userId User ID
     * @param softDelete If true, anonymize data instead of hard delete
     * @returns Success status
     */
    async deleteUserData(userId, softDelete = false) {
        // Check if user exists
        const user = await database_service_1.db.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (softDelete) {
            // Anonymize user data rather than deleting
            await database_service_1.db.user.update({
                where: { id: userId },
                data: {
                    email: `deleted-${Date.now()}@anonymized.com`,
                    profile: { deleted: true, anonymizedAt: new Date() },
                },
            });
            // Mark datasets as anonymized
            await database_service_1.db.dataset.updateMany({
                where: { ownerId: userId },
                data: {
                    title: 'Anonymized Dataset',
                    description: 'This dataset has been anonymized',
                    metadata: { anonymized: true, anonymizedAt: new Date() },
                },
            });
            // Add anonymization audit log
            await database_service_1.db.auditLog.create({
                data: {
                    action: 'anonymize',
                    resource: 'user',
                    resourceId: userId,
                    details: { reason: 'GDPR right to be forgotten request' },
                },
            });
        }
        else {
            // Hard delete all user data
            // Using a transaction to ensure all-or-nothing deletion
            await database_service_1.db.$transaction([
                // Delete audit logs first (no cascade needed)
                database_service_1.db.auditLog.deleteMany({ where: { userId } }),
                // Delete consent records
                database_service_1.db.consentRecord.deleteMany({ where: { userId } }),
                // Delete dataset shares related to this user
                database_service_1.db.datasetShare.deleteMany({
                    where: {
                        OR: [{ sharedById: userId }, { sharedWithId: userId }],
                    },
                }),
                // Delete DID documents
                database_service_1.db.dIDDocument.deleteMany({ where: { userId } }),
                // Delete datasets owned by the user
                database_service_1.db.dataset.deleteMany({ where: { ownerId: userId } }),
                // Finally delete the user
                database_service_1.db.user.delete({ where: { id: userId } }),
            ]);
            // Add deletion audit log (without user reference)
            await database_service_1.db.auditLog.create({
                data: {
                    action: 'delete',
                    resource: 'user',
                    resourceId: userId,
                    details: { reason: 'GDPR right to be forgotten request' },
                },
            });
        }
        return true;
    }
    /**
     * Record data access for auditing purposes
     * @param userId User ID accessing the data
     * @param resourceType Type of resource being accessed
     * @param resourceId ID of the resource
     * @param action Action being performed
     * @param ipAddress IP address of the user
     * @returns Created audit log
     */
    async recordDataAccess(userId, resourceType, resourceId, action, ipAddress, userAgent) {
        return await database_service_1.db.auditLog.create({
            data: {
                userId,
                action,
                resource: resourceType,
                resourceId,
                ipAddress,
                userAgent,
                timestamp: new Date()
            }
        });
    }
    /**
     * Get data access history for a resource
     * @param resourceType Type of resource
     * @param resourceId ID of the resource
     * @returns Array of audit logs
     */
    async getResourceAccessHistory(resourceType, resourceId) {
        return await database_service_1.db.auditLog.findMany({
            where: {
                resource: resourceType,
                resourceId
            },
            orderBy: {
                timestamp: 'desc'
            },
        });
    }
}
exports.GDPRService = GDPRService;
