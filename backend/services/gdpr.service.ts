import { db } from './database.service'
import { ConsentRecord } from '@prisma/client'
import { ConsentType, ALL_CONSENT_TYPES } from '../config/consent.config'

/**
 * Service for GDPR compliance features
 * Handles data protection, consent management, and user rights
 */
export class GDPRService {
  /**
   * Record user consent for a specific purpose
   * @param userId User ID
   * @param consentType Type of consent (e.g., 'data_processing', 'marketing')
   * @param isGranted Whether consent is granted or denied
   * @param ipAddress Optional IP address for audit
   * @param userAgent Optional user agent for audit
   * @returns Created consent record
   */
  async recordConsent(
    userId: string,
    consentType: ConsentType,
    isGranted: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ConsentRecord> {
    // Revoke previous consent of same type if it exists
    await db.consentRecord.updateMany({
      where: { 
        userId, 
        consentType, 
        isGranted: true,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    })

    // Create new consent record
    const consentRecord = await db.consentRecord.create({
      data: {
        userId,
        consentType,
        isGranted,
        ipAddress,
        userAgent
      }
    })

    // Log the consent action in audit trail
    await db.auditLog.create({
      data: {
        action: isGranted ? 'grant_consent' : 'revoke_consent',
        resource: 'consent',
        resourceId: consentRecord.id,
        userId,
        ipAddress,
        userAgent,
        details: { consentType }
      }
    })

    return consentRecord
  }

  /**
   * Check if user has given consent for a specific purpose
   * @param userId User ID
   * @param consentType Type of consent to check
   * @returns Whether consent is currently valid
   */
  async hasValidConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    const consent = await db.consentRecord.findFirst({
      where: {
        userId,
        consentType,
        isGranted: true,
        revokedAt: null
      },
      orderBy: {
        consentedAt: 'desc'
      }
    })

    return !!consent
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
  async getConsentStatus(userId: string): Promise<Record<ConsentType, boolean>> {
    const activeConsents = await db.consentRecord.findMany({
      where: {
        userId,
        isGranted: true,
        revokedAt: null,
        consentType: { in: ALL_CONSENT_TYPES },
      },
      distinct: ['consentType'],
      orderBy: {
        consentedAt: 'desc',
      },
    });

    const consentStatus: Record<ConsentType, boolean> = {} as any;

    for (const type of ALL_CONSENT_TYPES) {
      consentStatus[type] = activeConsents.some(c => c.consentType === type);
    }

    return consentStatus;
  }

  /**
   * Get all historical consent records for a user.
   * @param userId User ID
   * @returns Array of consent records, ordered by date.
   */
  async getConsentHistory(userId: string): Promise<ConsentRecord[]> {
    return await db.consentRecord.findMany({
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
  async revokeConsentByType(userId: string, consentType: ConsentType): Promise<ConsentRecord | null> {
    const activeConsent = await db.consentRecord.findFirst({
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
  async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    return await db.consentRecord.findMany({
      where: { userId },
      orderBy: { consentedAt: 'desc' }
    })
  }

  /**
   * Revoke a specific consent record
   * @param consentId Consent record ID
   * @param userId User ID performing the revocation (for authorization)
   * @returns Updated consent record
   */
  async revokeConsent(consentId: string, userId: string): Promise<ConsentRecord> {
    const consent = await db.consentRecord.findUnique({
      where: { id: consentId }
    })

    if (!consent) {
      throw new Error('Consent record not found')
    }

    if (consent.userId !== userId) {
      throw new Error('Not authorized to revoke this consent')
    }

    if (consent.revokedAt) {
      throw new Error('Consent already revoked')
    }

    return await db.consentRecord.update({
      where: { id: consentId },
      data: { revokedAt: new Date() }
    })
  }

  /**
   * Export all user data for GDPR data portability
   * @param userId User ID
   * @returns Complete user data object
   */
  async exportUserData(userId: string): Promise<any> {
    // Check if user exists
    const userExists = await db.user.findUnique({
      where: { id: userId }
    })

    if (!userExists) {
      throw new Error('User not found')
    }

    // Gather all data related to the user
    const [user, datasets, consents, didDocuments, shares, auditLogs] = await Promise.all([
      db.user.findUnique({
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
      db.dataset.findMany({
        where: { ownerId: userId },
        include: {
          shares: true,
        },
      }),
      db.consentRecord.findMany({
        where: { userId },
      }),
      db.dIDDocument.findMany({
        where: { userId },
      }),
      db.datasetShare.findMany({
        where: {
          OR: [{ sharedById: userId }, { sharedWithId: userId }],
        },
      }),
      db.auditLog.findMany({
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
        dataRetentionPolicy: 'https://sapphire-project.example.com/privacy/retention',
      },
    };
  }

  /**
   * Delete all user data (right to erasure / right to be forgotten)
   * @param userId User ID
   * @param softDelete If true, anonymize data instead of hard delete
   * @returns Success status
   */
  async deleteUserData(userId: string, softDelete: boolean = false): Promise<boolean> {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (softDelete) {
      // Anonymize user data rather than deleting
      await db.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${Date.now()}@anonymized.com`,
          profile: { deleted: true, anonymizedAt: new Date() },
        },
      });

      // Mark datasets as anonymized
      await db.dataset.updateMany({
        where: { ownerId: userId },
        data: {
          title: 'Anonymized Dataset',
          description: 'This dataset has been anonymized',
          metadata: { anonymized: true, anonymizedAt: new Date() },
        },
      });

      // Add anonymization audit log
      await db.auditLog.create({
        data: {
          action: 'anonymize',
          resource: 'user',
          resourceId: userId,
          details: { reason: 'GDPR right to be forgotten request' },
        },
      });
    } else {
      // Hard delete all user data
      // Using a transaction to ensure all-or-nothing deletion
      await db.$transaction([
        // Delete audit logs first (no cascade needed)
        db.auditLog.deleteMany({ where: { userId } }),

        // Delete consent records
        db.consentRecord.deleteMany({ where: { userId } }),

        // Delete dataset shares related to this user
        db.datasetShare.deleteMany({
          where: {
            OR: [{ sharedById: userId }, { sharedWithId: userId }],
          },
        }),

        // Delete DID documents
        db.dIDDocument.deleteMany({ where: { userId } }),

        // Delete datasets owned by the user
        db.dataset.deleteMany({ where: { ownerId: userId } }),

        // Finally delete the user
        db.user.delete({ where: { id: userId } }),
      ]);

      // Add deletion audit log (without user reference)
      await db.auditLog.create({
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
  async recordDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: 'read' | 'create' | 'update' | 'delete',
    ipAddress?: string,
    userAgent?: string
  ): Promise<any> {
    return await db.auditLog.create({
      data: {
        userId,
        action,
        resource: resourceType,
        resourceId,
        ipAddress,
        userAgent,
        timestamp: new Date()
      }
    })
  }

  /**
   * Get data access history for a resource
   * @param resourceType Type of resource
   * @param resourceId ID of the resource
   * @returns Array of audit logs
   */
  async getResourceAccessHistory(resourceType: string, resourceId: string): Promise<any[]> {
    return await db.auditLog.findMany({
      where: {
        resource: resourceType,
        resourceId
      },
      orderBy: {
        timestamp: 'desc'
      },

    })
  }
}
