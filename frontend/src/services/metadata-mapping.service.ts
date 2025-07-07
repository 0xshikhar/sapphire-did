/**
 * Metadata Mapping Service
 * 
 * This service handles mapping between Dataverse metadata and DID document structures.
 * It provides utilities for:
 * - Creating DID services for datasets
 * - Mapping dataset metadata to structured format for DID documents
 * - Generating GDPR-compliant metadata formats
 */

import type { Dataset as BaseDataset } from "@iqss/dataverse-client-javascript";

/**
 * Extended Dataset interface with additional properties from Harvard Dataverse
 * Note: We're not extending BaseDataset anymore to avoid type conflicts
 */
export interface DataverseDataset {
  // Base Dataset properties
  id?: number | string; // Can be number from base Dataset or string from Dataverse API
  // Harvard Dataverse specific properties
  name?: string;
  global_id?: string;
  description?: string;
  publisher?: string;
  published_at?: string;
  authors?: Array<{
    name?: string;
    identifier?: string;
    affiliation?: string;
  }>;
  subjects?: string[];
}

/**
 * Structure for mapped metadata from a dataset
 */
export interface MappedMetadata {
  name: string;
  description?: string;
  identifier: string;
  source: string;
  publisher?: string;
  datePublished?: string;
  license?: string;
  url?: string;
  creators?: Array<{
    name: string;
    identifier?: string;
    affiliation?: string;
  }>;
  keywords?: string[];
  consentRecorded: boolean;
  consentTimestamp?: string;
}

/**
 * Structure for a DID service endpoint for dataset metadata
 */
export interface DatasetServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string;
  description?: string;
}

/**
 * Service for mapping Dataverse dataset metadata to DID-compatible formats
 */
export class MetadataMappingService {
  /**
   * Map Dataverse dataset to structured metadata format
   * 
   * @param dataset - Dataverse dataset object
   * @returns Mapped metadata object
   */
  mapDatasetMetadata(dataset: DataverseDataset): MappedMetadata {
    if (!dataset) {
      throw new Error("Dataset is required for metadata mapping");
    }

    // Extract dataset metadata
    const metadata: MappedMetadata = {
      name: dataset.name || "Unknown Dataset",
      identifier: dataset.id ? dataset.id.toString() : (dataset.global_id || ""),
      source: "Harvard Dataverse",
      consentRecorded: false, // Default value, to be updated when consent is recorded
    };

    // Add optional fields if available
    if (dataset.description) metadata.description = dataset.description;
    if (dataset.publisher) metadata.publisher = dataset.publisher;
    if (dataset.published_at) metadata.datePublished = dataset.published_at;
    
    // Map creators if available
    if (dataset.authors && Array.isArray(dataset.authors) && dataset.authors.length > 0) {
      metadata.creators = dataset.authors.map(author => ({
        name: author.name || "Unknown",
        identifier: author.identifier,
        affiliation: author.affiliation
      }));
    }
    
    // Map subjects to keywords if available
    if (dataset.subjects && Array.isArray(dataset.subjects)) {
      metadata.keywords = dataset.subjects;
    }
    
    // Add Dataverse URL
    if (dataset.global_id) {
      metadata.url = `https://dataverse.harvard.edu/dataset.xhtml?persistentId=${encodeURIComponent(dataset.global_id)}`;
    }

    return metadata;
  }

  /**
   * Create a DID service endpoint for a dataset
   * 
   * @param did - Decentralized Identifier
   * @param dataset - Dataset object
   * @param description - Optional description for the service
   * @returns Service endpoint object
   */
  createDatasetService(did: string, dataset: DataverseDataset, description?: string): DatasetServiceEndpoint {
    if (!did) {
      throw new Error("DID is required to create dataset service");
    }

    if (!dataset || !dataset.global_id) {
      throw new Error("Valid dataset with global identifier is required");
    }

    // Create a unique ID for the service
    const serviceId = `${did}#dataverse-${dataset.global_id.replace(/[^a-zA-Z0-9]/g, "")}`;
    
    return {
      id: serviceId,
      type: "DataverseMetadata",
      serviceEndpoint: `https://dataverse.harvard.edu/api/datasets/${encodeURIComponent(dataset.global_id)}`,
      description: description || `Metadata for Dataverse dataset: ${dataset.name}`
    };
  }

  /**
   * Record GDPR consent for dataset linking
   * 
   * @param did - Decentralized Identifier
   * @param datasetId - Dataset identifier
   * @param consentPurpose - Purpose for which consent is being recorded
   * @returns Updated metadata with consent information
   */
  recordGDPRConsent(metadata: MappedMetadata, consentPurpose: string = "Dataset linking"): MappedMetadata {
    // Create a copy to avoid modifying the original
    const updatedMetadata = { ...metadata };
    
    // Record consent
    updatedMetadata.consentRecorded = true;
    updatedMetadata.consentTimestamp = new Date().toISOString();
    
    // In a production system, this would make an API call to the backend
    // to record the consent in a GDPR-compliant manner
    console.log(`GDPR Consent recorded for dataset ${metadata.identifier}`, {
      purpose: consentPurpose,
      timestamp: updatedMetadata.consentTimestamp
    });
    
    return updatedMetadata;
  }
}

// Create a singleton instance for the application
export const metadataMapper = new MetadataMappingService();
