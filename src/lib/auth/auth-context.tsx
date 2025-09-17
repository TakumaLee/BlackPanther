'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser, AuthContextType, LoginRequest } from '@/types/auth';
import { authService } from './auth-service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 在組件載入時檢查認證狀態
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentAdmin();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setLoading(true);
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshToken();
      // 刷新後重新獲取用戶資料
      const currentUser = await authService.getCurrentAdmin();
      setUser(currentUser);
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};