'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '@/lib/api/admin'
import {
  ModerationQueueItem,
  ModerationStats,
  ModerationQueueFilters,
  ReportType,
  ReportStatus,
  ModerationAction,
  REPORT_TYPE_LABELS,
  REPORT_STATUS_LABELS,
  MODERATION_ACTION_LABELS
} from '@/types/admin'
import { useAuth } from '@/lib/auth/auth-context'
import {
  Flag,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpCircle,
  Eye,
  Filter,
  BarChart3,
  Users,
  FileText
} from 'lucide-react'

// Report Detail Modal
interface ReportDetailModalProps {
  isOpen: boolean
  onClose: () => void
  report: ModerationQueueItem | null
  onAction: (reportId: string, action: ModerationAction, notes?: string) => Promise<void>
}

function ReportDetailModal({ isOpen, onClose, report, onAction }: ReportDetailModalProps) {
  const [selectedAction, setSelectedAction] = useState<ModerationAction | ''>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !report) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAction) return

    setLoading(true)
    try {
      await onAction(report.report.id, selectedAction, notes)
      onClose()
      setSelectedAction('')
      setNotes('')
    } catch (err) {
      console.error('Action failed:', err)
      alert('操作失敗')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: ReportStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    }
    return styles[status] || styles.pending
  }

  const getPriorityBadge = (priority: number) => {
    if (priority >= 70) return 'bg-red-100 text-red-800'
    if (priority >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Flag className="h-5 w-5 mr-2 text-red-500" />
            檢舉詳情
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Report Info */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">檢舉類型</label>
              <p className="mt-1 text-sm text-gray-900">
                {REPORT_TYPE_LABELS[report.report.report_type as ReportType] || report.report.report_type}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">狀態</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusBadge(report.report.status)}`}>
                {REPORT_STATUS_LABELS[report.report.status]}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">優先級</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getPriorityBadge(report.priority_score)}`}>
                {report.priority_score} 分
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">等待時間</label>
              <p className="mt-1 text-sm text-gray-900">
                {report.time_pending_hours.toFixed(1)} 小時
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">檢舉說明</label>
            <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
              {report.report.description || '無說明'}
            </p>
          </div>

          {report.report.article_id && (
            <div>
              <label className="block text-sm font-medium text-gray-500">被檢舉文章</label>
              <div className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{report.report.article_title || '文章標題'}</p>
                <p className="text-gray-600 mt-1 line-clamp-3">
                  {report.report.article_content || '文章內容預覽'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span>檢舉時間: </span>
              <span className="text-gray-900">{new Date(report.report.created_at).toLocaleString('zh-TW')}</span>
            </div>
            {report.report.reporter_email && (
              <div>
                <span>檢舉者: </span>
                <span className="text-gray-900">{report.report.reporter_username || report.report.reporter_email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Form */}
        {report.report.status === 'pending' || report.report.status === 'under_review' ? (
          <form onSubmit={handleSubmit} className="border-t pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                處理動作
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(MODERATION_ACTION_LABELS) as ModerationAction[]).map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setSelectedAction(action)}
                    className={`px-4 py-2 text-sm rounded-lg border ${
                      selectedAction === action
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {MODERATION_ACTION_LABELS[action]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                處理備註
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="輸入處理備註..."
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading || !selectedAction}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '處理中...' : '確認'}
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t pt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                此檢舉已{report.report.status === 'resolved' ? '解決' : '駁回'}
              </p>
              {report.report.resolution_notes && (
                <p className="mt-2 text-sm text-gray-900">
                  處理備註: {report.report.resolution_notes}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              關閉
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color }: {
  title: string
  value: number | string
  icon: React.ElementType
  color: 'red' | 'yellow' | 'green' | 'blue' | 'gray'
}) {
  const colors = {
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    gray: 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<ModerationQueueItem[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ModerationQueueItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const filters: ModerationQueueFilters = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }

      const response = await adminApi.getModerationQueue(filters)
      setReports(response.items)
      setTotal(response.total)
      setHasNext(response.has_next)
    } catch (err) {
      console.error('Failed to fetch reports:', err)
      setError(err instanceof Error ? err.message : '獲取檢舉列表失敗')
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter])

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await adminApi.getModerationStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchReports()
      fetchStats()
    }
  }, [user, fetchReports, fetchStats])

  const handleAction = async (reportId: string, action: ModerationAction, notes?: string) => {
    await adminApi.resolveReport({
      report_id: reportId,
      action,
      notes
    })
    fetchReports()
    fetchStats()
  }

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'under_review':
        return <Eye className="h-4 w-4 text-blue-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: ReportStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    }
    return styles[status] || styles.pending
  }

  const getPriorityBadge = (priority: number) => {
    if (priority >= 70) return { style: 'bg-red-100 text-red-800', label: '高' }
    if (priority >= 40) return { style: 'bg-yellow-100 text-yellow-800', label: '中' }
    return { style: 'bg-green-100 text-green-800', label: '低' }
  }

  const filteredReports = reports.filter(item => {
    if (typeFilter !== 'all' && item.report.report_type !== typeFilter) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        item.report.description?.toLowerCase().includes(search) ||
        item.report.reporter_email?.toLowerCase().includes(search) ||
        item.report.reporter_username?.toLowerCase().includes(search)
      )
    }
    return true
  })

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && reports.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={fetchReports}
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Flag className="h-6 w-6 mr-3 text-red-500" />
                  檢舉管理
                </h1>
                <p className="text-gray-600 mt-1">
                  審核和處理用戶提交的內容檢舉
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="待處理"
                value={stats.pending_count}
                icon={Clock}
                color="yellow"
              />
              <StatsCard
                title="24小時升級"
                value={stats.escalation_count_24h}
                icon={ArrowUpCircle}
                color="red"
              />
              <StatsCard
                title="平均處理時間"
                value={`${stats.average_resolution_time_hours.toFixed(1)}h`}
                icon={BarChart3}
                color="blue"
              />
              <StatsCard
                title="SLA 達成率"
                value={`${(stats.sla_compliance_rate * 100).toFixed(0)}%`}
                icon={CheckCircle}
                color="green"
              />
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜尋檢舉..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as ReportStatus | 'all')
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">所有狀態</option>
                  {(Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {REPORT_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ReportType | 'all')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">所有類型</option>
                {(Object.keys(REPORT_TYPE_LABELS) as ReportType[]).map((type) => (
                  <option key={type} value={type}>
                    {REPORT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                檢舉列表
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                共 {total} 項檢舉記錄
              </p>
            </div>

            {filteredReports.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? '沒有符合篩選條件的檢舉'
                  : '目前沒有檢舉記錄'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredReports.map((item) => {
                  const priority = getPriorityBadge(item.priority_score)
                  return (
                    <div
                      key={item.id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedReport(item)
                        setShowDetailModal(true)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Flag className="h-5 w-5 text-red-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {REPORT_TYPE_LABELS[item.report.report_type as ReportType] || item.report.report_type}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.report.status)}`}>
                                  {getStatusIcon(item.report.status)}
                                  <span className="ml-1">{REPORT_STATUS_LABELS[item.report.status]}</span>
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priority.style}`}>
                                  優先級: {priority.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1 truncate">
                                {item.report.description || '無說明'}
                              </p>
                              <div className="flex items-center text-xs text-gray-400 mt-1 space-x-4">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(item.report.created_at).toLocaleString('zh-TW')}
                                </span>
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {item.report.reporter_username || item.report.reporter_email || '匿名'}
                                </span>
                                {item.report.article_id && (
                                  <span className="flex items-center">
                                    <FileText className="h-3 w-3 mr-1" />
                                    有關聯文章
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedReport(item)
                              setShowDetailModal(true)
                            }}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
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

      {/* Report Detail Modal */}
      <ReportDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedReport(null)
        }}
        report={selectedReport}
        onAction={handleAction}
      />
    </div>
  )
}
