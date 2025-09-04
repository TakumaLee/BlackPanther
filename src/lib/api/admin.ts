// Admin API Client
// 管理API客戶端

import { authService } from '../auth/auth-service';
import {
  DashboardStats,
  UserGrowthData,
  ArticleStatsData,
  RevenueData,
  UserList,
  UserDetail,
  UserFilters,
  UserBlockRequest,
  UserUnblockRequest,
  BlockList,
  IPBlockList,
  BlockFilters,
  CreateIPBlockRequest,
  UpdateBlockRequest,
  UserAnalytics,
  ContentAnalytics,
  RevenueAnalytics,
  FraudAnalytics,
  TimeSeriesData,
  ReviewList,
  ReviewFilters,
  ReviewActionRequest
} from '@/types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class AdminApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authHeader = authService.getAuthHeader();
    if (!authHeader) {
      throw new Error('管理員未登入');
    }

    const url = `${API_BASE_URL}/api/v1/admin${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // 如果無法解析錯誤JSON，使用狀態碼
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('API請求失敗');
    }
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<DashboardStats> {
    return this.makeRequest<DashboardStats>('/dashboard/stats');
  }

  async getUserGrowthStats(days: number = 30): Promise<UserGrowthData[]> {
    return this.makeRequest<UserGrowthData[]>(`/dashboard/stats/user-growth?days=${days}`);
  }

  async getArticleStats(days: number = 30): Promise<ArticleStatsData[]> {
    return this.makeRequest<ArticleStatsData[]>(`/dashboard/stats/articles?days=${days}`);
  }

  async getRevenueStats(days: number = 30): Promise<RevenueData[]> {
    return this.makeRequest<RevenueData[]>(`/dashboard/stats/revenue?days=${days}`);
  }

  // User Management APIs
  async getUsers(filters: UserFilters = {}): Promise<UserList> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.provider) params.append('provider', filters.provider);
    if (filters.is_blocked !== undefined) params.append('is_blocked', filters.is_blocked.toString());
    if (filters.fraud_score_min !== undefined) params.append('fraud_score_min', filters.fraud_score_min.toString());

    const query = params.toString();
    return this.makeRequest<UserList>(`/users${query ? `?${query}` : ''}`);
  }

  async getUserDetail(userId: string): Promise<UserDetail> {
    return this.makeRequest<UserDetail>(`/users/${userId}`);
  }

  async blockUser(request: UserBlockRequest): Promise<{ message: string }> {
    return this.makeRequest('/users/block', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async unblockUser(request: UserUnblockRequest): Promise<{ message: string }> {
    return this.makeRequest('/users/unblock', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getUserArticles(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    return this.makeRequest(`/users/${userId}/articles?page=${page}&limit=${limit}`);
  }

  async getUserTransactions(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    return this.makeRequest(`/users/${userId}/transactions?page=${page}&limit=${limit}`);
  }

  // Block Management APIs
  async getUserBlocks(filters: BlockFilters = {}): Promise<BlockList> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    const query = params.toString();
    return this.makeRequest<BlockList>(`/blocks/users${query ? `?${query}` : ''}`);
  }

  async getIPBlocks(filters: BlockFilters = {}): Promise<IPBlockList> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    const query = params.toString();
    return this.makeRequest<IPBlockList>(`/blocks/ips${query ? `?${query}` : ''}`);
  }

  async createIPBlock(request: CreateIPBlockRequest): Promise<{ message: string; block_id: string }> {
    return this.makeRequest('/blocks/ips', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateUserBlock(blockId: string, request: UpdateBlockRequest): Promise<{ message: string }> {
    return this.makeRequest(`/blocks/users/${blockId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async updateIPBlock(blockId: string, request: UpdateBlockRequest): Promise<{ message: string }> {
    return this.makeRequest(`/blocks/ips/${blockId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteUserBlock(blockId: string): Promise<{ message: string }> {
    return this.makeRequest(`/blocks/users/${blockId}`, {
      method: 'DELETE',
    });
  }

  async deleteIPBlock(blockId: string): Promise<{ message: string }> {
    return this.makeRequest(`/blocks/ips/${blockId}`, {
      method: 'DELETE',
    });
  }

  async getBlockStats(): Promise<any> {
    return this.makeRequest('/blocks/stats');
  }

  // Statistics APIs
  async getUserAnalytics(): Promise<UserAnalytics> {
    return this.makeRequest<UserAnalytics>('/stats/users');
  }

  async getContentAnalytics(): Promise<ContentAnalytics> {
    return this.makeRequest<ContentAnalytics>('/stats/content');
  }

  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    return this.makeRequest<RevenueAnalytics>('/stats/revenue');
  }

  async getFraudAnalytics(): Promise<FraudAnalytics> {
    return this.makeRequest<FraudAnalytics>('/stats/fraud');
  }

  async getUserTimeseries(days: number = 30): Promise<{ data: TimeSeriesData[] }> {
    return this.makeRequest(`/stats/timeseries/users?days=${days}`);
  }

  async getRevenueTimeseries(days: number = 30): Promise<{ data: TimeSeriesData[] }> {
    return this.makeRequest(`/stats/timeseries/revenue?days=${days}`);
  }

  async exportStatistics(startDate: string, endDate: string, format: 'json' | 'csv' = 'json'): Promise<any> {
    return this.makeRequest(`/stats/export?start_date=${startDate}&end_date=${endDate}&format=${format}`);
  }

  // Review Management APIs
  async getReviews(filters: ReviewFilters = {}): Promise<ReviewList> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.fraud_score && filters.fraud_score !== 'all') params.append('fraud_score', filters.fraud_score);

    const query = params.toString();
    return this.makeRequest<ReviewList>(`/reviews${query ? `?${query}` : ''}`);
  }

  async getReview(reviewId: string): Promise<any> {
    return this.makeRequest(`/reviews/${reviewId}`);
  }

  async reviewRequest(reviewId: string, action: ReviewActionRequest): Promise<{ message: string }> {
    return this.makeRequest(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(action),
    });
  }

  async getReviewStatistics(): Promise<any> {
    return this.makeRequest('/reviews/statistics');
  }
}

// Export singleton instance
export const adminApi = new AdminApiClient();
export default adminApi;