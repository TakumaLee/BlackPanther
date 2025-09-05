'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api/admin'
import { BlockInfo, IPBlockInfo, UpdateBlockRequest } from '@/types/admin'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  Shield, 
  UserX, 
  AlertTriangle, 
  Search, 
  Plus, 
  Globe, 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  User,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react'

type TabType = 'users' | 'ips'

interface BlockModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  type: 'user' | 'ip'
}

function BlockModal({ isOpen, onClose, onSuccess, type }: BlockModalProps) {
  const [formData, setFormData] = useState({
    target: '',
    reason: '',
    duration_hours: '',
    is_permanent: false
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (type === 'ip') {
        await adminApi.createIPBlock({
          ip_address: formData.target,
          reason: formData.reason,
          duration_hours: formData.is_permanent ? undefined : (formData.duration_hours ? parseInt(formData.duration_hours) : undefined)
        })
      } else {
        await adminApi.blockUser({
          user_id: formData.target,
          reason: formData.reason,
          duration_hours: formData.is_permanent ? undefined : (formData.duration_hours ? parseInt(formData.duration_hours) : undefined)
        })
      }
      
      onSuccess()
      onClose()
      setFormData({ target: '', reason: '', duration_hours: '', is_permanent: false })
    } catch (err) {
      console.error('Block failed:', err)
      alert(`封鎖${type === 'ip' ? 'IP' : '用戶'}失敗`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            封鎖{type === 'ip' ? 'IP地址' : '用戶'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'ip' ? 'IP地址' : '用戶ID'}
            </label>
            <input
              type="text"
              required
              value={formData.target}
              onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={type === 'ip' ? '192.168.1.1' : '輸入用戶ID'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              封鎖原因
            </label>
            <textarea
              required
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="請詳細說明封鎖原因"
            />
          </div>
          
          <div>
            <label className="flex items-center mb-2">
              <input 
                type="checkbox" 
                checked={formData.is_permanent}
                onChange={(e) => setFormData(prev => ({ ...prev, is_permanent: e.target.checked }))}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500" 
              />
              <span className="ml-2 text-sm text-gray-700">永久封鎖</span>
            </label>
            
            {!formData.is_permanent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  封鎖時長（小時）
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="留空為永久"
                />
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? '處理中...' : '確認封鎖'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BlocksPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [userBlocks, setUserBlocks] = useState<BlockInfo[]>([])
  const [ipBlocks, setIPBlocks] = useState<IPBlockInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasNext, setHasNext] = useState(false)

  useEffect(() => {
    if (user) {
      fetchBlocks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, currentPage, searchTerm])

  const fetchBlocks = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const filters = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        is_active: true
      }

      if (activeTab === 'users') {
        const response = await adminApi.getUserBlocks(filters)
        setUserBlocks(response.blocks)
        setTotal(response.total)
        setHasNext(response.has_next)
      } else {
        const response = await adminApi.getIPBlocks(filters)
        setIPBlocks(response.blocks)
        setTotal(response.total)
        setHasNext(response.has_next)
      }
    } catch (err) {
      console.error('Failed to fetch blocks:', err)
      setError(err instanceof Error ? err.message : '獲取封鎖列表失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async (blockId: string, type: 'user' | 'ip') => {
    const reason = prompt('請輸入解除封鎖的原因:')
    if (!reason) return

    try {
      const updateData: UpdateBlockRequest = {
        is_active: false
      }

      if (type === 'user') {
        await adminApi.updateUserBlock(blockId, updateData)
      } else {
        await adminApi.updateIPBlock(blockId, updateData)
      }
      
      fetchBlocks()
    } catch (err) {
      console.error('Unblock failed:', err)
      alert('解除封鎖失敗')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW')
  }

  const currentBlocks = activeTab === 'users' ? userBlocks : ipBlocks

  if (loading && currentBlocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && currentBlocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={fetchBlocks}
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
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Shield className="h-6 w-6 mr-3" />
                  封鎖管理
                </h1>
                <p className="text-gray-600 mt-1">
                  管理被封鎖的用戶和IP地址
                </p>
              </div>
              <button
                onClick={() => setShowBlockModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                新增封鎖
              </button>
            </div>
          </div>

          {/* 標籤頁 */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => {
                    setActiveTab('users')
                    setCurrentPage(1)
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  用戶封鎖
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {userBlocks.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('ips')
                    setCurrentPage(1)
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ips'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Globe className="h-4 w-4 inline mr-2" />
                  IP封鎖
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {ipBlocks.length}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* 搜尋框 */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`搜尋${activeTab === 'users' ? '用戶' : 'IP'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
          </div>

          {/* 封鎖列表 */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab === 'users' ? '封鎖用戶列表' : '封鎖IP列表'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                共 {total} 項封鎖記錄
              </p>
            </div>

            {currentBlocks.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                {searchTerm ? `沒有找到相符的${activeTab === 'users' ? '用戶' : 'IP'}` : `沒有${activeTab === 'users' ? '用戶' : 'IP'}封鎖記錄`}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {currentBlocks.map((block) => (
                  <div key={block.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              {activeTab === 'users' ? (
                                <UserX className="h-5 w-5 text-red-600" />
                              ) : (
                                <Globe className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center">
                              <h4 className="text-lg font-medium text-gray-900">
                                {activeTab === 'users' 
                                  ? ((block as BlockInfo).user_username || (block as BlockInfo).user_email || '未知用戶')
                                  : (block as IPBlockInfo).ip_address
                                }
                              </h4>
                              {block.is_active && (
                                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  已封鎖
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {block.reason}
                            </p>
                            <div className="flex items-center text-xs text-gray-400 mt-2 space-x-4">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                封鎖時間: {formatDate(block.created_at)}
                              </span>
                              <span>
                                執行者: {block.blocked_by_username || '系統'}
                              </span>
                              {block.blocked_until && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  到期: {formatDate(block.blocked_until)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {block.is_active && (
                          <button
                            onClick={() => handleUnblock(block.id, activeTab === 'users' ? 'user' : 'ip')}
                            className="inline-flex items-center px-3 py-2 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            解除封鎖
                          </button>
                        )}
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <Settings className="h-4 w-4 mr-2" />
                          編輯
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 分頁 */}
            {total > 10 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  顯示第 {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, total)} 項，共 {total} 項
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
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
                    onClick={() => setCurrentPage(currentPage + 1)}
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

      {/* 封鎖模態框 */}
      <BlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onSuccess={fetchBlocks}
        type={activeTab === 'users' ? 'user' : 'ip'}
      />
    </div>
  )
}