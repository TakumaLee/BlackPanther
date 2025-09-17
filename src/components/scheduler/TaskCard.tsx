'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  Play,
  Pause,
  Clock,
  Settings,
  Calendar,
  MoreVertical,
  Edit3,
} from 'lucide-react'
import { TaskCardProps } from '@/types/scheduler'

export default function TaskCard({
  task,
  statistics,
  onTrigger,
  onPause,
  onResume,
  onUpdateSchedule,
  onViewDetails,
  loading = false,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showScheduleEdit, setShowScheduleEdit] = useState(false)
  const [newCronExpression, setNewCronExpression] = useState(task.cron_expression)
  const [operationLoading, setOperationLoading] = useState<string | null>(null)

  const getStatusColor = (status: typeof task.status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'disabled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600'
    if (rate >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleOperation = async (operation: string, handler: () => Promise<void>) => {
    try {
      setOperationLoading(operation)
      await handler()
    } catch (error) {
      console.error(`${operation} failed:`, error)
    } finally {
      setOperationLoading(null)
      setShowMenu(false)
    }
  }

  const handleTrigger = () => handleOperation('trigger', () => onTrigger(task.name))
  const handlePause = () => handleOperation('pause', () => onPause(task.name))
  const handleResume = () => handleOperation('resume', () => onResume(task.name))

  const handleScheduleUpdate = async () => {
    try {
      setOperationLoading('schedule')
      await onUpdateSchedule(task.name, newCronExpression)
      setShowScheduleEdit(false)
    } catch (error) {
      console.error('Schedule update failed:', error)
    } finally {
      setOperationLoading(null)
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${loading ? 'opacity-50' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {task.cron_expression}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              下次執行: {format(new Date(task.next_run), 'MM/dd HH:mm', { locale: zhTW })}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <button
                onClick={handleTrigger}
                disabled={operationLoading === 'trigger'}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left disabled:opacity-50"
              >
                <Play className="h-4 w-4 mr-3" />
                立即執行
              </button>

              {task.status === 'active' ? (
                <button
                  onClick={handlePause}
                  disabled={operationLoading === 'pause'}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left disabled:opacity-50"
                >
                  <Pause className="h-4 w-4 mr-3" />
                  暫停任務
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  disabled={operationLoading === 'resume'}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left disabled:opacity-50"
                >
                  <Play className="h-4 w-4 mr-3" />
                  恢復任務
                </button>
              )}

              <button
                onClick={() => {
                  setShowScheduleEdit(true)
                  setShowMenu(false)
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <Edit3 className="h-4 w-4 mr-3" />
                編輯排程
              </button>

              <button
                onClick={() => {
                  onViewDetails(task.name)
                  setShowMenu(false)
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <Settings className="h-4 w-4 mr-3" />
                查看詳情
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{statistics.total_executions}</div>
            <div className="text-xs text-gray-500">總執行次數</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getSuccessRateColor(statistics.success_rate)}`}>
              {statistics.success_rate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">成功率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(statistics.average_duration_ms)}
            </div>
            <div className="text-xs text-gray-500">平均時間</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{statistics.last_24h_executions}</div>
            <div className="text-xs text-gray-500">24小時內</div>
          </div>
        </div>
      )}

      {/* Last Execution */}
      {task.last_run && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">上次執行:</span>
            <span className="text-gray-900">
              {format(new Date(task.last_run), 'MM/dd HH:mm:ss', { locale: zhTW })}
            </span>
          </div>
        </div>
      )}

      {/* Schedule Edit Modal */}
      {showScheduleEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">編輯排程</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cron 表達式
              </label>
              <input
                type="text"
                value={newCronExpression}
                onChange={(e) => setNewCronExpression(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: 0 */15 * * *"
              />
              <p className="text-xs text-gray-500 mt-1">
                範例: &quot;0 */15 * * *&quot; = 每15分鐘執行一次
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleScheduleUpdate}
                disabled={operationLoading === 'schedule' || !newCronExpression.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operationLoading === 'schedule' ? '更新中...' : '更新'}
              </button>
              <button
                onClick={() => {
                  setShowScheduleEdit(false)
                  setNewCronExpression(task.cron_expression)
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}