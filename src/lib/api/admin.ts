// Admin API Client
// 管理API客戶端

import { config, logger } from '@/config/environment';
import { authService } from '../auth/auth-service';
import { buildApiUrl } from './client';
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
  UserTransactionsResponse,
  // Moderation types
  ModerationQueueResponse,
  ModerationQueueFilters,
  ModerationAssignment,
  ModerationResolution,
  ModerationEscalation,
  ModerationStats,
  ContentReport
} from '@/types/admin';

class AdminApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authHeader = authService.getAuthHeader();
    if (!authHeader) {
      logger.warn('Admin API request attempted without authentication');
      throw new Error('管理員未登入');
    }

    const url = buildApiUrl(`/api/v1/admin${endpoint}`);
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options.headers,
      },
      ...options,
    };

    logger.debug('Making API request:', { url, method: options.method || 'GET' });

    try {
      const response = await fetch(url, requestConfig);
      
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
        logger.error('API request failed:', { url, status: response.status, errorMessage, errorType });
        throw error;
      }

      logger.debug('API request successful:', { url, status: response.status });
      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        logger.error('API request error:', { url, error: err.message });
        throw err;
      }
      const unknownError = new Error('API請求失敗') as Error & { type?: string };
      unknownError.type = 'network_error';
      logger.error('Unknown API error:', { url, error: unknownError.message });
      throw unknownError;
    }
  }

  // Make request to non-admin API paths (e.g., /api/v1/moderation)
  private async makeModerationRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authHeader = authService.getAuthHeader();
    if (!authHeader) {
      logger.warn('Moderation API request attempted without authentication');
      throw new Error('管理員未登入');
    }

    const url = buildApiUrl(`/api/v1/moderation${endpoint}`);
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options.headers,
      },
      ...options,
    };

    logger.debug('Making Moderation API request:', { url, method: options.method || 'GET' });

    try {
      const response = await fetch(url, requestConfig);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // Ignore JSON parse error
        }
        const error = new Error(errorMessage) as Error & { status?: number };
        error.status = response.status;
        logger.error('Moderation API request failed:', { url, status: response.status, errorMessage });
        throw error;
      }

      logger.debug('Moderation API request successful:', { url, status: response.status });
      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        logger.error('Moderation API request error:', { url, error: err.message });
        throw err;
      }
      throw new Error('API請求失敗');
    }
  }

  // Dashboard APIs
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      return await this.makeRequest<DashboardStats>('/dashboard/stats');
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
    return this.makeRequest<UserList>(`/users/${query ? `?${query}` : ''}`);
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

  // Demographics and Topics APIs
  async getUserDemographics(): Promise<{
    by_provider: Record<string, number>;
    by_country: Record<string, number>;
    by_platform: Record<string, number>;
  }> {
    try {
      return await this.makeRequest('/stats/demographics');
    } catch (err) {
      console.warn('User demographics API failed, returning fallback data:', err);
      return {
        by_provider: {},
        by_country: {},
        by_platform: {}
      };
    }
  }

  async getContentTopics(): Promise<{
    popular_topics: Array<{ topic: string; count: number }>;
    sentiment_distribution: Record<string, number>;
  }> {
    try {
      return await this.makeRequest('/stats/topics');
    } catch (err) {
      console.warn('Content topics API failed, returning fallback data:', err);
      return {
        popular_topics: [],
        sentiment_distribution: {}
      };
    }
  }

  async getAIUsageStats(): Promise<{
    total_analyses: number;
    analyses_today: number;
    analyses_week: number;
    by_model: Array<{ model: string; usage_count: number; revenue: number }>;
    avg_analysis_time: number;
  }> {
    try {
      return await this.makeRequest('/stats/ai-usage');
    } catch (err) {
      console.warn('AI usage stats API failed, returning fallback data:', err);
      return {
        total_analyses: 0,
        analyses_today: 0,
        analyses_week: 0,
        by_model: [],
        avg_analysis_time: 0
      };
    }
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
      return await this.makeRequest<ReviewList>(`/reviews${query ? `?${query}` : ''}`);
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
    return this.makeRequest(`/reviews/${reviewId}`);
  }

  async reviewRequest(reviewId: string, action: ReviewActionRequest): Promise<{ message: string }> {
    const endpoint = action.action === 'approve' ? 'approve' : 'reject';
    return this.makeRequest(`/reviews/${reviewId}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  async getReviewStatistics(): Promise<ReviewStatistics> {
    return this.makeRequest('/reviews/statistics');
  }

  // Content Management APIs (admin article endpoints)
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

    try {
      const data = await this.makeRequest<{
        articles: Array<Record<string, unknown>>;
        total: number;
        page: number;
        limit: number;
        has_next: boolean;
      }>(`/articles${query ? `?${query}` : ''}`);

      return data;
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
    return this.makeRequest(`/articles/${articleId}`);
  }

  // Admin Article Management APIs
  async deleteArticleAsAdmin(articleId: string, reason: string): Promise<{ message: string }> {
    return this.makeRequest(`/articles/${articleId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async moderateArticle(articleId: string, action: 'approve' | 'reject', reason?: string): Promise<{ message: string }> {
    return this.makeRequest(`/articles/${articleId}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  }

  async batchModerateArticles(
    articleIds: string[],
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<{
    success_count: number;
    failed_count: number;
    success_ids: string[];
    failed_ids: Array<{ id: string; error: string }>;
    message: string
  }> {
    return this.makeRequest('/articles/batch-moderate', {
      method: 'POST',
      body: JSON.stringify({ article_ids: articleIds, action, reason }),
    });
  }

  async batchDeleteArticles(
    articleIds: string[],
    reason: string
  ): Promise<{
    success_count: number;
    failed_count: number;
    success_ids: string[];
    failed_ids: Array<{ id: string; error: string }>;
    message: string
  }> {
    return this.makeRequest('/articles/batch-delete', {
      method: 'DELETE',
      body: JSON.stringify({ article_ids: articleIds, reason }),
    });
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

  // ============================================
  // Moderation / Content Reports APIs
  // ============================================

  /**
   * Get moderation queue with filters
   */
  async getModerationQueue(filters: ModerationQueueFilters = {}): Promise<ModerationQueueResponse> {
    const params = new URLSearchParams();

    if (filters.priority_min !== undefined) params.append('priority_min', filters.priority_min.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.assigned_to_me !== undefined) params.append('assigned_to_me', filters.assigned_to_me.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const query = params.toString();
    try {
      return await this.makeModerationRequest<ModerationQueueResponse>(`/queue${query ? `?${query}` : ''}`);
    } catch (err) {
      console.warn('Moderation queue API failed, returning fallback data:', err);
      return {
        items: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        has_next: false
      };
    }
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats(): Promise<ModerationStats> {
    try {
      return await this.makeModerationRequest<ModerationStats>('/stats');
    } catch (err) {
      console.warn('Moderation stats API failed, returning fallback data:', err);
      return {
        pending_count: 0,
        average_resolution_time_hours: 0,
        sla_compliance_rate: 0,
        escalation_count_24h: 0,
        moderator_performance: []
      };
    }
  }

  /**
   * Assign a report to a moderator
   */
  async assignReport(assignment: ModerationAssignment): Promise<{ message: string; report: ContentReport }> {
    return this.makeModerationRequest('/assign', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  /**
   * Resolve a moderation report
   */
  async resolveReport(resolution: ModerationResolution): Promise<{ message: string; report: ContentReport }> {
    return this.makeModerationRequest('/resolve', {
      method: 'POST',
      body: JSON.stringify(resolution),
    });
  }

  /**
   * Escalate a report
   */
  async escalateReport(escalation: ModerationEscalation): Promise<{ message: string; report: ContentReport }> {
    return this.makeModerationRequest('/escalate', {
      method: 'POST',
      body: JSON.stringify(escalation),
    });
  }

  /**
   * Create a content report (for testing purposes)
   */
  async createReport(data: {
    article_id?: string;
    report_type: string;
    description?: string;
  }): Promise<{ message: string; report: ContentReport }> {
    return this.makeModerationRequest('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const adminApi = new AdminApiClient();
export default adminApi;