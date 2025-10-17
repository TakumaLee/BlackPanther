'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api/admin'
import { UserDetail, UserArticle, UserTransaction } from '@/types/admin'
import Image from 'next/image'
import {
  ArrowLeft,
  Coins,
  FileText,
  MessageCircle,
  Heart,
  Shield,
  ShieldOff,
  Calendar,
  Mail,
  User as UserIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'

type TabType = 'overview' | 'articles' | 'transactions' | 'logs'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  useEffect(() => {
    loadUserDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadUserDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getUserDetail(userId)
      setUser(data)
    } catch (err) {
      console.error('Failed to load user detail:', err)
      setError(err instanceof Error ? err.message : '載入用戶資料失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleBlock = async () => {
    if (!user) return

    const reason = prompt('請輸入封鎖原因:')
    if (!reason) return

    if (!confirm(`確定要封鎖用戶 ${user.display_name || user.username} 嗎？`)) return

    try {
      await adminApi.blockUser({ user_id: userId, reason })
      alert('用戶已封鎖')
      loadUserDetail()
    } catch (err) {
      console.error('Failed to block user:', err)
      alert('封鎖失敗: ' + (err instanceof Error ? err.message : '未知錯誤'))
    }
  }

  const handleUnblock = async () => {
    if (!user) return

    const reason = prompt('請輸入解除封鎖原因:')
    if (!reason) return

    if (!confirm(`確定要解除封鎖用戶 ${user.display_name || user.username} 嗎？`)) return

    try {
      await adminApi.unblockUser({ user_id: userId, reason })
      alert('已解除封鎖')
      loadUserDetail()
    } catch (err) {
      console.error('Failed to unblock user:', err)
      alert('解除封鎖失敗: ' + (err instanceof Error ? err.message : '未知錯誤'))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRiskLevel = (score?: number) => {
    if (!score) return '未評分'
    if (score >= 0.7) return '高風險'
    if (score >= 0.4) return '中風險'
    return '低風險'
  }

  const getRiskLevelColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800'
    if (score >= 0.7) return 'bg-red-100 text-red-800'
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-500">{error || '用戶不存在'}</p>
          <div className="mt-4 space-x-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              返回
            </button>
            <button
              onClick={loadUserDetail}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              重試
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header with back button */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回用戶列表
            </button>
            <h1 className="text-2xl font-bold text-gray-900">用戶詳細資訊</h1>
          </div>

          {/* User basic info card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-start justify-between">
              {/* Left: Avatar and basic info */}
              <div className="flex items-start space-x-4">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.display_name || user.username || '用戶'}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="h-10 w-10 text-gray-500" />
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.display_name || user.username || '未命名用戶'}
                  </h2>
                  {user.email && (
                    <p className="flex items-center text-gray-600 mt-1">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </p>
                  )}
                  <div className="flex items-center mt-2 space-x-2">
                    {/* Provider badge */}
                    {user.provider && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {user.provider}
                      </span>
                    )}

                    {/* Blocked status badge */}
                    {user.is_blocked && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        已封鎖
                      </span>
                    )}

                    {/* Risk level badge */}
                    <span className={`px-2 py-1 text-xs rounded ${getRiskLevelColor(user.fraud_score)}`}>
                      風險: {getRiskLevel(user.fraud_score)}
                      {user.fraud_score !== undefined && ` (${user.fraud_score.toFixed(2)})`}
                    </span>
                  </div>

                  {/* Time info */}
                  <div className="mt-3 text-sm text-gray-500 space-y-1">
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      註冊日期: {formatDate(user.created_at)}
                    </p>
                    {user.last_login_at && (
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        最後登入: {formatDate(user.last_login_at)}
                      </p>
                    )}
                  </div>

                  {/* Blocked info */}
                  {user.is_blocked && user.blocked_reason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800">封鎖原因:</p>
                      <p className="text-sm text-red-700 mt-1">{user.blocked_reason}</p>
                      {user.blocked_until && (
                        <p className="text-xs text-red-600 mt-1">
                          封鎖至: {formatDate(user.blocked_until)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Action buttons */}
              <div className="flex space-x-2">
                {user.is_blocked ? (
                  <button
                    onClick={handleUnblock}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <ShieldOff className="h-4 w-4 mr-2" />
                    解除封鎖
                  </button>
                ) : (
                  <button
                    onClick={handleBlock}
                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    封鎖用戶
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Statistics cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Coins balance */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Coins 餘額</p>
                  <p className="text-2xl font-bold mt-2">{user.coin_balance}</p>
                </div>
                <div className="text-yellow-500">
                  <Coins className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Articles count */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">發表文章</p>
                  <p className="text-2xl font-bold mt-2">{user.total_articles}</p>
                </div>
                <div className="text-blue-500">
                  <FileText className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Comments count */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">留言數</p>
                  <p className="text-2xl font-bold mt-2">{user.total_comments || 0}</p>
                </div>
                <div className="text-green-500">
                  <MessageCircle className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Reactions count */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">反應數</p>
                  <p className="text-2xl font-bold mt-2">{user.total_reactions || 0}</p>
                </div>
                <div className="text-purple-500">
                  <Heart className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs navigation */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  概覽
                </button>
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'articles'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  文章
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'transactions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  交易記錄
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'logs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  操作日誌
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Overview tab */}
              {activeTab === 'overview' && (
                <OverviewTab user={user} formatDate={formatDate} getRiskLevel={getRiskLevel} getRiskLevelColor={getRiskLevelColor} />
              )}

              {/* Articles tab */}
              {activeTab === 'articles' && (
                <UserArticlesList userId={userId} router={router} formatDate={formatDate} />
              )}

              {/* Transactions tab */}
              {activeTab === 'transactions' && (
                <UserTransactionsList userId={userId} formatDate={formatDate} />
              )}

              {/* Logs tab */}
              {activeTab === 'logs' && (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p>操作日誌功能開發中...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({
  user,
  formatDate,
  getRiskLevel,
  getRiskLevelColor
}: {
  user: UserDetail
  formatDate: (date: string) => string
  getRiskLevel: (score?: number) => string
  getRiskLevelColor: (score?: number) => string
}) {
  return (
    <div className="space-y-6">
      {/* Account info */}
      <div>
        <h3 className="text-lg font-semibold mb-3">帳戶資訊</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">用戶 ID</p>
            <p className="font-medium mt-1 font-mono text-sm">{user.id}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">用戶名</p>
            <p className="font-medium mt-1">{user.username || '無'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium mt-1">{user.email || '無'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">登入提供商</p>
            <p className="font-medium mt-1">{user.provider || '無'}</p>
          </div>
          {user.registration_ip && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">註冊 IP</p>
              <p className="font-medium mt-1 font-mono text-sm">{user.registration_ip}</p>
            </div>
          )}
          {user.last_login_ip && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">最後登入 IP</p>
              <p className="font-medium mt-1 font-mono text-sm">{user.last_login_ip}</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-3">活動統計</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">發表文章</p>
            <p className="font-medium mt-1">{user.total_articles}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">留言數</p>
            <p className="font-medium mt-1">{user.total_comments || 0}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">反應數</p>
            <p className="font-medium mt-1">{user.total_reactions || 0}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Coins 餘額</p>
            <p className="font-medium mt-1">{user.coin_balance}</p>
          </div>
        </div>
      </div>

      {/* Risk assessment */}
      <div>
        <h3 className="text-lg font-semibold mb-3">風險評估</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">詐騙評分</span>
            <span className="font-medium">{user.fraud_score?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">風險等級</span>
            <span className={`px-2 py-1 text-sm rounded ${getRiskLevelColor(user.fraud_score)}`}>
              {getRiskLevel(user.fraud_score)}
            </span>
          </div>
        </div>
      </div>

      {/* Invite permissions */}
      {user.invite_permissions && user.invite_permissions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">邀請權限</h3>
          <div className="flex flex-wrap gap-2">
            {user.invite_permissions.map((permission, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {permission}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent articles preview */}
      {user.recent_articles && user.recent_articles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">最近文章</h3>
          <div className="space-y-3">
            {user.recent_articles.slice(0, 3).map((article) => (
              <div key={article.id} className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{article.title || '無標題'}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.content}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>發布: {formatDate(article.created_at)}</span>
                  <div className="flex items-center space-x-3">
                    <span>{article.views} 次查看</span>
                    <span>{article.likes} 個讚</span>
                    <span>{article.comments_count} 條留言</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// User Articles List Component
function UserArticlesList({
  userId,
  router,
  formatDate
}: {
  userId: string
  router: ReturnType<typeof useRouter>
  formatDate: (date: string) => string
}) {
  const [articles, setArticles] = useState<UserArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    loadArticles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const loadArticles = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getUserArticles(userId, page, 10)
      setArticles(data.articles)
      setTotal(data.total)
      setHasNext(data.has_next)
    } catch (error) {
      console.error('載入文章失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const getArticleStatus = (article: UserArticle) => {
    if (article.is_expired) return { text: '已過期', color: 'bg-gray-100 text-gray-800' }
    return { text: '正常', color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">載入中...</p>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p>此用戶尚未發表文章</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {articles.map((article) => {
          const status = getArticleStatus(article)
          return (
            <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{article.title || '無標題'}</h4>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.content.substring(0, 150)}{article.content.length > 150 ? '...' : ''}</p>
                </div>
                <span className={`ml-4 px-2 py-1 text-xs rounded whitespace-nowrap ${status.color}`}>
                  {status.text}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(article.created_at)}
                  </span>
                  <span>{article.views} 次查看</span>
                  <span>{article.likes} 個讚</span>
                  <span>{article.comments_count} 條留言</span>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/content?article=${article.id}`)}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  查看詳情
                  <ExternalLink className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            顯示第 {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} 項，共 {total} 項
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一頁
            </button>
            <span className="text-sm text-gray-700">
              第 {page} 頁 / 共 {Math.ceil(total / 10)} 頁
            </span>
            <button
              disabled={!hasNext}
              onClick={() => setPage(p => p + 1)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一頁
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// User Transactions List Component
function UserTransactionsList({
  userId,
  formatDate
}: {
  userId: string
  formatDate: (date: string) => string
}) {
  const [transactions, setTransactions] = useState<UserTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    loadTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getUserTransactions(userId, page, 10)
      setTransactions(data.transactions)
      setTotal(data.total)
      setHasNext(data.has_next)
    } catch (error) {
      console.error('載入交易記錄失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionTypeInfo = (type: string) => {
    switch (type) {
      case 'earn':
        return { text: '獲得', color: 'bg-green-100 text-green-800', icon: '+' }
      case 'spend':
        return { text: '消費', color: 'bg-red-100 text-red-800', icon: '-' }
      case 'purchase':
        return { text: '購買', color: 'bg-blue-100 text-blue-800', icon: '+' }
      default:
        return { text: type, color: 'bg-gray-100 text-gray-800', icon: '' }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">載入中...</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p>此用戶尚無交易記錄</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-3">
        {transactions.map((transaction) => {
          const typeInfo = getTransactionTypeInfo(transaction.type)
          return (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-xs rounded ${typeInfo.color}`}>
                  {typeInfo.text}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${transaction.type === 'spend' ? 'text-red-600' : 'text-green-600'}`}>
                  {typeInfo.icon}{transaction.amount}
                </p>
                <p className="text-xs text-gray-500">Coins</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            顯示第 {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} 項，共 {total} 項
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一頁
            </button>
            <span className="text-sm text-gray-700">
              第 {page} 頁 / 共 {Math.ceil(total / 10)} 頁
            </span>
            <button
              disabled={!hasNext}
              onClick={() => setPage(p => p + 1)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一頁
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
