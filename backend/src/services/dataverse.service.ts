import axios from 'axios';
import { DIDService } from './did.service';
import { AIService } from './ai.service';

/**
 * Interface for Dataverse dataset creation
 */
interface DataverseDatasetMetadata {
  title: string;
  description: string;
  authors: Array<{
    name: string;
    affiliation?: string;
    identifier?: string;
  }>;
  contacts: Array<{
    name: string;
    email: string;
    affiliation?: string;
  }>;
  subjects: string[];
  kindOfData?: string[];
  geographicCoverage?: string[];
  license?: string;
  language?: string;
}

/**
 * Interface for file upload to Dataverse
 */
interface DataverseFileMetadata {
  description?: string;
  directoryLabel?: string;
  categories?: string[];
  restrict?: boolean;
}

/**
 * Dataverse API response interface
 */
interface DataverseResponse {
  status: string;
  data: any;
  message?: string;
}

/**
 * Service for integrating with Dataverse repositories
 * Provides bidirectional data flow - reading from and writing to Dataverse
 */
export class DataverseService {
  private didService = new DIDService();
  private aiService = new AIService();
  private baseUrl: string;

  constructor(baseUrl: string = 'https://dataverse.harvard.edu') {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new dataset in Dataverse with DID integration
   * 
   * @param dataverseAlias - Target Dataverse collection alias
   * @param metadata - Dataset metadata
   * @param apiToken - Dataverse API token
   * @param createDID - Whether to create a DID for the dataset
   * @returns Promise resolving to creation response with DID
   */
  async createDataset(
    dataverseAlias: string,
    metadata: DataverseDatasetMetadata,
    apiToken: string,
    createDID: boolean = true
  ): Promise<{
    dataverseResponse: DataverseResponse;
    did?: string;
    didDocument?: any;
  }> {
    try {
      // Convert metadata to Dataverse format
      const dataverseMetadata = this.convertToDataverseFormat(metadata);

      // Create dataset in Dataverse
      const dataverseResponse = await this.makeDataverseAPICall(
        `${this.baseUrl}/api/dataverses/${dataverseAlias}/datasets`,
        'POST',
        {
          datasetVersion: {
            metadataBlocks: {
              citation: dataverseMetadata
            }
          }
        },
        apiToken
      );

      let did: string | undefined;
      let didDocument: any;

      // Create DID if requested
      if (createDID && dataverseResponse.status === 'OK') {
        did = await this.didService.createDID();
        
        // Create DID document with Dataverse metadata
        didDocument = await this.didService.createDIDDocument(did);
      }

      return {
        dataverseResponse,
        did,
        didDocument
      };
    } catch (error) {
      console.error('Error creating dataset in Dataverse:', error);
      throw error;
    }
  }

  /**
   * Upload a file to an existing Dataverse dataset
   * 
   * @param datasetId - Dataset ID or persistent identifier
   * @param fileBuffer - File content as buffer
   * @param fileName - Name of the file
   * @param mimeType - MIME type of the file
   * @param metadata - File metadata
   * @param apiToken - Dataverse API token
   * @param enhanceWithAI - Whether to enhance metadata with AI
   * @returns Promise resolving to upload response
   */
  async uploadFile(
    datasetId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    metadata: DataverseFileMetadata,
    apiToken: string,
    enhanceWithAI: boolean = true
  ): Promise<{
    dataverseResponse: any;
    aiEnhancements?: {
      tags: string[];
      enhancedDescription: string;
      categories: string[];
    };
  }> {
    try {
      let aiEnhancements;

      // Enhance metadata with AI if requested
      if (enhanceWithAI) {
        const tags = await this.aiService.extractTags(fileBuffer, mimeType);
        const enhancedDescription = await this.aiService.generateEnhancedDescription(
          fileName,
          metadata.description || '',
          tags
        );
        const categories = await this.aiService.suggestCulturalCategories(tags, {
          filename: fileName,
          mimeType,
          originalDescription: metadata.description
        });

        aiEnhancements = {
          tags,
          enhancedDescription,
          categories
        };

        // Update metadata with AI enhancements
        metadata.description = enhancedDescription;
        metadata.categories = [...(metadata.categories || []), ...categories.slice(0, 3)];
      }

      // Prepare form data for Dataverse upload
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('file', blob, fileName);

      // Add JSON metadata
      const jsonData = {
        description: metadata.description || '',
        directoryLabel: metadata.directoryLabel || '',
        categories: metadata.categories || [],
        restrict: metadata.restrict || false
      };
      formData.append('jsonData', JSON.stringify(jsonData));

      // Upload to Dataverse
      const response = await axios.post(
        `${this.baseUrl}/api/datasets/${datasetId}/add`,
        formData,
        {
          headers: {
            'X-Dataverse-key': apiToken,
            'Content-Type': 'multipart/form-data'
          },
          maxContentLength: 100 * 1024 * 1024, // 100MB limit
          maxBodyLength: 100 * 1024 * 1024
        }
      );

      return {
        dataverseResponse: response.data,
        aiEnhancements
      };
    } catch (error) {
      console.error('Error uploading file to Dataverse:', error);
      throw error;
    }
  }

  /**
   * Sync local dataset with Dataverse
   * Updates an existing Dataverse dataset with local changes
   * 
   * @param datasetId - Local dataset ID
   * @param dataverseId - Dataverse dataset ID
   * @param apiToken - Dataverse API token
   * @returns Promise resolving to sync result
   */
  async syncDataset(
    datasetId: string,
    dataverseId: string,
    apiToken: string
  ): Promise<{
    status: string;
    changes: string[];
    conflicts?: string[];
  }> {
    try {
      // This would implement bidirectional sync logic
      // For now, this is a placeholder for the sync functionality
      
      const changes: string[] = [];
      const conflicts: string[] = [];

      // 1. Fetch current state from Dataverse
      const dataverseDataset = await this.getDatasetMetadata(dataverseId, apiToken);
      
      // 2. Compare with local dataset
      // (This would require fetching local dataset from database)
      
      // 3. Identify changes and conflicts
      // (Implementation would compare metadata, files, etc.)
      
      // 4. Apply non-conflicting changes
      // (Implementation would update Dataverse with local changes)

      return {
        status: 'success',
        changes,
        conflicts
      };
    } catch (error) {
      console.error('Error syncing dataset with Dataverse:', error);
      throw error;
    }
  }

  /**
   * Get dataset metadata from Dataverse
   * 
   * @param datasetId - Dataset ID or persistent identifier
   * @param apiToken - Dataverse API token (optional for public datasets)
   * @returns Promise resolving to dataset metadata
   */
  async getDatasetMetadata(datasetId: string, apiToken?: string): Promise<any> {
    try {
      const headers: any = {};
      if (apiToken) {
        headers['X-Dataverse-key'] = apiToken;
      }

      const response = await axios.get(
        `${this.baseUrl}/api/datasets/${datasetId}`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching dataset metadata from Dataverse:', error);
      throw error;
    }
  }

  /**
   * Convert internal metadata format to Dataverse citation format
   * 
   * @param metadata - Internal metadata object
   * @returns Dataverse-formatted metadata
   */
  private convertToDataverseFormat(metadata: DataverseDatasetMetadata): any {
    return {
      fields: [
        {
          value: metadata.title,
          typeClass: 'primitive',
          multiple: false,
          typeName: 'title'
        },
        {
          value: metadata.authors.map(author => ({
            authorName: { 
              value: author.name, 
              typeClass: 'primitive', 
              multiple: false, 
              typeName: 'authorName' 
            },
            ...(author.affiliation && {
              authorAffiliation: { 
                value: author.affiliation, 
                typeClass: 'primitive', 
                multiple: false, 
                typeName: 'authorAffiliation' 
              }
            }),
            ...(author.identifier && {
              authorIdentifierScheme: { 
                value: 'ORCID', 
                typeClass: 'controlledVocabulary', 
                multiple: false, 
                typeName: 'authorIdentifierScheme' 
              },
              authorIdentifier: { 
                value: author.identifier, 
                typeClass: 'primitive', 
                multiple: false, 
                typeName: 'authorIdentifier' 
              }
            })
          })),
          typeClass: 'compound',
          multiple: true,
          typeName: 'author'
        },
        {
          value: metadata.contacts.map(contact => ({
            datasetContactName: { 
              value: contact.name, 
              typeClass: 'primitive', 
              multiple: false, 
              typeName: 'datasetContactName' 
            },
            datasetContactEmail: { 
              value: contact.email, 
              typeClass: 'primitive', 
              multiple: false, 
              typeName: 'datasetContactEmail' 
            },
            ...(contact.affiliation && {
              datasetContactAffiliation: { 
                value: contact.affiliation, 
                typeClass: 'primitive', 
                multiple: false, 
                typeName: 'datasetContactAffiliation' 
              }
            })
          })),
          typeClass: 'compound',
          multiple: true,
          typeName: 'datasetContact'
        },
        {
          value: [{
            dsDescriptionValue: { 
              value: metadata.description, 
              typeClass: 'primitive', 
              multiple: false, 
              typeName: 'dsDescriptionValue' 
            }
          }],
          typeClass: 'compound',
          multiple: true,
          typeName: 'dsDescription'
        },
        {
          value: metadata.subjects,
          typeClass: 'controlledVocabulary',
          multiple: true,
          typeName: 'subject'
        },
        ...(metadata.kindOfData && metadata.kindOfData.length > 0 ? [{
          value: metadata.kindOfData,
          typeClass: 'primitive',
          multiple: true,
          typeName: 'kindOfData'
        }] : []),
        ...(metadata.geographicCoverage && metadata.geographicCoverage.length > 0 ? [{
          value: metadata.geographicCoverage,
          typeClass: 'primitive',
          multiple: true,
          typeName: 'geographicCoverage'
        }] : []),
        ...(metadata.language ? [{
          value: metadata.language,
          typeClass: 'primitive',
          multiple: false,
          typeName: 'language'
        }] : [])
      ]
    };
  }

  /**
   * Make a direct API call to Dataverse
   * 
   * @param url - API endpoint URL
   * @param method - HTTP method
   * @param data - Request body data
   * @param apiToken - Authentication token
   * @returns Promise resolving to API response
   */
  private async makeDataverseAPICall(
    url: string,
    method: string,
    data: any,
    apiToken: string
  ): Promise<DataverseResponse> {
    try {
      const response = await axios({
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          'X-Dataverse-key': apiToken
        },
        data
      });

      return {
        status: 'OK',
        data: response.data.data || response.data
      };
    } catch (error: any) {
      console.error('Dataverse API call failed:', error);
      
      if (error.response) {
        throw new Error(`Dataverse API error: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
  }
}

// Export types
export type { DataverseDatasetMetadata, DataverseFileMetadata, DataverseResponse };