/**
 * @file Defines granular consent types for GDPR compliance.
 * This centralized file ensures consistency across the application.
 */

export const ConsentTypes = {
  // For linking a Dataverse dataset to a user's DID
  DATA_LINKING: 'data_linking',

  // For using AI services to enhance dataset metadata
  AI_METADATA_ENHANCEMENT: 'ai_metadata_enhancement',

  // For receiving AI-powered dataset recommendations
  AI_RECOMMENDATIONS: 'ai_recommendations',

  // For participating in community-based features like crowdsourced curation
  COMMUNITY_CONTRIBUTIONS: 'community_contributions',

  // General data processing consent required for basic app functionality
  GENERAL_DATA_PROCESSING: 'general_data_processing',
} as const;

// Creates a type from the values of the ConsentTypes object
export type ConsentType = typeof ConsentTypes[keyof typeof ConsentTypes];

export const ALL_CONSENT_TYPES = Object.values(ConsentTypes);
