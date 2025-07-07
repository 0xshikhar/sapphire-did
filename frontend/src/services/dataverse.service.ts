// Import use cases directly as per documentation in useCases.md
import { getDataset } from '@iqss/dataverse-client-javascript';
import { getAllDatasetPreviews as searchDatasetsUseCase } from '@iqss/dataverse-client-javascript';
import { getDatasetFiles } from '@iqss/dataverse-client-javascript';
import { getCollection } from '@iqss/dataverse-client-javascript';
// Note: Upload functionality requires additional configuration and authentication

// Import types from the package
// Note: Using simplified type imports to avoid path issues
import type { Dataset, Collection } from '@iqss/dataverse-client-javascript';

/**
 * Extended Dataset interface that includes additional properties
 * returned by the Dataverse API but not included in the official types
 */
export interface DataverseDataset extends Dataset {
  name?: string;
  publisher?: string;
  published_at?: string;
  description?: string;
  global_id?: string;
  subjects?: string[];
  citation?: string;
}

// Define interfaces for types not directly exported by the package
interface SearchParams {
  q: string;
  [key: string]: any;
}

// Interface for search result items
interface SearchResultItem {
  name: string;
  global_id: string;
  description?: string;
  published_at?: string;
  publisher?: string;
  citation?: string;
  subjects?: string[];
  fileCount?: number;
  [key: string]: any;
}

// Interface that matches the actual API response structure
interface SearchResults {
  data: {
    items: SearchResultItem[];
    total_count: number;
    start: number;
    count_in_response: number;
  };
  status: string;
  [key: string]: any;
}

// Interface for files returned by the API
interface FilesSubset {
  data: {
    files: Array<{
      id: number;
      name: string;
      contentType?: string;
      description?: string;
      size?: number;
      [key: string]: any;
    }>;
  };
  [key: string]: any;
}

// Interface for dataset creation
interface DatasetCreationMetadata {
  title: string;
  description: string;
  subjects: string[];
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
  license?: string;
  kindOfData?: string[];
  geographicCoverage?: string[];
  timePeriodCovered?: {
    start?: string;
    end?: string;
  };
  [key: string]: any;
}

// Interface for upload response
interface UploadResponse {
  status: string;
  data: {
    persistentId: string;
    datasetId: number;
    version: string;
    publicationDate?: string;
  };
  message?: string;
}

/**
 * DataverseService provides methods to interact with the Dataverse API
 * using the @iqss/dataverse-client-javascript library.
 * 
 * This service follows the use case execution pattern as documented in the
 * official Dataverse Client JavaScript package.
 */
export class DataverseService {
  /**
   * Get dataset metadata by identifier
   * 
   * @param datasetIdentifier - The dataset identifier (e.g., 'doi:10.70122/FK2/ABCDEF')
   * @param version - Optional dataset version
   * @returns Promise resolving to dataset metadata
   */
  async getDataset(datasetIdentifier: string, version?: string): Promise<Dataset> {
    try {
      // Execute the getDataset use case
      return await getDataset.execute(datasetIdentifier, version);
    } catch (error) {
      console.error('Error fetching dataset:', error);
      throw error;
    }
  }

  /**
   * Search for datasets
   * 
   * @param query - The search query
   * @param options - Optional search parameters
   * @returns Promise resolving to search results
   */
  async searchDatasets(query: string, options?: {
    type?: string,
    per_page?: number,
    start?: number,
    sort?: string,
    order?: string,
    [key: string]: any
  }): Promise<SearchResults> {
    try {
      // TODO: The 'query' parameter is currently ignored because the underlying
      // `getAllDatasetPreviews` function does not support free-text search.
      // This is a temporary measure to fix a breaking change in the upstream API.
      const limit = options?.per_page;
      const offset = options?.start;

      const subset = await searchDatasetsUseCase.execute(limit, offset);

      // Adapt the DatasetPreviewSubset to the expected SearchResults structure
      const searchResults: SearchResults = {
        status: 'OK',
        data: {
          items: subset.datasetPreviews.map((ds: any) => ({
            name: ds.name,
            global_id: ds.persistentId, // Mapped from persistentId
            description: ds.description,
            published_at: ds.publicationDate, // Mapped from publicationDate
            publisher: ds.publisher,
            citation: ds.citation,
            subjects: ds.subjects,
            fileCount: ds.fileCount,
            ...ds
          })),
          total_count: subset.totalDatasetCount,
          start: offset || 0,
          count_in_response: subset.datasetPreviews.length,
        }
      };

      return searchResults;
    } catch (error) {
      console.error('Error searching datasets:', error);
      throw error;
    }
  }

  /**
   * Get files associated with a dataset
   * 
   * @param datasetIdentifier - The dataset identifier (e.g., 'doi:10.70122/FK2/ABCDEF')
   * @param version - Optional dataset version
   * @returns Promise resolving to file subset
   */
  async getDatasetFiles(datasetIdentifier: string, version?: string): Promise<any> {
    try {
      // Execute the getDatasetFiles use case
      return await getDatasetFiles.execute(datasetIdentifier, version);
    } catch (error) {
      console.error('Error fetching dataset files:', error);
      throw error;
    }
  }

  /**
   * Get information about a Dataverse collection
   * 
   * @param dataverseAlias - The alias of the Dataverse collection
   * @returns Promise resolving to Dataverse collection information
   */
  async getDataverseInfo(dataverseAlias: string): Promise<Collection> {
    try {
      // Execute the getCollection use case (which gets Dataverse info)
      return await getCollection.execute(dataverseAlias);
    } catch (error) {
      console.error('Error fetching Dataverse info:', error);
      throw error;
    }
  }

  /**
   * Create a new dataset in Dataverse
   * Note: This requires authentication and proper API configuration
   * 
   * @param dataverseAlias - The alias of the target Dataverse collection
   * @param metadata - Dataset metadata
   * @param apiToken - Authentication token for Dataverse API
   * @returns Promise resolving to upload response
   */
  async createDataset(
    dataverseAlias: string, 
    metadata: DatasetCreationMetadata,
    apiToken: string
  ): Promise<UploadResponse> {
    try {
      // Convert metadata to Dataverse JSON format
      const dataverseMetadata = this.convertToDataverseFormat(metadata);
      
      // Use direct API call since the client library doesn't support dataset creation
      const response = await this.makeDataverseAPICall(
        `https://dataverse.harvard.edu/api/dataverses/${dataverseAlias}/datasets`,
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

      return {
        status: 'OK',
        data: {
          persistentId: response.data.persistentId,
          datasetId: response.data.id,
          version: response.data.latestVersion.versionNumber + '.' + response.data.latestVersion.versionMinorNumber
        }
      };
    } catch (error) {
      console.error('Error creating dataset:', error);
      throw error;
    }
  }

  /**
   * Upload a file to an existing dataset
   * 
   * @param datasetId - The dataset ID or persistent identifier
   * @param file - File to upload
   * @param metadata - File metadata
   * @param apiToken - Authentication token
   * @returns Promise resolving to upload response
   */
  async uploadFile(
    datasetId: string,
    file: File,
    metadata: {
      description?: string;
      directoryLabel?: string;
      categories?: string[];
      restrict?: boolean;
    },
    apiToken: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add JSON metadata
      const jsonData = {
        description: metadata.description || '',
        directoryLabel: metadata.directoryLabel || '',
        categories: metadata.categories || [],
        restrict: metadata.restrict || false
      };
      formData.append('jsonData', JSON.stringify(jsonData));

      // Use direct API call for file upload
      const response = await fetch(
        `https://dataverse.harvard.edu/api/datasets/${datasetId}/add`,
        {
          method: 'POST',
          headers: {
            'X-Dataverse-key': apiToken
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Convert internal metadata format to Dataverse citation format
   * 
   * @param metadata - Internal metadata object
   * @returns Dataverse-formatted metadata
   */
  private convertToDataverseFormat(metadata: DatasetCreationMetadata): any {
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
            authorName: { value: author.name, typeClass: 'primitive', multiple: false, typeName: 'authorName' },
            ...(author.affiliation && {
              authorAffiliation: { value: author.affiliation, typeClass: 'primitive', multiple: false, typeName: 'authorAffiliation' }
            })
          })),
          typeClass: 'compound',
          multiple: true,
          typeName: 'author'
        },
        {
          value: metadata.contacts.map(contact => ({
            datasetContactName: { value: contact.name, typeClass: 'primitive', multiple: false, typeName: 'datasetContactName' },
            datasetContactEmail: { value: contact.email, typeClass: 'primitive', multiple: false, typeName: 'datasetContactEmail' },
            ...(contact.affiliation && {
              datasetContactAffiliation: { value: contact.affiliation, typeClass: 'primitive', multiple: false, typeName: 'datasetContactAffiliation' }
            })
          })),
          typeClass: 'compound',
          multiple: true,
          typeName: 'datasetContact'
        },
        {
          value: [{
            dsDescriptionValue: { value: metadata.description, typeClass: 'primitive', multiple: false, typeName: 'dsDescriptionValue' }
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
  ): Promise<any> {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Dataverse-key': apiToken
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dataverse API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }
}

/**
 * Pre-configured instance for Harvard Dataverse
 */
export const harvardDataverse = new DataverseService();

/**
 * Re-export required types from the Dataverse client
 */
export type { Dataset, Collection };
export type { SearchParams, SearchResults };
export type { FilesSubset };
export type { DatasetCreationMetadata, UploadResponse };
