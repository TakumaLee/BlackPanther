/**
 * System Settings API Client
 * Handles system-wide configuration settings
 */

import { getAuthHeaders } from './auth';
import { buildApiUrl } from './client';

// Type definitions matching backend schemas
export interface SystemSettings {
  general: {
    site_name: string;
    site_description: string;
    site_url: string;
    admin_email: string;
    timezone: string;
    language: string;
    maintenance_mode: boolean;
  };
  article: {
    default_expiry_hours: number;
    max_content_length: number;
    enable_ai_analysis: boolean;
    auto_moderate: boolean;
    allow_anonymous: boolean;
    require_approval: boolean;
  };
  security: {
    enable_rate_limiting: boolean;
    max_requests_per_minute: number;
    session_timeout_hours: number;
    require_2fa: boolean;
    password_min_length: number;
    enable_ip_blocking: boolean;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    from_email: string;
    from_name: string;
    enable_ssl: boolean;
  };
  storage: {
    default_provider: string;
    max_file_size_mb: number;
    allowed_file_types: string[];
    auto_backup: boolean;
    backup_frequency_hours: number;
    retention_days: number;
  };
  notifications: {
    enable_push: boolean;
    enable_email: boolean;
    enable_sms: boolean;
    admin_notifications: string[];
    user_notifications: string[];
  };
}

/**
 * Get system settings
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  const response = await fetch(buildApiUrl('/api/v1/admin/settings'), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch system settings: ${response.status}`);
  }

  return response.json();
}

/**
 * Update system settings
 */
export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<{
  success: boolean;
  message: string;
  settings: SystemSettings;
}> {
  const response = await fetch(buildApiUrl('/api/v1/admin/settings'), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update system settings: ${response.status}`);
  }

  return response.json();
}

/**
 * Reset system settings to defaults
 */
export async function resetSystemSettings(): Promise<{
  success: boolean;
  message: string;
  settings: SystemSettings;
}> {
  const response = await fetch(buildApiUrl('/api/v1/admin/settings/reset'), {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to reset system settings: ${response.status}`);
  }

  return response.json();
}

/**
 * Send test email
 */
export async function sendTestEmail(): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch(buildApiUrl('/api/v1/admin/settings/test-email'), {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to send test email: ${response.status}`);
  }

  return response.json();
}

/**
 * Trigger manual database backup
 */
export async function backupDatabase(): Promise<{
  success: boolean;
  message: string;
  backup_file?: string;
}> {
  const response = await fetch(buildApiUrl('/api/v1/admin/settings/backup'), {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to backup database: ${response.status}`);
  }

  return response.json();
}
