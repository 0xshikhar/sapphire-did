/**
 * @file Frontend service for interacting with the backend GDPR API.
 * This service encapsulates all API calls related to consent management.
 */

// This will be replaced with the actual import from the backend config
import { ConsentTypes, ConsentType, ConsentStatus } from '@/config/consent.config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// A simple API client to handle requests
const createApiClient = (token: string) => ({
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!token) {
      throw new Error('Authentication token not provided.');
    }
    const headers = new Headers(options.headers || {});
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An API error occurred' }));
      throw new Error(error.message || 'An API error occurred');
    }

    if (response.status === 204) {
      return null as T;
    }

        if (headers.get('Accept') === 'application/json') {
        return response.json();
    }

    return response.blob() as unknown as T;
  },

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', headers: { ...options?.headers, 'Accept': 'application/json' } });
  },

  post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body), headers: { ...options?.headers, 'Accept': 'application/json' } });
  },

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE', headers: { ...options?.headers, 'Accept': 'application/json' } });
  },
});

/**
 * Fetches the current consent status for all GDPR-related features.
 * @returns A promise that resolves to a record of consent types and their status.
 */
const getConsentStatus = (token: string): Promise<ConsentStatus> => {
  return createApiClient(token).get<ConsentStatus>('/gdpr/status');
};

/**
 * Updates a user's consent for a specific feature.
 * @param consentType The type of consent to update.
 * @param isGranted The new consent status (true for granted, false for revoked).
 * @returns A promise that resolves when the update is complete.
 */
const updateConsent = (token: string, consentType: ConsentType, isGranted: boolean): Promise<void> => {
  return createApiClient(token).post<void>('/gdpr/consent', { consentType, isGranted });
};

/**
 * Initiates a user data export.
 * @returns A promise that resolves to a Blob containing the user's data.
 */
const exportUserData = (token: string): Promise<Blob> => {
  return createApiClient(token).request<Blob>('/gdpr/export', { 
    method: 'POST',
    headers: { 'Accept': 'application/json' } 
  });
};

/**
 * Initiates the account deletion process.
 * @returns A promise that resolves when the account deletion is confirmed.
 */
const deleteAccount = (token: string): Promise<void> => {
  return createApiClient(token).delete<void>('/gdpr/account');
};

const getConsentHistory = (token: string): Promise<any[]> => {
  return createApiClient(token).get<any[]>('/gdpr/history');
};

export const GDPRService = {
  getConsentStatus,
  updateConsent,
  exportUserData,
  deleteAccount,
  getConsentHistory,
};
