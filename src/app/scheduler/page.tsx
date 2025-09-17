'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Activity,
  Users,
  BarChart3,
  Clock,
  RefreshCw,
  Settings,
  Play,
} from 'lucide-react'
import TaskCard from '@/components/scheduler/TaskCard'
import ExecutionHistory from '@/components/scheduler/ExecutionHistory'
import LeaderStatus from '@/components/scheduler/LeaderStatus'
import StatisticsChart from '@/components/scheduler/StatisticsChart'
import { getSchedulerAPI } from '@/lib/api/scheduler-api'
import { useSchedulerWebSocket, createWebSocketUrl } from '@/lib/websocket/scheduler-socket'
import {
  DashboardData,
  TaskExecution,
  ExecutionHistoryFilters,
} from '@/types/scheduler'

type TabType = 'overview' | 'tasks' | 'history' | 'monitoring'

export default function SchedulerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [executions, setExecutions] = useState<TaskExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [executionFilters, setExecutionFilters] = useState<ExecutionHistoryFilters>({})
  const [statisticsTimeRange, setStatisticsTimeRange] = useState<'24h' | '7d' | '30d'>('24h')

  const api = getSchedulerAPI()

  // WebSocket connection for real-time updates (disabled until backend implements it)
  const wsUrl = createWebSocketUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  const ws = useSchedulerWebSocket({
    url: wsUrl,
    autoConnect: false, // Disabled until backend WebSocket is ready
    onConnect: () => console.log('WebSocket connected'),
    onDisconnect: () => console.log('WebSocket disconnected'),
    onError: (error) => console.log('WebSocket not available yet'), // Suppress error
    onMessage: (message) => {
      console.log('WebSocket message:', message)
      // Handle real-time updates here
      if (message.type === 'task_execution_update') {
        handleExecutionUpdate(message.payload)
      }
    },
  })

  const handleExecutionUpdate = (update: { execution_id: string; status: string }) => {
    // Update executions list with real-time data
    setExecutions(prev =>
      prev.map(exec =>
        exec.id === update.execution_id
          ? { ...exec, status: update.status }
          : exec
      )
    )
  }

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await api.getDashboard()
      setDashboardData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const loadExecutions = useCallback(async () => {
    try {
      const response = await api.getExecutions(executionFilters)
      setExecutions(response.data)
    } catch (err) {
      console.error('Failed to load executions:', err)
    }
  }, [api, executionFilters])

  const handleTaskTrigger = async (taskName: string) => {
    try {
      await api.triggerTask(taskName)
      await loadDashboardData() // Refresh data
    } catch (err) {
      console.error('Failed to trigger task:', err)
    }
  }

  const handleTaskPause = async (taskName: string) => {
    try {
      await api.pauseTask(taskName)
      await loadDashboardData()
    } catch (err) {
      console.error('Failed to pause task:', err)
    }
  }

  const handleTaskResume = async (taskName: string) => {
    try {
      await api.resumeTask(taskName)
      await loadDashboardData()
    } catch (err) {
      console.error('Failed to resume task:', err)
    }
  }

  const handleUpdateSchedule = async (taskName: string, cronExpression: string) => {
    try {
      await api.updateTaskSchedule(taskName, cronExpression)
      await loadDashboardData()
    } catch (err) {
      console.error('Failed to update schedule:', err)
    }
  }

  const handleViewTaskDetails = (taskName: string) => {
    // Navigate to task details or open modal
    console.log('View task details:', taskName)
  }

  const handleViewExecution = (execution: TaskExecution) => {
    // Navigate to execution details or open modal
    console.log('View execution:', execution)
  }

  const handleRetryExecution = async (executionId: string) => {
    try {
      await api.retryExecution(executionId)
      await loadExecutions()
    } catch (err) {
      console.error('Failed to retry execution:', err)
    }
  }

  const handleForceElection = async () => {
    try {
      await api.forceLeaderElection()
      await loadDashboardData()
    } catch (err) {
      console.error('Failed to force election:', err)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  useEffect(() => {
    if (activeTab === 'history') {
      loadExecutions()
    }
  }, [activeTab, executionFilters, loadExecutions])

  const tabs = [
    { id: 'overview', name: '總覽', icon: Activity },
    { id: 'tasks', name: '任務管理', icon: Settings },
    { id: 'history', name: '執行歷史', icon: Clock },
    { id: 'monitoring', name: '系統監控', icon: BarChart3 },
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">載入失敗</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              重試
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Scheduler Dashboard</h1>
              <p className="text-gray-600 mt-1">分散式任務調度系統監控與管理</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${ws.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{ws.isConnected ? '已連線' : '未連線'}</span>
              </div>
              {lastUpdated && (
                <span className="text-sm text-gray-500">
                  最後更新: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-white border border-gray-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                重新整理
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">總任務數</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.system_metrics.total_tasks}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Play className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">活躍任務</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.system_metrics.active_tasks}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">集群實例</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.leader_status.instances.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">成功率</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.summary.overall_success_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && dashboardData && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeaderStatus
                  leaderStatus={dashboardData.leader_status}
                  loading={loading}
                  onRefresh={loadDashboardData}
                  onForceElection={handleForceElection}
                />
                <StatisticsChart
                  data={dashboardData.task_statistics}
                  chartType="success-rate"
                  timeRange={statisticsTimeRange}
                  onTimeRangeChange={setStatisticsTimeRange}
                />
              </div>
              <StatisticsChart
                data={dashboardData.task_statistics}
                chartType="execution-count"
                timeRange={statisticsTimeRange}
                onTimeRangeChange={setStatisticsTimeRange}
              />
            </>
          )}

          {activeTab === 'tasks' && dashboardData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {dashboardData.tasks.map((task) => {
                const taskStats = dashboardData.task_statistics.find(
                  stat => stat.task_name === task.name
                )
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    statistics={taskStats}
                    onTrigger={handleTaskTrigger}
                    onPause={handleTaskPause}
                    onResume={handleTaskResume}
                    onUpdateSchedule={handleUpdateSchedule}
                    onViewDetails={handleViewTaskDetails}
                    loading={loading}
                  />
                )
              })}
            </div>
          )}

          {activeTab === 'history' && (
            <ExecutionHistory
              executions={executions}
              loading={loading}
              onRefresh={loadExecutions}
              onViewExecution={handleViewExecution}
              onRetryExecution={handleRetryExecution}
              filters={executionFilters}
              onFiltersChange={setExecutionFilters}
            />
          )}

          {activeTab === 'monitoring' && dashboardData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatisticsChart
                data={dashboardData.task_statistics}
                chartType="duration"
                timeRange={statisticsTimeRange}
                onTimeRangeChange={setStatisticsTimeRange}
              />
              <StatisticsChart
                data={dashboardData.task_statistics}
                chartType="timeline"
                timeRange={statisticsTimeRange}
                onTimeRangeChange={setStatisticsTimeRange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}