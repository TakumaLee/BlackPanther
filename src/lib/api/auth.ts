/**
 * Auth utility functions for API requests
 */

export function getAuthHeaders(): HeadersInit {
  // Get token from localStorage or cookie
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('adminToken')
    : '';

  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminToken', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
}