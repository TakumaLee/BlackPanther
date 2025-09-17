// 用戶類型
export interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  provider: 'google' | 'apple'
  created_at: string
  last_sign_in: string
  coins: number
  total_invites: number
  successful_invites: number
}

// 邀請類型
export interface Invite {
  id: string
  inviter_id: string
  inviter: User
  invitee_email?: string
  invitee_id?: string
  invitee?: User
  invite_code: string
  status: 'pending' | 'accepted' | 'rejected'
  fraud_score: number
  created_at: string
  used_at?: string
  rejected_at?: string
  rejection_reason?: string
}

// 邀請審核狀態
export interface InviteReview {
  id: string
  invite_id: string
  invite: Invite
  status: 'pending' | 'approved' | 'rejected'
  reviewer_id?: string
  reviewer?: User
  review_notes?: string
  reviewed_at?: string
  created_at: string
  fraud_indicators: {
    same_device: boolean
    suspicious_timing: boolean
    email_similarity: boolean
    ip_similarity: boolean
  }
}

// 統計數據
export interface DashboardStats {
  pending_reviews: number
  approved_today: number
  rejected_today: number
  total_users: number
  total_invites: number
  fraud_rate: number
  approval_rate: number
}

// API 響應類型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分頁類型
export interface PaginationParams {
  page: number
  limit: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// 過濾器類型
export interface ReviewFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all'
  fraud_score_min?: number
  fraud_score_max?: number
  date_from?: string
  date_to?: string
  search?: string
}