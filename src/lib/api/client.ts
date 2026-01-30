/**
 * API Client Utility
 *
 * Centralized API URL configuration that respects environment settings
 * and Next.js proxy configuration for development.
 */

import { config } from '@/config/environment';

/**
 * Get the base API URL for the current environment
 *
 * In development, returns empty string to use relative paths (proxied via next.config.ts)
 * In QA/production, returns the full backend URL
 */
export function getApiBaseUrl(): string {
  return config.apiUrl;
}

/**
 * Build a full API URL for a given endpoint path
 *
 * @param path - API endpoint path (e.g., '/api/v1/admin/invites/stats')
 * @returns Full URL or relative path depending on environment
 *
 * @example
 * // Development (uses proxy)
 * buildApiUrl('/api/v1/admin/invites/stats') // => '/api/v1/admin/invites/stats'
 *
 * // Production
 * buildApiUrl('/api/v1/admin/invites/stats') // => 'https://black-alligator-qa.../api/v1/admin/invites/stats'
 */
export function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // In development (baseUrl is empty), return path as-is
  if (!baseUrl) {
    return normalizedPath;
  }

  // In production, combine baseUrl + path
  return `${baseUrl}${normalizedPath}`;
}

/**
 * API client configuration
 */
export const apiClient = {
  baseUrl: getApiBaseUrl,
  buildUrl: buildApiUrl,
};

export default apiClient;
