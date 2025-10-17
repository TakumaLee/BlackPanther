// Admin Management API Client
// 管理員帳戶管理 API 客戶端

import { config, logger } from '@/config/environment';
import { authService } from '../auth/auth-service';
import {
  Admin,
  AdminListResponse,
  AdminCreateRequest,
  AdminUpdateRequest,
  AdminLogsResponse,
  ResetPasswordResponse,
  AdminFilters
} from '@/types/admins';

const API_BASE_URL = config.apiUrl;

class AdminsApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authHeader = authService.getAuthHeader();
    if (!authHeader) {
      logger.warn('Admin API request attempted without authentication');
      throw new Error('管理員未登入');
    }

    const url = `${API_BASE_URL}/api/v1/admin/admins${endpoint}`;
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options.headers,
      },
      ...options,
    };

    logger.debug('Making Admin Management API request:', { url, method: options.method || 'GET' });

    try {
      const response = await fetch(url, requestConfig);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorType = 'api_error';

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;

          if (response.status === 401) {
            errorType = 'auth_error';
          } else if (response.status === 403) {
            errorType = 'permission_error';
            errorMessage = '權限不足：僅 super_admin 可執行此操作';
          } else if (response.status >= 500) {
            errorType = 'server_error';
          }
        } catch (err) {
          if (response.status === 403) {
            errorType = 'permission_error';
            errorMessage = '權限不足';
          }
        }

        const error = new Error(errorMessage) as Error & { type?: string; status?: number };
        error.type = errorType;
        error.status = response.status;
        logger.error('Admin Management API request failed:', { url, status: response.status, errorMessage, errorType });
        throw error;
      }

      logger.debug('Admin Management API request successful:', { url, status: response.status });

      // For DELETE requests, check if response has content
      if (options.method === 'DELETE') {
        const text = await response.text();
        return (text ? JSON.parse(text) : {}) as T;
      }

      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        logger.error('Admin Management API request error:', { url, error: err.message });
        throw err;
      }
      const unknownError = new Error('API請求失敗') as Error & { type?: string };
      unknownError.type = 'network_error';
      logger.error('Unknown Admin Management API error:', { url, error: unknownError.message });
      throw unknownError;
    }
  }

  /**
   * Get list of admins with filters
   */
  async getAdmins(filters: AdminFilters = {}): Promise<AdminListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    const query = params.toString();
    return this.makeRequest<AdminListResponse>(`${query ? `?${query}` : ''}`);
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: string): Promise<Admin> {
    return this.makeRequest<Admin>(`/${id}`);
  }

  /**
   * Create new admin
   */
  async createAdmin(data: AdminCreateRequest): Promise<Admin> {
    return this.makeRequest<Admin>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update admin
   */
  async updateAdmin(id: string, data: AdminUpdateRequest): Promise<Admin> {
    return this.makeRequest<Admin>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete (deactivate) admin
   */
  async deleteAdmin(id: string): Promise<void> {
    await this.makeRequest<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get admin operation logs
   */
  async getAdminLogs(
    id: string,
    page: number = 1,
    limit: number = 20
  ): Promise<AdminLogsResponse> {
    return this.makeRequest<AdminLogsResponse>(
      `/${id}/logs?page=${page}&limit=${limit}`
    );
  }

  /**
   * Reset admin password
   */
  async resetAdminPassword(
    id: string,
    newPassword?: string
  ): Promise<ResetPasswordResponse> {
    return this.makeRequest<ResetPasswordResponse>(`/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(newPassword ? { new_password: newPassword } : {}),
    });
  }

  /**
   * Update admin permissions (role)
   */
  async updateAdminPermissions(id: string, role: string): Promise<Admin> {
    return this.makeRequest<Admin>(`/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }
}

// Export singleton instance
export const adminsApi = new AdminsApiClient();
export default adminsApi;
