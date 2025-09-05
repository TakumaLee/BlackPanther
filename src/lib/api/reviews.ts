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
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
        
        // 只有在真正的認證錯誤時才清除認證並重定向
        if (response.status === 401) {
          // 檢查是否為真正的 token 過期或無效
          if (errorMessage.includes('Invalid token') || 
              errorMessage.includes('expired') ||
              errorMessage.includes('Token expired') ||
              errorMessage.includes('JWT')) {
            console.log('Token appears to be invalid, logging out');
            await authService.logout()
            if (typeof window !== 'undefined') {
              window.location.href = '/'
            }
            throw new Error('登入已過期，請重新登入')
          } else {
            // 對於其他 401 錯誤（如權限不足、API 不存在等），不清除認證
            console.warn(`API call failed with 401 but keeping session: ${errorMessage}`);
            throw new Error(`權限錯誤: ${errorMessage}`);
          }
        }
      } catch {
        // 如果無法解析錯誤回應
        if (response.status === 401) {
          // 對於無法解析的 401 錯誤，不要立即登出
          // 可能是臨時的網路問題或伺服器錯誤
          console.warn('401 error with unparsable response, but keeping session for now');
          throw new Error('API 訪問被拒絕，請稍後再試')
        }
        errorMessage = 'Network error';
      }
      
      throw new Error(errorMessage);
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