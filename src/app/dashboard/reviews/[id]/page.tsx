'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { reviewsAPI } from '@/lib/api/reviews'
import ReviewDetail from '@/components/reviews/ReviewDetail'
import { InviteReview } from '@/types'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default function ReviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [review, setReview] = useState<InviteReview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reviewId = params.id as string

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await reviewsAPI.getReview(reviewId)
        
        if (response.success && response.data) {
          setReview(response.data)
        } else {
          setError(response.error || '獲取審核詳情失敗')
        }
      } catch (err) {
        console.error('Failed to fetch review:', err)
        setError('網路錯誤，請重試')
      } finally {
        setLoading(false)
      }
    }

    if (reviewId) {
      fetchReview()
    }
  }, [reviewId])

  const handleReviewUpdate = (updatedReview: InviteReview) => {
    setReview(updatedReview)
  }

  const handleBackToList = () => {
    router.push('/dashboard/reviews')
  }

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="min-h-full">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="mb-4">
              <button
                onClick={handleBackToList}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回列表
              </button>
            </div>
            
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error ? '載入失敗' : '審核記錄不存在'}
              </h3>
              <p className="text-gray-500 mb-4">
                {error || '請檢查審核 ID 是否正確'}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
              >
                重試
              </button>
              <button 
                onClick={handleBackToList}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                返回列表
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-4">
            <button
              onClick={handleBackToList}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </button>
          </div>
          
          <ReviewDetail
            review={review}
            onUpdate={handleReviewUpdate}
          />
        </div>
      </div>
    </div>
  )
}