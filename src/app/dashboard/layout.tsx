'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // 未認證，重定向到登入頁面
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // 將會重定向到登入頁面
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* 側邊欄 */}
      <Sidebar className="md:flex md:flex-shrink-0" />
      
      {/* 主要內容區域 */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header title="管理控制台" />
        
        {/* 主要內容 */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}