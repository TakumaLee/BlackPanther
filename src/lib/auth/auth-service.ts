import { AdminUser, LoginRequest, LoginResponse, TokenData } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

class AuthService {
  private tokenData: TokenData | null = null;
  private currentUser: AdminUser | null = null;

  constructor() {
    // 在客戶端初始化時從 localStorage 讀取資料
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  /**
   * 從 localStorage 載入認證資料
   */
  private loadFromStorage(): void {
    try {
      const tokenStr = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      
      if (tokenStr && userStr) {
        this.tokenData = JSON.parse(tokenStr);
        this.currentUser = JSON.parse(userStr);
        
        // 檢查 token 是否過期
        if (this.tokenData && this.tokenData.expires_at < Date.now()) {
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error('Failed to load auth data from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * 儲存認證資料到 localStorage
   */
  private saveToStorage(tokenData: TokenData, user: AdminUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    this.tokenData = tokenData;
    this.currentUser = user;
  }

  /**
   * 清除 localStorage 中的認證資料
   */
  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.tokenData = null;
    this.currentUser = null;
  }

  /**
   * 管理員登入
   */
  async login(credentials: LoginRequest): Promise<AdminUser> {
    try {
      // Use Next.js API route instead of direct backend call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const loginResponse: LoginResponse = await response.json();
      
      // 計算 token 過期時間
      const expiresAt = Date.now() + loginResponse.expires_in * 1000;
      const tokenData: TokenData = {
        access_token: loginResponse.access_token,
        token_type: loginResponse.token_type,
        expires_in: loginResponse.expires_in,
        expires_at: expiresAt,
      };

      // 儲存到 localStorage
      this.saveToStorage(tokenData, loginResponse.admin);

      return loginResponse.admin;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      // 如果有有效的 token，嘗試呼叫後端登出 API
      if (this.tokenData?.access_token) {
        await fetch(`${API_BASE_URL}/api/v1/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `${this.tokenData.token_type} ${this.tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // 如果登出 API 失敗，仍然清除本地資料
          console.warn('Backend logout failed, clearing local storage anyway');
        });
      }
    } finally {
      // 無論如何都要清除本地儲存
      this.clearStorage();
    }
  }

  /**
   * 獲取目前登入的管理員資訊
   * Enhanced to not clear session on temporary server errors
   */
  async getCurrentAdmin(): Promise<AdminUser | null> {
    if (!this.tokenData?.access_token) {
      return null;
    }

    // 如果 token 過期，清除儲存
    if (this.tokenData.expires_at < Date.now()) {
      this.clearStorage();
      return null;
    }

    // 如果有快取的用戶資料，直接返回
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `${this.tokenData.token_type} ${this.tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // 只有在真正的認證錯誤時才清除 session
          let shouldClearSession = false;
          try {
            const errorData = await response.json();
            const errorMessage = errorData.detail || errorData.message || '';
            
            // 只有特定的錯誤訊息才清除 session
            if (errorMessage.includes('Invalid token') ||
                errorMessage.includes('expired') ||
                errorMessage.includes('Token expired') ||
                errorMessage.includes('JWT')) {
              shouldClearSession = true;
            }
          } catch {
            // 如果無法解析錯誤，假設是 token 問題
            shouldClearSession = true;
          }
          
          if (shouldClearSession) {
            console.log('Token appears to be invalid, clearing session');
            this.clearStorage();
            return null;
          }
        }
        
        // 對於其他錯誤（如 500, 503），不清除 session，只是記錄錯誤
        console.warn(`Admin auth check failed with ${response.status}, keeping session`);
        return this.currentUser; // 返回現有的用戶資料以保持登入狀態
      }

      const userData = await response.json();
      this.currentUser = userData;
      
      // 更新 localStorage 中的用戶資料
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }

      return userData;
    } catch (error) {
      console.error('Get current admin error:', error);
      
      // 不要在網路錯誤或伺服器錯誤時清除 session
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Network error during auth check, keeping session');
        return this.currentUser; // 保持登入狀態
      }
      
      // 其他錯誤也不清除 session，只是記錄
      console.warn('Auth check error, but keeping session:', error);
      return this.currentUser;
    }
  }

  /**
   * 檢查是否已認證
   */
  isAuthenticated(): boolean {
    return !!(this.tokenData?.access_token && this.tokenData.expires_at > Date.now());
  }

  /**
   * 獲取當前的 access token
   */
  getAccessToken(): string | null {
    if (this.tokenData?.access_token && this.tokenData.expires_at > Date.now()) {
      return this.tokenData.access_token;
    }
    return null;
  }

  /**
   * 獲取 Authorization header 值
   */
  getAuthHeader(): string | null {
    const token = this.getAccessToken();
    if (token && this.tokenData?.token_type) {
      return `${this.tokenData.token_type} ${token}`;
    }
    return null;
  }

  /**
   * 刷新 token（如果後端支援）
   */
  async refreshToken(): Promise<void> {
    // TODO: 實作 token 刷新邏輯，如果後端支援的話
    // 目前暫時不實作，因為後端可能不支援 refresh token
    console.log('Token refresh not implemented yet');
  }

  /**
   * 獲取當前快取的用戶資料
   */
  getCachedUser(): AdminUser | null {
    return this.currentUser;
  }
}

// 單例模式
export const authService = new AuthService();