'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Square,
  AlertTriangle,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  RotateCcw,
  Timer,
} from 'lucide-react'
import { ExecutionHistoryProps, TaskExecution } from '@/types/scheduler'

export default function ExecutionHistory({
  executions,
  loading,
  onRefresh,
  onLoadMore,
  hasMore,
  onViewExecution,
  onRetryExecution,
  filters,
  onFiltersChange,
}: ExecutionHistoryProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [retryingExecutions, setRetryingExecutions] = useState<Set<string>>(new Set())

  const getStatusIcon = (status: TaskExecution['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'running':
        return <Play className="h-5 w-5 text-blue-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'timeout':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'cancelled':
        return <Square className="h-5 w-5 text-gray-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: TaskExecution['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'timeout':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const toggleRowExpansion = (executionId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(executionId)) {
      newExpanded.delete(executionId)
    } else {
      newExpanded.add(executionId)
    }
    setExpandedRows(newExpanded)
  }

  const handleRetry = async (executionId: string) => {
    if (!onRetryExecution) return

    try {
      setRetryingExecutions(prev => new Set(prev).add(executionId))
      await onRetryExecution(executionId)
    } catch (error) {
      console.error('Retry failed:', error)
    } finally {
      setRetryingExecutions(prev => {
        const newSet = new Set(prev)
        newSet.delete(executionId)
        return newSet
      })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">執行歷史</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              篩選器
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              重新整理
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && onFiltersChange && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">狀態</label>
                <select
                  value={filters?.status?.[0] || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    status: e.target.value ? [e.target.value as TaskExecution['status']] : undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部狀態</option>
                  <option value="completed">已完成</option>
                  <option value="failed">失敗</option>
                  <option value="running">執行中</option>
                  <option value="pending">等待中</option>
                  <option value="timeout">超時</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">任務名稱</label>
                <input
                  type="text"
                  value={filters?.task_name || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    task_name: e.target.value || undefined
                  })}
                  placeholder="搜尋任務..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日期範圍</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={filters?.date_range?.start || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      date_range: {
                        start: e.target.value,
                        end: filters?.date_range?.end || ''
                      }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={filters?.date_range?.end || ''}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      date_range: {
                        start: filters?.date_range?.start || '',
                        end: e.target.value
                      }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                任務
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                開始時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                持續時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                重試次數
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {executions.map((execution) => (
              <>
                <tr key={execution.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleRowExpansion(execution.id)}
                        className="mr-2 p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedRows.has(execution.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {execution.task_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {execution.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(execution.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(execution.started_at), 'MM/dd HH:mm:ss', { locale: zhTW })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(execution.duration_ms)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {execution.retry_attempt} / {execution.max_retries}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewExecution(execution)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {execution.status === 'failed' && onRetryExecution && (
                        <button
                          onClick={() => handleRetry(execution.id)}
                          disabled={retryingExecutions.has(execution.id)}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          <RotateCcw className={`h-4 w-4 ${retryingExecutions.has(execution.id) ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRows.has(execution.id) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-xs text-gray-500">執行者</div>
                            <div className="text-sm text-gray-900">{execution.executed_by}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">觸發方式</div>
                            <div className="text-sm text-gray-900">{execution.triggered_by || '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">完成時間</div>
                            <div className="text-sm text-gray-900">
                              {execution.completed_at
                                ? format(new Date(execution.completed_at), 'MM/dd HH:mm:ss', { locale: zhTW })
                                : '-'
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">記憶體峰值</div>
                            <div className="text-sm text-gray-900">
                              {execution.memory_peak_mb ? `${execution.memory_peak_mb}MB` : '-'}
                            </div>
                          </div>
                        </div>

                        {execution.error_message && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">錯誤訊息</div>
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded border">
                              {execution.error_message}
                            </div>
                          </div>
                        )}

                        {execution.result && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">執行結果</div>
                            <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded border">
                              <pre className="whitespace-pre-wrap text-xs">
                                {typeof execution.result === 'string'
                                  ? execution.result
                                  : JSON.stringify(execution.result, null, 2)
                                }
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {executions.length === 0 && !loading && (
        <div className="text-center py-12">
          <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暫無執行記錄</h3>
          <p className="text-gray-500">當任務開始執行時，記錄將會顯示在這裡。</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            載入更多記錄
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="px-6 py-4 text-center">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-gray-400" />
        </div>
      )}
    </div>
  )
}