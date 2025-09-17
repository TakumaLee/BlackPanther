// Admin Dashboard Types
// 管理儀表板類型定義

export interface DashboardStats {
  total_users: number;
  total_articles: number;
  pending_reviews: number;
  active_articles: number;
  expired_articles: number;
  blocked_users: number;
  total_coins_spent: number;
  total_iap_revenue: number;
  fraud_score_high: number;
  user_growth_7d: number;
  article_growth_7d: number;
  popular_articles_24h: number;
}

export interface UserGrowthData {
  date: string;
  new_users: number;
  active_users: number;
}

export interface ArticleStatsData {
  date: string;
  new_articles: number;
  expired_articles: number;
  preserved_articles: number;
}

export interface RevenueData {
  date: string;
  iap_revenue: number;
  coins_purchased: number;
  transactions: number;
}

// Article type for user's recent articles
export interface UserArticle {
  id: string;
  title: string;
  content: string;
  views: number;
  likes: number;
  comments_count: number;
  created_at: string;
  expires_at?: string;
  is_expired: boolean;
}

// Transaction type for user's coin transactions
export interface UserTransaction {
  id: string;
  type: 'earn' | 'spend' | 'purchase';
  amount: number;
  description: string;
  created_at: string;
  related_item_id?: string;
  related_item_type?: string;
}

export interface UserInfo {
  id: string;
  email?: string;
  username?: string;
  display_name?: string;
  provider?: string;
  avatar_url?: string;
  coin_balance: number;
  total_articles: number;
  total_comments: number;
  total_reactions: number;
  fraud_score?: number;
  is_blocked: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserDetail extends UserInfo {
  phone_number?: string;
  birth_date?: string;
  registration_ip?: string;
  last_login_ip?: string;
  invite_permissions: string[];
  blocked_reason?: string;
  blocked_until?: string;
  recent_articles: UserArticle[];
  recent_transactions: UserTransaction[];
}

export interface UserList {
  users: UserInfo[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface BlockInfo {
  id: string;
  user_id: string;
  user_email?: string;
  user_username?: string;
  reason: string;
  blocked_by: string;
  blocked_by_username?: string;
  blocked_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  unblock_reason?: string;
  unblocked_by?: string;
  unblocked_at?: string;
}

export interface IPBlockInfo {
  id: string;
  ip_address: string;
  reason: string;
  blocked_by: string;
  blocked_by_username?: string;
  blocked_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockList {
  blocks: BlockInfo[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface IPBlockList {
  blocks: IPBlockInfo[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface UserAnalytics {
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  new_users_today: number;
  new_users_week: number;
  new_users_month: number;
  user_retention_rate: number;
  avg_session_duration: number;
}

export interface ContentAnalytics {
  total_articles: number;
  articles_today: number;
  articles_week: number;
  articles_month: number;
  active_articles: number;
  expired_articles: number;
  preserved_articles: number;
  avg_article_lifetime: number;
  total_comments: number;
  total_reactions: number;
}

export interface RevenueAnalytics {
  total_revenue: number;
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  total_transactions: number;
  avg_transaction_value: number;
  top_products: Array<{
    product_id: string;
    count: number;
    revenue: number;
  }>;
  coins_purchased: number;
  coins_spent: number;
}

export interface FraudAnalytics {
  high_risk_users: number;
  medium_risk_users: number;
  low_risk_users: number;
  blocked_attempts: number;
  fraud_prevented_amount: number;
  common_fraud_patterns: Array<{
    pattern: string;
    count: number;
    severity: 'high' | 'medium' | 'low';
  }>;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface ReviewRequest {
  id: string;
  user_id: string;
  user_email?: string;
  user_username?: string;
  requested_permission: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  fraud_score?: number;
}

export interface ReviewList {
  reviews: ReviewRequest[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

// API Request Types
export interface UserBlockRequest {
  user_id: string;
  reason: string;
  duration_hours?: number;
}

export interface UserUnblockRequest {
  user_id: string;
  reason: string;
}

export interface CreateIPBlockRequest {
  ip_address: string;
  reason: string;
  duration_hours?: number;
}

export interface UpdateBlockRequest {
  reason?: string;
  duration_hours?: number;
  is_active?: boolean;
}

export interface ReviewActionRequest {
  action: 'approve' | 'reject';
  reason?: string;
}

// Filter and Search Types
export interface UserFilters {
  search?: string;
  provider?: string;
  is_blocked?: boolean;
  fraud_score_min?: number;
  page?: number;
  limit?: number;
}

export interface BlockFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface ReviewFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  fraud_score?: 'high' | 'medium' | 'low' | 'all';
  page?: number;
  limit?: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

// Chart Data Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

export interface ChartConfig {
  series: ChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  type?: 'line' | 'bar' | 'pie' | 'area';
}

// Additional types for API responses
export interface ReviewDetail {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
  target_user_id: string;
  request_reason: string;
  fraud_score: number;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewStatistics {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  high_risk_count: number;
  approval_rate: number;
  average_review_time: number;
}

export interface BlockStatistics {
  total_user_blocks: number;
  total_ip_blocks: number;
  active_blocks: number;
  expired_blocks: number;
  blocks_today: number;
}

export interface UserArticlesResponse {
  articles: UserArticle[];
  total: number;
  page: number;
  has_next: boolean;
}

export interface UserTransactionsResponse {
  transactions: UserTransaction[];
  total: number;
  page: number;
  has_next: boolean;
}