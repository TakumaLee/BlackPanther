'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api/admin'
import { DashboardStats } from '@/types/admin'
import { useAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'
import {
  Clock,
  XCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  Eye,
  Activity,
  FileText,
  Shield,
  DollarSign,
  Settings,
  BarChart3,
  UserCheck,
  Monitor,
  Bot,
  Coins
} from 'lucide-react'
import { FeatureCard } from '@/components/dashboard/FeatureCard'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  subtitle?: string
}

function StatCard({ title, value, icon: Icon, change, changeType = 'neutral', subtitle }: StatCardProps) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${changeColors[changeType]}`}>
                    {changeType === 'positive' && '+'}
                    {change}
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-xs text-gray-500 mt-1">
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        setError(err instanceof Error ? err.message : '網路錯誤，請重新整理頁面')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重新整理
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">無數據</h2>
          <p className="text-gray-500">暫無統計數據</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* 標題區域 */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                管理儀表板
              </h1>
              <p className="text-gray-600">
                Black Swamp 平台的即時統計和管理概況
              </p>
            </div>

            {/* 主要統計指標 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                title="總用戶數"
                value={stats.total_users.toLocaleString()}
                icon={Users}
                change={`+${stats.user_growth_7d}`}
                changeType="positive"
                subtitle="7天增長"
              />
              <StatCard
                title="總文章數"
                value={stats.total_articles.toLocaleString()}
                icon={FileText}
                change={`+${stats.article_growth_7d}`}
                changeType="positive"
                subtitle="7天增長"
              />
              <StatCard
                title="待審核"
                value={stats.pending_reviews}
                icon={Clock}
                subtitle="需要處理的邀請請求"
                changeType="neutral"
              />
              <StatCard
                title="被封鎖用戶"
                value={stats.blocked_users}
                icon={Shield}
                changeType="neutral"
              />
            </div>

            {/* 內容統計 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <StatCard
                title="活躍文章"
                value={stats.active_articles.toLocaleString()}
                icon={Activity}
                subtitle="未過期的文章"
                changeType="positive"
              />
              <StatCard
                title="已過期文章"
                value={stats.expired_articles.toLocaleString()}
                icon={XCircle}
                subtitle="自然過期"
                changeType="neutral"
              />
              <StatCard
                title="24小時熱門文章"
                value={stats.popular_articles_24h}
                icon={TrendingUp}
                subtitle="有互動的文章"
                changeType="positive"
              />
            </div>

            {/* 收入和風險指標 */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              <StatCard
                title="總收入 (USD)"
                value={`$${stats.total_iap_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                icon={DollarSign}
                changeType="positive"
                subtitle="IAP交易收入"
              />
              <StatCard
                title="消費Coins"
                value={stats.total_coins_spent.toLocaleString()}
                icon={Activity}
                subtitle="用戶總消費"
                changeType="neutral"
              />
              <StatCard
                title="高風險用戶"
                value={stats.fraud_score_high}
                icon={AlertTriangle}
                subtitle="詐騙評分 ≥ 0.7"
                changeType="negative"
              />
            </div>

            {/* 核心功能導航 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                核心功能
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <FeatureCard
                  title="經濟系統配置"
                  description="管理金幣經濟、IAP產品和定價策略"
                  icon={Coins}
                  href="/dashboard/economy"
                  color="orange"
                  stats={stats ? `$${stats.total_iap_revenue.toLocaleString()} 總收入` : undefined}
                />
                <FeatureCard
                  title="用戶管理"
                  description="查看和管理用戶帳戶、封鎖狀態"
                  icon={Users}
                  href="/dashboard/users"
                  color="blue"
                  stats={stats ? `${stats.total_users.toLocaleString()} 總用戶` : undefined}
                />
                <FeatureCard
                  title="內容管理"
                  description="監控和管理平台上的文章內容"
                  icon={FileText}
                  href="/dashboard/content"
                  color="green"
                  stats={stats ? `${stats.total_articles.toLocaleString()} 總文章` : undefined}
                />
                <FeatureCard
                  title="數據分析"
                  description="查看詳細的用戶行為和業務分析"
                  icon={BarChart3}
                  href="/dashboard/analytics"
                  color="purple"
                />
                <FeatureCard
                  title="邀請系統"
                  description="管理邀請請求和審核流程"
                  icon={UserCheck}
                  href="/dashboard/invites"
                  color="indigo"
                  stats={stats && stats.pending_reviews > 0 ? `${stats.pending_reviews} 待審核` : undefined}
                />
                <FeatureCard
                  title="系統監控"
                  description="監控系統健康狀況和性能指標"
                  icon={Monitor}
                  href="/dashboard/monitoring"
                  color="gray"
                />
                <FeatureCard
                  title="AI 配置"
                  description="配置內容審核和AI模型參數"
                  icon={Bot}
                  href="/dashboard/ai-config"
                  color="pink"
                />
                <FeatureCard
                  title="系統設定"
                  description="管理平台的全局設定和配置"
                  icon={Settings}
                  href="/dashboard/settings"
                  color="red"
                />
              </div>
            </div>

            {/* 快速操作區域 */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                快速操作
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/dashboard/reviews" className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Eye className="h-4 w-4 mr-2" />
                  查看待審核
                </Link>
                <Link href="/dashboard/reviews?fraud_score=high" className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  高風險用戶
                </Link>
                <Link href="/dashboard/users" className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Users className="h-4 w-4 mr-2" />
                  用戶管理
                </Link>
                <Link href="/dashboard/blocks" className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Shield className="h-4 w-4 mr-2" />
                  封鎖管理
                </Link>
              </div>
            </div>

            {/* 系統狀態 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-3"></div>
                <p className="text-sm text-green-700">
                  系統運行正常 - 最後更新：{new Date().toLocaleString('zh-TW')}
                </p>
                <div className="ml-auto text-xs text-green-600">
                  管理員：{user?.username || user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}