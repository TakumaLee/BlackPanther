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
  ReviewActionRequest,
  ReviewDetail,
  ReviewStatistics,
  BlockStatistics,
  UserArticlesResponse,
  UserTransactionsResponse
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
        let errorType = 'api_error';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
          
          // 只有在真正的認證錯誤時才標記為 auth_error
          if (response.status === 401 && 
              (errorMessage.includes('Invalid token') || 
               errorMessage.includes('expired') ||
               errorMessage.includes('unauthorized'))) {
            errorType = 'auth_error';
          } else if (response.status === 403) {
            errorType = 'permission_error';
          } else if (response.status >= 500) {
            errorType = 'server_error';
          }
        } catch (err) {
          // 如果無法解析錯誤JSON，使用狀態碼
          // 但對於 401，不要立即標記為 auth_error，除非確定是認證問題
          if (response.status === 401) {
            // 無法確定是真正的認證錯誤，標記為一般 API 錯誤
            errorType = 'api_error';
            errorMessage = 'API 訪問被拒絕，可能是權限不足或 API 不存在';
          } else if (response.status === 403) {
            errorType = 'permission_error';
          } else if (response.status >= 500) {
            errorType = 'server_error';
          }
        }
        
        const error = new Error(errorMessage) as Error & { type?: string; status?: number };
        error.type = errorType;
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      const unknownError = new Error('API請求失敗') as Error & { type?: string };
      unknownError.type = 'network_error';
      throw unknownError;
    }
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await this.makeRequest<DashboardStats>('/stats');
    } catch (err) {
      // Provide fallback data for dashboard stats
      console.warn('Dashboard stats API failed, returning fallback data:', err);
      return {
        total_users: 0,
        total_articles: 0,
        pending_reviews: 0,
        active_articles: 0,
        expired_articles: 0,
        blocked_users: 0,
        total_coins_spent: 0,
        total_iap_revenue: 0,
        fraud_score_high: 0,
        user_growth_7d: 0,
        article_growth_7d: 0,
        popular_articles_24h: 0
      } as DashboardStats;
    }
  }

  async getUserGrowthStats(days: number = 30): Promise<UserGrowthData[]> {
    return this.makeRequest<UserGrowthData[]>(`/stats/user-growth?days=${days}`);
  }

  async getArticleStats(days: number = 30): Promise<ArticleStatsData[]> {
    return this.makeRequest<ArticleStatsData[]>(`/stats/articles?days=${days}`);
  }

  async getRevenueStats(days: number = 30): Promise<RevenueData[]> {
    return this.makeRequest<RevenueData[]>(`/stats/revenue?days=${days}`);
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

  async getUserArticles(userId: string, page: number = 1, limit: number = 10): Promise<UserArticlesResponse> {
    return this.makeRequest(`/users/${userId}/articles?page=${page}&limit=${limit}`);
  }

  async getUserTransactions(userId: string, page: number = 1, limit: number = 10): Promise<UserTransactionsResponse> {
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

  async getBlockStats(): Promise<BlockStatistics> {
    return this.makeRequest('/blocks/stats');
  }

  // Statistics APIs with fallback handling
  async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      return await this.makeRequest<UserAnalytics>('/stats/users');
    } catch (err) {
      console.warn('User analytics API failed, returning fallback data:', err);
      return {
        total_users: 0,
        active_users_today: 0,
        active_users_week: 0,
        active_users_month: 0,
        new_users_today: 0,
        new_users_week: 0,
        new_users_month: 0,
        user_retention_rate: 0,
        avg_session_duration: 0
      } as UserAnalytics;
    }
  }

  async getContentAnalytics(): Promise<ContentAnalytics> {
    try {
      return await this.makeRequest<ContentAnalytics>('/stats/content');
    } catch (err) {
      console.warn('Content analytics API failed, returning fallback data:', err);
      return {
        total_articles: 0,
        articles_today: 0,
        articles_week: 0,
        articles_month: 0,
        active_articles: 0,
        expired_articles: 0,
        preserved_articles: 0,
        avg_article_lifetime: 0,
        total_comments: 0,
        total_reactions: 0
      } as ContentAnalytics;
    }
  }

  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    try {
      return await this.makeRequest<RevenueAnalytics>('/stats/revenue');
    } catch (err) {
      console.warn('Revenue analytics API failed, returning fallback data:', err);
      return {
        total_revenue: 0,
        revenue_today: 0,
        revenue_week: 0,
        revenue_month: 0,
        total_transactions: 0,
        avg_transaction_value: 0,
        top_products: [],
        coins_purchased: 0,
        coins_spent: 0
      } as RevenueAnalytics;
    }
  }

  async getFraudAnalytics(): Promise<FraudAnalytics> {
    try {
      return await this.makeRequest<FraudAnalytics>('/stats/fraud');
    } catch (err) {
      console.warn('Fraud analytics API failed, returning fallback data:', err);
      return {
        high_risk_users: 0,
        medium_risk_users: 0,
        low_risk_users: 0,
        blocked_attempts: 0,
        fraud_prevented_amount: 0,
        common_fraud_patterns: []
      } as FraudAnalytics;
    }
  }

  async getUserTimeseries(days: number = 30): Promise<{ data: TimeSeriesData[] }> {
    return this.makeRequest(`/stats/timeseries/users?days=${days}`);
  }

  async getRevenueTimeseries(days: number = 30): Promise<{ data: TimeSeriesData[] }> {
    return this.makeRequest(`/stats/timeseries/revenue?days=${days}`);
  }

  async exportStatistics(startDate: string, endDate: string, format: 'json' | 'csv' = 'json'): Promise<Blob | unknown> {
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
    try {
      return await this.makeRequest<ReviewList>(`/invite-reviews${query ? `?${query}` : ''}`);
    } catch (err) {
      // Provide fallback data for reviews
      console.warn('Reviews API failed, returning fallback data:', err);
      return {
        reviews: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        has_next: false
      };
    }
  }

  async getReview(reviewId: string): Promise<ReviewDetail> {
    return this.makeRequest(`/invite-reviews/${reviewId}`);
  }

  async reviewRequest(reviewId: string, action: ReviewActionRequest): Promise<{ message: string }> {
    const endpoint = action.action === 'approve' ? 'approve' : 'reject';
    return this.makeRequest(`/invite-reviews/${reviewId}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  async getReviewStatistics(): Promise<ReviewStatistics> {
    return this.makeRequest('/invite-reviews/statistics');
  }

  // Content Management APIs (using general article API for now)
  async getArticles(filters: {
    page?: number;
    limit?: number;
    sort?: 'latest' | 'popular';
    filter?: 'active' | 'all';
    search?: string;
  } = {}): Promise<{
    articles: Array<Record<string, unknown>>;
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
  }> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.filter) params.append('filter', filters.filter);

    const query = params.toString();
    const url = `${API_BASE_URL}/api/v1/articles${query ? `?${query}` : ''}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader() || '',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        articles: data.articles || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 20,
        has_next: data.has_next || false
      };
    } catch (err) {
      console.warn('Articles API failed, returning fallback data:', err);
      return {
        articles: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        has_next: false
      };
    }
  }

  async getArticleDetail(articleId: string): Promise<Record<string, unknown>> {
    const url = `${API_BASE_URL}/api/v1/articles/${articleId}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authService.getAuthHeader() || '',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      throw new Error('Failed to fetch article detail');
    }
  }

  // Placeholder methods for admin-only content operations (to be implemented in backend)
  async deleteArticleAsAdmin(_articleId: string, _reason: string): Promise<{ message: string }> {
    // TODO: Implement proper admin delete endpoint in backend
    throw new Error('Admin article deletion endpoint not implemented yet');
  }

  async moderateArticle(_articleId: string, _action: 'approve' | 'reject', _reason: string): Promise<{ message: string }> {
    // TODO: Implement article moderation endpoint in backend
    throw new Error('Article moderation endpoint not implemented yet');
  }

  // Economy Configuration APIs
  async getEconomyConfig(): Promise<Record<string, unknown>> {
    return this.makeRequest('/economy/config');
  }

  async updateEconomyConfig(config: Record<string, unknown>): Promise<{ success: boolean; config: Record<string, unknown>; message: string }> {
    return this.makeRequest('/economy/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async resetEconomyConfig(): Promise<{ success: boolean; config: Record<string, unknown>; message: string }> {
    return this.makeRequest('/economy/config/reset', {
      method: 'POST',
    });
  }

  async previewPricingChanges(model: string, newPrice: number): Promise<Record<string, unknown>> {
    return this.makeRequest(`/economy/pricing-preview?model=${model}&new_price=${newPrice}`);
  }
}

// Export singleton instance
export const adminApi = new AdminApiClient();
export default adminApi;