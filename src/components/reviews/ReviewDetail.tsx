'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { reviewsAPI } from '@/lib/api/reviews'
import { InviteReview } from '@/types'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Calendar,
  AlertTriangle,
  Shield,
  FileText,
  ExternalLink
} from 'lucide-react'

interface ReviewDetailProps {
  review: InviteReview
  onUpdate?: (updatedReview: InviteReview) => void
  onClose?: () => void
}

export default function ReviewDetail({ review, onUpdate, onClose }: ReviewDetailProps) {
  const [processing, setProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async () => {
    try {
      setProcessing(true)
      const response = await reviewsAPI.approveReview(review.id, notes)
      
      if (response.success && response.data) {
        onUpdate?.(response.data)
        alert('審核已批准')
      } else {
        alert(`操作失敗: ${response.error}`)
      }
    } catch (error) {
      console.error('Approve failed:', error)
      alert('網路錯誤，請重試')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('請填寫拒絕原因')
      return
    }

    try {
      setProcessing(true)
      const response = await reviewsAPI.rejectReview(review.id, rejectReason, notes)
      
      if (response.success && response.data) {
        onUpdate?.(response.data)
        alert('審核已拒絕')
      } else {
        alert(`操作失敗: ${response.error}`)
      }
    } catch (error) {
      console.error('Reject failed:', error)
      alert('網路錯誤，請重試')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-500" />
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
    if (score >= 0.7) return { level: '高風險', color: 'text-red-600 bg-red-50 border-red-200' }
    if (score >= 0.4) return { level: '中風險', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    return { level: '低風險', color: 'text-green-600 bg-green-50 border-green-200' }
  }

  const fraudRisk = getFraudRiskLevel(review.invite.fraud_score)

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      {/* 標題區 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(review.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                審核詳情 #{review.id.slice(-8)}
              </h2>
              <p className="text-sm text-gray-500">
                狀態: {getStatusText(review.status)}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 邀請信息 */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                邀請信息
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">邀請者</p>
                    <p className="text-sm text-gray-600">
                      {review.invite.inviter.display_name || '未設置暱稱'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {review.invite.inviter.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">被邀請者</p>
                    <p className="text-sm text-gray-600">
                      {review.invite.invitee?.display_name || review.invite.invitee_email}
                    </p>
                    {review.invite.invitee && (
                      <p className="text-xs text-gray-500">
                        {review.invite.invitee.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">邀請時間</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(review.invite.created_at), 'yyyy年MM月dd日 HH:mm', { locale: zhTW })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <ExternalLink className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">邀請碼</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {review.invite.invite_code}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 風險評估 */}
            <div className={`border rounded-lg p-4 ${fraudRisk.color}`}>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                風險評估
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">風險評分</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${fraudRisk.color}`}>
                      {fraudRisk.level}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        review.invite.fraud_score >= 0.7 ? 'bg-red-500' :
                        review.invite.fraud_score >= 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${review.invite.fraud_score * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {(review.invite.fraud_score * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded ${review.fraud_indicators.same_device ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    相同設備: {review.fraud_indicators.same_device ? '是' : '否'}
                  </div>
                  <div className={`p-2 rounded ${review.fraud_indicators.suspicious_timing ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    可疑時機: {review.fraud_indicators.suspicious_timing ? '是' : '否'}
                  </div>
                  <div className={`p-2 rounded ${review.fraud_indicators.email_similarity ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    郵箱相似: {review.fraud_indicators.email_similarity ? '是' : '否'}
                  </div>
                  <div className={`p-2 rounded ${review.fraud_indicators.ip_similarity ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    IP相似: {review.fraud_indicators.ip_similarity ? '是' : '否'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 審核操作 */}
          <div className="space-y-6">
            {/* 審核狀態 */}
            {review.status !== 'pending' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  審核記錄
                </h3>
                
                <div className="space-y-3">
                  {review.reviewer && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">審核者</p>
                      <p className="text-sm text-gray-600">{review.reviewer.email}</p>
                    </div>
                  )}
                  
                  {review.reviewed_at && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">審核時間</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(review.reviewed_at), 'yyyy年MM月dd日 HH:mm', { locale: zhTW })}
                      </p>
                    </div>
                  )}
                  
                  {review.review_notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">審核備註</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{review.review_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 審核操作 */}
            {review.status === 'pending' && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  審核操作
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      審核備註
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="請填寫審核備註（可選）"
                    />
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleApprove}
                      disabled={processing}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      {processing ? '處理中...' : '批准邀請'}
                    </button>

                    <div>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                        placeholder="請填寫拒絕原因"
                      />
                      <button
                        onClick={handleReject}
                        disabled={processing || !rejectReason.trim()}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        {processing ? '處理中...' : '拒絕邀請'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}