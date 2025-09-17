'use client'

import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api/admin'
import { 
  UserAnalytics, 
  ContentAnalytics, 
  RevenueAnalytics, 
  FraudAnalytics,
  TimeSeriesData 
} from '@/types/admin'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  Users, 
  FileText, 
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  subtitle?: string
}

function MetricCard({ title, value, change, changeType = 'neutral', icon: Icon, subtitle }: MetricCardProps) {
  const changeColors = {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100'
  }

  const trendIcon = changeType === 'positive' ? TrendingUp : changeType === 'negative' ? TrendingDown : Activity

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {change && (
                  <div className={`ml-2 flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${changeColors[changeType]}`}>
                    {React.createElement(trendIcon, { className: "h-4 w-4 mr-1" })}
                    {change}
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-500 mt-1">
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

interface SimpleChartProps {
  data: TimeSeriesData[]
  title: string
  color?: string
}

function SimpleChart({ data, title, color = 'blue' }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {data.slice(-7).map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-500 flex-shrink-0">
              {new Date(item.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
            </div>
            <div className="flex-1 ml-4">
              <div className="flex items-center">
                <div 
                  className={`bg-${color}-500 h-6 rounded`}
                  style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                ></div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {item.value.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const { user } = useAuth()
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics | null>(null)
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null)
  const [fraudAnalytics, setFraudAnalytics] = useState<FraudAnalytics | null>(null)
  const [userTimeseries, setUserTimeseries] = useState<TimeSeriesData[]>([])
  const [revenueTimeseries, setRevenueTimeseries] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (user) {
      fetchAllAnalytics()
    }
  }, [user])

  const fetchAllAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [
        userAnalyticsData,
        contentAnalyticsData,
        revenueAnalyticsData,
        fraudAnalyticsData,
        userTimeseriesData,
        revenueTimeseriesData
      ] = await Promise.all([
        adminApi.getUserAnalytics(),
        adminApi.getContentAnalytics(),
        adminApi.getRevenueAnalytics(),
        adminApi.getFraudAnalytics(),
        adminApi.getUserTimeseries(30),
        adminApi.getRevenueTimeseries(30)
      ])

      setUserAnalytics(userAnalyticsData)
      setContentAnalytics(contentAnalyticsData)
      setRevenueAnalytics(revenueAnalyticsData)
      setFraudAnalytics(fraudAnalyticsData)
      setUserTimeseries(userTimeseriesData.data)
      setRevenueTimeseries(revenueTimeseriesData.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError(err instanceof Error ? err.message : '獲取統計數據失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const today = new Date()
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      const data = await adminApi.exportStatistics(
        thirtyDaysAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      )
      
      // 創建下載
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `statistics-${today.toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export statistics:', err)
      alert('導出統計數據失敗')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">載入統計數據...</p>
        </div>
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
            onClick={fetchAllAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重試
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* 標題區域 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  統計報告
                </h1>
                <p className="text-gray-600">
                  詳細的平台分析和統計數據
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {lastUpdated && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    更新時間: {lastUpdated.toLocaleString('zh-TW')}
                  </div>
                )}
                <button
                  onClick={fetchAllAnalytics}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新
                </button>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  導出數據
                </button>
              </div>
            </div>
          </div>

          {/* 用戶分析 */}
          {userAnalytics && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">用戶分析</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="總用戶數"
                  value={userAnalytics.total_users}
                  icon={Users}
                  subtitle="累計註冊用戶"
                />
                <MetricCard
                  title="今日活躍用戶"
                  value={userAnalytics.active_users_today}
                  change={`+${userAnalytics.new_users_today}`}
                  changeType="positive"
                  icon={Activity}
                  subtitle="今日新增"
                />
                <MetricCard
                  title="本週活躍用戶"
                  value={userAnalytics.active_users_week}
                  change={`+${userAnalytics.new_users_week}`}
                  changeType="positive"
                  icon={TrendingUp}
                  subtitle="本週新增"
                />
                <MetricCard
                  title="用戶留存率"
                  value={`${userAnalytics.user_retention_rate}%`}
                  icon={BarChart3}
                  subtitle="月度留存率"
                />
              </div>
            </div>
          )}

          {/* 內容分析 */}
          {contentAnalytics && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">內容分析</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="總文章數"
                  value={contentAnalytics.total_articles}
                  icon={FileText}
                  subtitle="累計發表文章"
                />
                <MetricCard
                  title="今日新文章"
                  value={contentAnalytics.articles_today}
                  change={`週增長 +${contentAnalytics.articles_week}`}
                  changeType="positive"
                  icon={TrendingUp}
                />
                <MetricCard
                  title="活躍文章"
                  value={contentAnalytics.active_articles}
                  icon={Activity}
                  subtitle="未過期文章"
                />
                <MetricCard
                  title="平均生命週期"
                  value={`${contentAnalytics.avg_article_lifetime.toFixed(1)}h`}
                  icon={BarChart3}
                  subtitle="文章平均存活時間"
                />
              </div>
            </div>
          )}

          {/* 收入分析 */}
          {revenueAnalytics && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">收入分析</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="總收入"
                  value={`$${revenueAnalytics.total_revenue.toFixed(2)}`}
                  icon={DollarSign}
                  subtitle="累計收入 (USD)"
                />
                <MetricCard
                  title="今日收入"
                  value={`$${revenueAnalytics.revenue_today.toFixed(2)}`}
                  change={`週增長 $${revenueAnalytics.revenue_week.toFixed(2)}`}
                  changeType="positive"
                  icon={TrendingUp}
                />
                <MetricCard
                  title="總交易數"
                  value={revenueAnalytics.total_transactions}
                  icon={Activity}
                  subtitle="完成的交易"
                />
                <MetricCard
                  title="平均交易價值"
                  value={`$${revenueAnalytics.avg_transaction_value.toFixed(2)}`}
                  icon={BarChart3}
                  subtitle="每筆交易平均"
                />
              </div>

              {/* 熱門產品 */}
              {revenueAnalytics.top_products.length > 0 && (
                <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">熱門產品</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {revenueAnalytics.top_products.map((product, index) => (
                      <div key={product.product_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">#{index + 1}</span>
                          <span className="text-sm text-gray-500">{product.product_id}</span>
                        </div>
                        <div className="mt-2">
                          <div className="text-lg font-semibold text-gray-900">
                            ${product.revenue.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.count} 次購買
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 詐騙分析 */}
          {fraudAnalytics && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">安全分析</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  title="高風險用戶"
                  value={fraudAnalytics.high_risk_users}
                  icon={AlertTriangle}
                  changeType="negative"
                  subtitle="詐騙評分 ≥ 0.7"
                />
                <MetricCard
                  title="中風險用戶"
                  value={fraudAnalytics.medium_risk_users}
                  icon={AlertTriangle}
                  changeType="neutral"
                  subtitle="詐騙評分 0.4-0.7"
                />
                <MetricCard
                  title="被阻止的嘗試"
                  value={fraudAnalytics.blocked_attempts}
                  icon={AlertTriangle}
                  changeType="positive"
                  subtitle="已阻止的詐騙"
                />
                <MetricCard
                  title="預防損失"
                  value={`$${fraudAnalytics.fraud_prevented_amount.toFixed(2)}`}
                  icon={DollarSign}
                  changeType="positive"
                  subtitle="預防的詐騙金額"
                />
              </div>

              {/* 常見詐騙模式 */}
              <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">常見詐騙模式</h3>
                <div className="space-y-3">
                  {fraudAnalytics.common_fraud_patterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`h-5 w-5 ${
                          pattern.severity === 'high' ? 'text-red-500' : 
                          pattern.severity === 'medium' ? 'text-yellow-500' : 
                          'text-green-500'
                        }`} />
                        <span className="font-medium text-gray-900">{pattern.pattern}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">{pattern.count} 次檢測</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pattern.severity === 'high' ? 'bg-red-100 text-red-800' : 
                          pattern.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {pattern.severity === 'high' ? '高風險' : 
                           pattern.severity === 'medium' ? '中風險' : 
                           '低風險'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 趨勢圖表 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {userTimeseries.length > 0 && (
              <SimpleChart
                data={userTimeseries}
                title="用戶增長趨勢 (近7天)"
                color="blue"
              />
            )}
            
            {revenueTimeseries.length > 0 && (
              <SimpleChart
                data={revenueTimeseries}
                title="收入趨勢 (近7天)"
                color="green"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}