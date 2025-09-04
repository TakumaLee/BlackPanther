import { ApiResponse, InviteReview, DashboardStats, PaginatedResponse, PaginationParams, ReviewFilters } from '@/types'
import { authService } from '@/lib/auth/auth-service'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ReviewsAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // 獲取認證 header
    const authHeader = authService.getAuthHeader()
    
    // 如果沒有認證 token，拋出錯誤
    if (!authHeader) {
      throw new Error('未認證，請重新登入')
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      // 如果是 401 未認證，清除本地認證資料並重定向
      if (response.status === 401) {
        await authService.logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
        throw new Error('登入已過期，請重新登入')
      }
      
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // 獲取儀表板統計數據
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<ApiResponse<DashboardStats>>('/api/v1/admin/stats')
  }

  // 獲取審核列表
  async getReviews(
    params: PaginationParams & ReviewFilters
  ): Promise<ApiResponse<PaginatedResponse<InviteReview>>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<ApiResponse<PaginatedResponse<InviteReview>>>(
      `/api/v1/admin/reviews?${searchParams.toString()}`
    )
  }

  // 獲取單個審核詳情
  async getReview(id: string): Promise<ApiResponse<InviteReview>> {
    return this.request<ApiResponse<InviteReview>>(`/api/v1/admin/reviews/${id}`)
  }

  // 批准審核
  async approveReview(id: string, notes?: string): Promise<ApiResponse<InviteReview>> {
    return this.request<ApiResponse<InviteReview>>(`/api/v1/admin/reviews/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    })
  }

  // 拒絕審核
  async rejectReview(id: string, reason: string, notes?: string): Promise<ApiResponse<InviteReview>> {
    return this.request<ApiResponse<InviteReview>>(`/api/v1/admin/reviews/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, notes }),
    })
  }

  // 批量操作
  async batchApprove(ids: string[], notes?: string): Promise<ApiResponse<{ success: number; failed: number }>> {
    return this.request<ApiResponse<{ success: number; failed: number }>>('/api/v1/admin/reviews/batch-approve', {
      method: 'POST',
      body: JSON.stringify({ review_ids: ids, notes }),
    })
  }

  async batchReject(ids: string[], reason: string, notes?: string): Promise<ApiResponse<{ success: number; failed: number }>> {
    return this.request<ApiResponse<{ success: number; failed: number }>>('/api/v1/admin/reviews/batch-reject', {
      method: 'POST',
      body: JSON.stringify({ review_ids: ids, reason, notes }),
    })
  }
}

export const reviewsAPI = new ReviewsAPI()