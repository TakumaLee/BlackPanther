'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ReviewList from '@/components/reviews/ReviewList'
import ReviewDetail from '@/components/reviews/ReviewDetail'
import { InviteReview, ReviewFilters } from '@/types'
import { ArrowLeft } from 'lucide-react'

export default function ReviewsPage() {
  const searchParams = useSearchParams()
  const [selectedReview, setSelectedReview] = useState<InviteReview | null>(null)
  
  // 從 URL 參數構建篩選器
  const filters: ReviewFilters = {
    status: (searchParams.get('status') as 'pending' | 'approved' | 'rejected' | 'all') || 'pending',
    fraud_score_min: searchParams.get('fraud_score') === 'high' ? 0.7 : undefined,
    search: searchParams.get('search') || undefined,
  }

  const handleReviewClick = (review: InviteReview) => {
    setSelectedReview(review)
  }

  const handleReviewUpdate = (updatedReview: InviteReview) => {
    // 更新選中的審核記錄
    setSelectedReview(updatedReview)
    // 這裡可以觸發列表重新載入
  }

  const handleBackToList = () => {
    setSelectedReview(null)
  }

  if (selectedReview) {
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
              review={selectedReview}
              onUpdate={handleReviewUpdate}
              onClose={handleBackToList}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <ReviewList
              filters={filters}
              onReviewClick={handleReviewClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}