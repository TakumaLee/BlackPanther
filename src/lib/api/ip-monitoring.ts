// IP Monitoring API Client
// IP 監控 API 客戶端

import { config, logger } from '@/config/environment';
import { authService } from '../auth/auth-service';
import {
  IPMonitoringStats,
  SuspiciousIPsResponse,
  IPCheckResult,
  IPBlockRequest,
  IPBlockResponse,
  IPFilters,
} from '@/types/ip-monitoring';

const API_BASE_URL = config.apiUrl;

class IPMonitoringApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authHeader = authService.getAuthHeader();
    if (!authHeader) {
      logger.warn('IP Monitoring API request attempted without authentication');
      throw new Error('Admin not authenticated');
    }

    const url = `${API_BASE_URL}/api/v1/admin/ip-monitoring${endpoint}`;
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options.headers,
      },
      ...options,
    };

    logger.debug('Making IP Monitoring API request:', { url, method: options.method || 'GET' });

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
          } else if (response.status >= 500) {
            errorType = 'server_error';
          }
        } catch {
          if (response.status === 401) {
            errorType = 'auth_error';
          } else if (response.status === 403) {
            errorType = 'permission_error';
          } else if (response.status >= 500) {
            errorType = 'server_error';
          }
        }

        const error = new Error(errorMessage) as Error & { type?: string; status?: number };
        error.type = errorType;
        error.status = response.status;
        logger.error('IP Monitoring API request failed:', { url, status: response.status, errorMessage, errorType });
        throw error;
      }

      logger.debug('IP Monitoring API request successful:', { url, status: response.status });
      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        logger.error('IP Monitoring API request error:', { url, error: err.message });
        throw err;
      }
      const unknownError = new Error('IP Monitoring API request failed') as Error & { type?: string };
      unknownError.type = 'network_error';
      logger.error('Unknown IP Monitoring API error:', { url, error: unknownError.message });
      throw unknownError;
    }
  }

  // Get IP Monitoring Statistics
  async getIPMonitoringStats(): Promise<IPMonitoringStats> {
    try {
      return await this.makeRequest<IPMonitoringStats>('/stats');
    } catch (err) {
      console.warn('IP Monitoring stats API failed, returning fallback data:', err);
      return {
        total_suspicious: 0,
        total_blocked: 0,
        pending_review: 0,
        today_new: 0,
      };
    }
  }

  // Get Suspicious IPs List
  async getSuspiciousIPs(filters: IPFilters = {}): Promise<SuspiciousIPsResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.min_score !== undefined) params.append('min_score', filters.min_score.toString());

    const query = params.toString();
    try {
      return await this.makeRequest<SuspiciousIPsResponse>(`/suspicious${query ? `?${query}` : ''}`);
    } catch (err) {
      console.warn('Suspicious IPs API failed, returning fallback data:', err);
      return {
        data: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        has_next: false,
      };
    }
  }

  // Check Specific IP
  async checkIP(ip: string): Promise<IPCheckResult> {
    return this.makeRequest<IPCheckResult>(`/check/${encodeURIComponent(ip)}`);
  }

  // Block IP
  async blockIP(request: IPBlockRequest): Promise<IPBlockResponse> {
    return this.makeRequest<IPBlockResponse>('/block', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Unblock IP
  async unblockIP(ip: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/unblock/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
    });
  }

  // Mark IP as Reviewed
  async markIPReviewed(ip: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/review', {
      method: 'PUT',
      body: JSON.stringify({ ip_address: ip }),
    });
  }
}

// Export singleton instance
export const ipMonitoringApi = new IPMonitoringApiClient();
export default ipMonitoringApi;
