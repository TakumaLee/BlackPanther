'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  Crown,
  Server,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Database,
  Cpu,
  MemoryStick,
} from 'lucide-react'
import { LeaderStatusProps } from '@/types/scheduler'

export default function LeaderStatus({
  leaderStatus,
  loading = false,
  onRefresh,
  onForceElection,
}: LeaderStatusProps) {
  const [isForcing, setIsForcing] = useState(false)

  const handleForceElection = async () => {
    if (!onForceElection) return

    try {
      setIsForcing(true)
      await onForceElection()
    } catch (error) {
      console.error('Force election failed:', error)
    } finally {
      setIsForcing(false)
    }
  }

  const getHealthStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
  }

  const getInstanceStatusColor = (status: string) => {
    switch (status) {
      case 'leader':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'candidate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Crown className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Leader Election Status</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onForceElection && (
            <button
              onClick={handleForceElection}
              disabled={isForcing || loading}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
            >
              {isForcing ? '進行中...' : '強制選舉'}
            </button>
          )}
        </div>
      </div>

      {/* Current Leader Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Crown className="h-4 w-4 mr-2 text-blue-600" />
            當前 Leader
          </h4>

          {leaderStatus.current_leader ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Server className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">{leaderStatus.current_leader}</span>
                </div>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(leaderStatus.is_healthy)}`}>
                  {leaderStatus.is_healthy ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {leaderStatus.is_healthy ? '健康' : '異常'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Leader 自:</span>
                  <div className="font-medium">
                    {leaderStatus.leader_since
                      ? format(new Date(leaderStatus.leader_since), 'MM/dd HH:mm:ss', { locale: zhTW })
                      : '-'
                    }
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">選舉任期:</span>
                  <div className="font-medium">#{leaderStatus.election_term}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">無 Leader</span>
              </div>
              <p className="text-sm text-red-600 mt-1">集群中目前沒有 Leader，可能正在進行選舉</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-600" />
            選舉資訊
          </h4>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">上次選舉:</span>
                <span className="font-medium">
                  {format(new Date(leaderStatus.last_election_at), 'MM/dd HH:mm:ss', { locale: zhTW })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">下次檢查:</span>
                <span className="font-medium">
                  {format(new Date(leaderStatus.next_election_check), 'MM/dd HH:mm:ss', { locale: zhTW })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">總實例數:</span>
                <span className="font-medium">{leaderStatus.instances.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">活躍實例數:</span>
                <span className="font-medium">
                  {leaderStatus.instances.filter(instance => instance.status === 'active' || instance.status === 'leader').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instances List */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <Users className="h-4 w-4 mr-2 text-gray-600" />
          集群實例 ({leaderStatus.instances.length})
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {leaderStatus.instances.map((instance) => (
            <div
              key={instance.instance_id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              {/* Instance Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900 truncate">
                    {instance.hostname}
                  </span>
                  {instance.status === 'leader' && (
                    <Crown className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getInstanceStatusColor(instance.status)}`}>
                  {instance.status}
                </span>
              </div>

              {/* Instance Info */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-3">
                <div>
                  <div className="flex items-center">
                    <Database className="h-3 w-3 mr-1" />
                    <span>PID: {instance.pid}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    <span>任務: {instance.active_tasks}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>運行: {formatUptime(instance.uptime_seconds)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>負載: {instance.load_factor.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Resource Usage */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Cpu className="h-3 w-3 mr-1 text-blue-500" />
                      <span>CPU</span>
                    </div>
                    <span className="font-medium">{instance.cpu_usage_percent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(instance.cpu_usage_percent, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <MemoryStick className="h-3 w-3 mr-1 text-green-500" />
                      <span>記憶體</span>
                    </div>
                    <span className="font-medium">{formatBytes(instance.memory_usage_mb * 1024 * 1024)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min((instance.memory_usage_mb / 1024) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Health Status */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    {instance.is_healthy ? (
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={instance.is_healthy ? 'text-green-600' : 'text-red-600'}>
                      {instance.is_healthy ? '健康' : '異常'}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    心跳: {format(new Date(instance.last_heartbeat), 'HH:mm:ss', { locale: zhTW })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {leaderStatus.instances.length === 0 && (
        <div className="text-center py-8">
          <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">沒有實例</h3>
          <p className="text-gray-500">目前沒有檢測到任何 Scheduler 實例。</p>
        </div>
      )}
    </div>
  )
}