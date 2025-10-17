// Admin Management Types
// 管理員帳戶管理類型定義

export interface Admin {
  id: string;
  email: string;
  username: string;
  role: 'super_admin' | 'admin' | 'moderator';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  last_login_ip?: string;
  failed_login_attempts: number;
}

export interface AdminListResponse {
  data: Admin[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface AdminCreateRequest {
  email: string;
  username: string;
  password: string;
  role: string;
}

export interface AdminUpdateRequest {
  username?: string;
  role?: string;
  is_active?: boolean;
}

export interface AdminLog {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

export interface AdminLogsResponse {
  data: AdminLog[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface ResetPasswordResponse {
  new_password: string;
}

export interface AdminFilters {
  search?: string;
  role?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}
