'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { reviewsAPI } from '@/lib/api/reviews'
import { InviteReview, ReviewFilters, PaginationParams } from '@/types'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface ReviewListProps {
  filters?: ReviewFilters
  onReviewClick?: (review: InviteReview) => void
}

const ITEMS_PER_PAGE = 20

export default function ReviewList({ filters = {}, onReviewClick }: ReviewListProps) {
  const [reviews, setReviews] = useState<InviteReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(true)
      const params: PaginationParams & ReviewFilters = {
        page,
        limit: ITEMS_PER_PAGE,
        sort_by: 'created_at',
        sort_order: 'desc',
        ...filters
      }

      const response = await reviewsAPI.getReviews(params)
      
      if (response.success && response.data) {
        setReviews(response.data.data)
        setTotalPages(response.data.total_pages)
        setTotalItems(response.data.total)
        setCurrentPage(page)
      } else {
        setError(response.error || '獲取審核列表失敗')
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
      setError('網路錯誤，請重試')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews(1)
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectReview = (reviewId: string) => {
    const newSelection = new Set(selectedReviews)
    if (newSelection.has(reviewId)) {
      newSelection.delete(reviewId)
    } else {
      newSelection.add(reviewId)
    }
    setSelectedReviews(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedReviews.size === reviews.length) {
      setSelectedReviews(new Set())
    } else {
      setSelectedReviews(new Set(reviews.map(r => r.id)))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待審核'
      case 'approved':
        return '已批准'
      case 'rejected':
        return '已拒絕'
      default:
        return '未知'
    }
  }

  const getFraudRiskLevel = (score: number) => {
    if (score >= 0.7) return { level: '高風險', color: 'text-red-600 bg-red-50' }
    if (score >= 0.4) return { level: '中風險', color: 'text-yellow-600 bg-yellow-50' }
    return { level: '低風險', color: 'text-green-600 bg-green-50' }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={() => fetchReviews(currentPage)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          重試
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* 標題和篩選器 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">審核列表</h3>
            <p className="text-sm text-gray-500 mt-1">
              共 {totalItems} 筆記錄，第 {currentPage} 頁 / 共 {totalPages} 頁
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              篩選
            </button>
            {selectedReviews.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  已選擇 {selectedReviews.size} 項
                </span>
                <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                  批量批准
                </button>
                <button className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
                  批量拒絕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedReviews.size === reviews.length && reviews.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                邀請者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                被邀請者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                風險評分
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                創建時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">載入中...</p>
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  沒有找到相符的審核記錄
                </td>
              </tr>
            ) : (
              reviews.map((review) => {
                const fraudRisk = getFraudRiskLevel(review.invite.fraud_score)
                return (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedReviews.has(review.id)}
                        onChange={() => handleSelectReview(review.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.invite.inviter.display_name || review.invite.inviter.email?.split('@')[0]}
                          </div>
                          <div className="text-sm text-gray-500">
                            {review.invite.inviter.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {review.invite.invitee?.display_name || review.invite.invitee_email}
                      </div>
                      {review.invite.invitee && (
                        <div className="text-sm text-gray-500">
                          {review.invite.invitee.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${fraudRisk.color}`}>
                        {fraudRisk.level} ({(review.invite.fraud_score * 100).toFixed(0)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(review.status)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getStatusText(review.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(review.created_at), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onReviewClick?.(review)}
                        className="flex items-center text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        檢視
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => fetchReviews(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一頁
            </button>
            <span className="mx-4 text-sm text-gray-500">
              第 {currentPage} 頁，共 {totalPages} 頁
            </span>
            <button
              onClick={() => fetchReviews(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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