import { toast } from "sonner";

/**
 * Interface for DOI to DID mapping record
 */
export interface DOIMapping {
  doi: string;
  did: string;
  mappingType: 'dataset' | 'collection' | 'publication';
  createdAt: Date;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Service for managing the mapping between DOIs (Digital Object Identifiers)
 * and DIDs (Decentralized Identifiers).
 * 
 * This service facilitates the integration between traditional persistent identifier
 * infrastructures (DOI) and the Sapphire DID system.
 */
export class DOIMappingService {
  private mappingsCache: Map<string, DOIMapping> = new Map();
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  }

  /**
   * Create a new mapping between a DOI and a DID
   * 
   * @param doiIdentifier - The DOI identifier (e.g., '10.70122/FK2/ABCDEF')
   * @param didIdentifier - The DID identifier (e.g., 'did:ethr:0x123...')
   * @param type - The type of resource being mapped
   * @param description - Optional description of the mapping
   * @param metadata - Optional additional metadata
   * @returns Promise resolving to the created mapping
   */
  async createMapping(
    doiIdentifier: string, 
    didIdentifier: string, 
    type: 'dataset' | 'collection' | 'publication' = 'dataset',
    description?: string,
    metadata?: Record<string, any>
  ): Promise<DOIMapping> {
    try {
      // In a real implementation, this would be an API call
      // For the prototype, we'll simulate the API response
      
      // Format the DOI if it doesn't start with 'doi:'
      const formattedDoi = doiIdentifier.startsWith('doi:') 
        ? doiIdentifier 
        : `doi:${doiIdentifier}`;
        
      const mapping: DOIMapping = {
        doi: formattedDoi,
        did: didIdentifier,
        mappingType: type,
        createdAt: new Date(),
        description,
        metadata
      };
      
      // Store in cache
      this.mappingsCache.set(formattedDoi, mapping);
      
      // In a real implementation, this would be:
      // const response = await fetch(`${this.apiUrl}/mappings`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(mapping)
      // });
      // return await response.json();
      
      return mapping;
    } catch (error) {
      console.error('Error creating DOI-DID mapping:', error);
      throw new Error('Failed to create mapping between DOI and DID');
    }
  }

  /**
   * Get a mapping by DOI
   * 
   * @param doiIdentifier - The DOI identifier
   * @returns Promise resolving to the mapping if found
   */
  async getMappingByDOI(doiIdentifier: string): Promise<DOIMapping | null> {
    try {
      // Format the DOI if needed
      const formattedDoi = doiIdentifier.startsWith('doi:') 
        ? doiIdentifier 
        : `doi:${doiIdentifier}`;
      
      // Check cache first
      if (this.mappingsCache.has(formattedDoi)) {
        return this.mappingsCache.get(formattedDoi) || null;
      }
      
      // In a real implementation, this would be an API call
      // For the prototype, we'll return null for non-cached values
      
      // In a real implementation:
      // const response = await fetch(`${this.apiUrl}/mappings/doi/${encodeURIComponent(formattedDoi)}`);
      // if (!response.ok) return null;
      // const mapping = await response.json();
      // this.mappingsCache.set(formattedDoi, mapping);
      // return mapping;
      
      return null;
    } catch (error) {
      console.error('Error retrieving DOI-DID mapping:', error);
      return null;
    }
  }

  /**
   * Get a mapping by DID
   * 
   * @param didIdentifier - The DID identifier
   * @returns Promise resolving to the mapping if found
   */
  async getMappingByDID(didIdentifier: string): Promise<DOIMapping | null> {
    try {
      // Search cache
      for (const mapping of Array.from(this.mappingsCache.values())) {
        if (mapping.did === didIdentifier) {
          return mapping;
        }
      }
      
      // In a real implementation, this would be an API call
      // For the prototype, we'll return null for non-cached values
      
      // In a real implementation:
      // const response = await fetch(`${this.apiUrl}/mappings/did/${encodeURIComponent(didIdentifier)}`);
      // if (!response.ok) return null;
      // return await response.json();
      
      return null;
    } catch (error) {
      console.error('Error retrieving DOI-DID mapping:', error);
      return null;
    }
  }

  /**
   * Delete a mapping between a DOI and a DID
   * 
   * @param doiIdentifier - The DOI identifier
   * @returns Promise resolving to true if deleted successfully
   */
  async deleteMapping(doiIdentifier: string): Promise<boolean> {
    try {
      // Format the DOI if needed
      const formattedDoi = doiIdentifier.startsWith('doi:') 
        ? doiIdentifier 
        : `doi:${doiIdentifier}`;
      
      // Remove from cache
      this.mappingsCache.delete(formattedDoi);
      
      // In a real implementation:
      // const response = await fetch(`${this.apiUrl}/mappings/doi/${encodeURIComponent(formattedDoi)}`, {
      //   method: 'DELETE'
      // });
      // return response.ok;
      
      return true;
    } catch (error) {
      console.error('Error deleting DOI-DID mapping:', error);
      return false;
    }
  }

  /**
   * List all mappings for a user
   * 
   * @param userId - Optional user ID to filter by
   * @returns Promise resolving to an array of mappings
   */
  async listMappings(userId?: string): Promise<DOIMapping[]> {
    try {
      // In a real implementation, this would be an API call
      // For the prototype, we'll return the cached mappings
      
      // In a real implementation:
      // const response = await fetch(`${this.apiUrl}/mappings${userId ? `?userId=${userId}` : ''}`);
      // return await response.json();
      
      return Array.from(this.mappingsCache.values());
    } catch (error) {
      console.error('Error listing DOI-DID mappings:', error);
      return [];
    }
  }
  
  /**
   * Verify if a mapping exists between a DOI and a DID
   * 
   * @param doiIdentifier - The DOI identifier
   * @param didIdentifier - The DID identifier
   * @returns Promise resolving to true if a mapping exists
   */
  async verifyMapping(doiIdentifier: string, didIdentifier: string): Promise<boolean> {
    try {
      const mapping = await this.getMappingByDOI(doiIdentifier);
      return mapping !== null && mapping.did === didIdentifier;
    } catch (error) {
      console.error('Error verifying DOI-DID mapping:', error);
      return false;
    }
  }
}

// Create a singleton instance for the application to use
export const doiMappingService = new DOIMappingService();
