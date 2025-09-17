'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Bell, LogOut, Settings, Shield, User } from 'lucide-react'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuth()

  const handleSignOut = async () => {
    setShowUserMenu(false)
    await logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* 通知鈴鐺 */}
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* 用戶菜單 */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email?.split('@')[0] || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  管理員
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  設定
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  登出
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}