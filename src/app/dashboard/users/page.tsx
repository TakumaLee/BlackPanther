'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api/admin'
import { UserInfo, UserFilters } from '@/types/admin'
import { useAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Users, 
  Search,
  Eye,
  Shield,
  ShieldOff,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Calendar,
  Coins
} from 'lucide-react'

interface UserCardProps {
  user: UserInfo
  onBlock: (userId: string) => void
  onUnblock: (userId: string) => void
}

function UserCard({ user, onBlock, onUnblock }: UserCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  const getRiskColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score >= 0.7) return 'text-red-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getRiskLevel = (score?: number) => {
    if (!score) return '未評分'
    if (score >= 0.7) return '高風險'
    if (score >= 0.4) return '中風險'
    return '低風險'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {user.avatar_url ? (
            <Image 
              src={user.avatar_url} 
              alt={user.display_name || user.username || '用戶'}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-gray-500" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {user.display_name || user.username || '未命名用戶'}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Mail className="h-4 w-4 mr-1" />
              {user.email || '無Email'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {user.is_blocked ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              已封鎖
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              正常
            </span>
          )}
          
          {user.fraud_score !== undefined && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(user.fraud_score)}`}>
              {getRiskLevel(user.fraud_score)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">提供商:</span>
          <span className="ml-2 font-medium">{user.provider || 'N/A'}</span>
        </div>
        <div>
          <span className="text-gray-500">Coins餘額:</span>
          <span className="ml-2 font-medium flex items-center">
            <Coins className="h-4 w-4 mr-1" />
            {user.coin_balance}
          </span>
        </div>
        <div>
          <span className="text-gray-500">文章數:</span>
          <span className="ml-2 font-medium">{user.total_articles}</span>
        </div>
        <div>
          <span className="text-gray-500">留言數:</span>
          <span className="ml-2 font-medium">{user.total_comments}</span>
        </div>
        <div>
          <span className="text-gray-500">反應數:</span>
          <span className="ml-2 font-medium">{user.total_reactions}</span>
        </div>
        <div>
          <span className="text-gray-500">註冊日期:</span>
          <span className="ml-2 font-medium">{formatDate(user.created_at)}</span>
        </div>
      </div>

      {user.last_login_at && (
        <div className="mt-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4 inline mr-1" />
          最後登入: {formatDate(user.last_login_at)}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Link 
          href={`/dashboard/users/${user.id}`}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Eye className="h-4 w-4 mr-2" />
          查看詳細
        </Link>

        <div className="flex space-x-2">
          {user.is_blocked ? (
            <button
              onClick={() => onUnblock(user.id)}
              className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
            >
              <ShieldOff className="h-4 w-4 mr-2" />
              解除封鎖
            </button>
          ) : (
            <button
              onClick={() => onBlock(user.id)}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
            >
              <Shield className="h-4 w-4 mr-2" />
              封鎖用戶
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  
  // 過濾器狀態
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 12,
    search: '',
    provider: '',
    is_blocked: undefined,
    fraud_score_min: undefined
  })


  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchUsers = async () => {
    if (!currentUser) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await adminApi.getUsers(filters)
      setUsers(response.users)
      setTotal(response.total)
      setCurrentPage(response.page)
      setHasNext(response.has_next)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError(err instanceof Error ? err.message : '獲取用戶列表失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
  }

  const handleFilterChange = (key: keyof UserFilters, value: string | number | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleBlock = async (userId: string) => {
    const reason = prompt('請輸入封鎖原因:')
    if (!reason) return

    try {
      await adminApi.blockUser({ user_id: userId, reason })
      fetchUsers() // 重新獲取數據
    } catch (err) {
      console.error('Failed to block user:', err)
      alert('封鎖用戶失敗')
    } finally {
    }
  }

  const handleUnblock = async (userId: string) => {
    const reason = prompt('請輸入解除封鎖原因:')
    if (!reason) return

    try {
      await adminApi.unblockUser({ user_id: userId, reason })
      fetchUsers() // 重新獲取數據
    } catch (err) {
      console.error('Failed to unblock user:', err)
      alert('解除封鎖失敗')
    } finally {
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={fetchUsers}
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
                  用戶管理
                </h1>
                <p className="text-gray-600">
                  管理平台用戶，查看詳細資訊並進行封鎖操作
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  總計 {total.toLocaleString()} 位用戶
                </div>
              </div>
            </div>
          </div>

          {/* 搜尋和過濾器 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* 搜尋框 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  搜尋用戶
                </label>
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="用戶名、Email或顯示名"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
                    value={filters.search || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* 提供商篩選 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  登入提供商
                </label>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  value={filters.provider || ''}
                  onChange={(e) => handleFilterChange('provider', e.target.value || undefined)}
                >
                  <option value="">全部</option>
                  <option value="google">Google</option>
                  <option value="apple">Apple</option>
                  <option value="anonymous">匿名</option>
                </select>
              </div>

              {/* 封鎖狀態篩選 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  封鎖狀態
                </label>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  value={filters.is_blocked === undefined ? '' : filters.is_blocked.toString()}
                  onChange={(e) => handleFilterChange('is_blocked', e.target.value === '' ? undefined : e.target.value === 'true')}
                >
                  <option value="">全部</option>
                  <option value="false">正常</option>
                  <option value="true">已封鎖</option>
                </select>
              </div>

              {/* 風險等級篩選 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最低風險評分
                </label>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  value={filters.fraud_score_min || ''}
                  onChange={(e) => handleFilterChange('fraud_score_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                >
                  <option value="">全部</option>
                  <option value="0.4">中風險以上 (≥0.4)</option>
                  <option value="0.7">高風險 (≥0.7)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 用戶卡片網格 */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">載入中...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到用戶</h3>
              <p className="text-gray-500">請調整搜尋條件或過濾器</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onBlock={handleBlock}
                  onUnblock={handleUnblock}
                />
              ))}
            </div>
          )}

          {/* 分頁 */}
          {total > (filters.limit || 12) && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                顯示第 {((currentPage - 1) * (filters.limit || 12)) + 1} - {Math.min(currentPage * (filters.limit || 12), total)} 項，共 {total} 項
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一頁
                </button>
                
                <span className="text-sm text-gray-700">
                  第 {currentPage} 頁
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一頁
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}