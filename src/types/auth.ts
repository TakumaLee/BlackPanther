export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'moderator' | 'admin' | 'super_admin';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  admin: AdminUser;
}

export interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number; // 計算後的過期時間戳
}