/**
 * Recommendation Service - API Client
 * 
 * Connects to the backend recommendation API to provide intelligent recommendations.
 */

import type { DataverseDataset } from './dataverse.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Types (should match backend)
export type RecommendationType = 'similar' | 'complementary' | 'educational' | 'research';

export interface RecommendationItem {
  dataset: DataverseDataset;
  score: number;
  matchReason: string;
  type: RecommendationType;
}

export interface RecommendationOptions {
  maxResults?: number;
  minScore?: number;
  includeTypes?: RecommendationType[];
}

export interface SearchQuery {
  text?: string;
  tags?: string[];
  topics?: string[];
}

class RecommendationService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get recommendations for a seed dataset from the backend API.
   */
  async getRecommendationsForDataset(
    seedDataset: DataverseDataset,
    availableDatasets: DataverseDataset[],
    options: RecommendationOptions = {}
  ): Promise<RecommendationItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/for-dataset`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ seedDataset, availableDatasets, options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recommendations.');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Perform an enhanced search using the backend API.
   */
  async enhancedSearch(
    query: SearchQuery,
    options: RecommendationOptions = {}
  ): Promise<DataverseDataset[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/search`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ query, options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to perform enhanced search.');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in enhanced search:', error);
      return [];
    }
  }
}

export const recommendationService = new RecommendationService();
