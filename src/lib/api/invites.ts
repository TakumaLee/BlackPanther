/**
 * Invites API Client
 * Handles invite code management, statistics, and activity tracking
 */

import { getAuthHeaders } from './auth';
import { buildApiUrl } from './client';

// Type definitions matching the page's existing interfaces
export interface InviteCode {
  id: string;
  code: string;
  created_by: string;
  creator_name: string;
  created_at: string;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  status: 'active' | 'expired' | 'disabled';
  reward_inviter: number;
  reward_invitee: number;
  description?: string;
}

export interface InviteStats {
  total_codes: number;
  active_codes: number;
  total_invites: number;
  successful_registrations: number;
  total_rewards_given: number;
  conversion_rate: number;
}

export interface InviteActivity {
  id: string;
  invite_code: string;
  inviter_name: string;
  invitee_name: string;
  registered_at: string;
  reward_given: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface CreateInviteCodeRequest {
  code?: string;
  expires_at?: string | null;
  usage_limit?: number | null;
  reward_inviter?: number;
  reward_invitee?: number;
  description?: string;
}

export interface UpdateInviteCodeRequest {
  expires_at?: string | null;
  usage_limit?: number | null;
  status?: 'active' | 'expired' | 'disabled';
  reward_inviter?: number;
  reward_invitee?: number;
  description?: string;
}

/**
 * Get invite codes with optional filtering
 */
export async function getInviteCodes(
  search?: string,
  status?: string
): Promise<InviteCode[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const queryString = params.toString();
  const url = `${buildApiUrl('/api/v1/admin/invites/codes')}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch invite codes: ${response.status}`);
  }

  const data = await response.json();
  return data.codes || data;
}

/**
 * Get invite statistics
 */
export async function getInviteStats(): Promise<InviteStats> {
  const response = await fetch(buildApiUrl('/api/v1/admin/invites/stats'), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch invite stats: ${response.status}`);
  }

  return response.json();
}

/**
 * Get invite activities with pagination
 */
export async function getInviteActivities(
  page: number = 1,
  limit: number = 20
): Promise<{ activities: InviteActivity[]; total: number; page: number; limit: number }> {
  const response = await fetch(
    `${buildApiUrl('/api/v1/admin/invites/activities')}?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch invite activities: ${response.status}`);
  }

  return response.json();
}

/**
 * Create a new invite code
 */
export async function createInviteCode(
  data: CreateInviteCodeRequest
): Promise<{ message: string; code: InviteCode }> {
  const response = await fetch(buildApiUrl('/api/v1/admin/invites/codes'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create invite code: ${response.status}`);
  }

  return response.json();
}

/**
 * Update an existing invite code
 */
export async function updateInviteCode(
  id: string,
  data: UpdateInviteCodeRequest
): Promise<{ message: string; code: InviteCode }> {
  const response = await fetch(buildApiUrl(`/api/v1/admin/invites/codes/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update invite code: ${response.status}`);
  }

  return response.json();
}

/**
 * Delete an invite code
 */
export async function deleteInviteCode(id: string): Promise<{ message: string }> {
  const response = await fetch(buildApiUrl(`/api/v1/admin/invites/codes/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete invite code: ${response.status}`);
  }

  return response.json();
}
