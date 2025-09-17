import {
  DashboardData,
  ScheduledTask,
  TaskExecution,
  TaskStatistics,
  LeaderElectionStatus,
  SystemMetrics,
  ApiResponse,
  PaginatedResponse,
  ExecutionHistoryFilters,
  TaskListFilters,
  Alert,
} from '@/types/scheduler'
import { getMockDashboardData, getMockExecutions } from './scheduler-mock-data'

interface SchedulerAPIConfig {
  baseUrl: string
  token?: string
  timeout?: number
  useMockData?: boolean // Enable mock mode for development
}

class SchedulerAPI {
  private baseUrl: string
  private token?: string
  private timeout: number
  private useMockData: boolean

  constructor(config: SchedulerAPIConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.token = config.token
    this.timeout = config.timeout || 30000
    this.useMockData = config.useMockData || false
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        throw new Error(`API Request Failed: ${error.message}`)
      }
      throw error
    }
  }

  // ============================================================================
  // Dashboard Endpoints
  // ============================================================================

  async getDashboard(): Promise<DashboardData> {
    // Return mock data in development mode
    if (this.useMockData) {
      return Promise.resolve(getMockDashboardData())
    }

    try {
      const response = await this.request<DashboardData>('/api/v1/admin/scheduler/dashboard')
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch dashboard data')
      }
      return response.data
    } catch (error) {
      console.warn('⚠️ Scheduler API not available on QA, using mock data. Deploy backend changes to enable real data.', error)
      // Fallback to mock data if API is not available
      return getMockDashboardData()
    }
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await this.request<SystemMetrics>('/api/v1/admin/scheduler/metrics')
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch system metrics')
    }
    return response.data
  }

  async getAlerts(): Promise<Alert[]> {
    const response = await this.request<Alert[]>('/api/v1/admin/scheduler/alerts')
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch alerts')
    }
    return response.data
  }

  // ============================================================================
  // Task Management Endpoints
  // ============================================================================

  async getTasks(filters?: TaskListFilters): Promise<ScheduledTask[]> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.status) params.append('status', filters.status.join(','))
      if (filters.task_type) params.append('task_type', filters.task_type.join(','))
      if (filters.created_by) params.append('created_by', filters.created_by)
      if (filters.search) params.append('search', filters.search)
      if (filters.sort_by) params.append('sort_by', filters.sort_by)
      if (filters.sort_order) params.append('sort_order', filters.sort_order)
    }

    const queryString = params.toString()
    const endpoint = queryString ? `/api/v1/admin/scheduler/tasks?${queryString}` : '/api/v1/admin/scheduler/tasks'

    const response = await this.request<ScheduledTask[]>(endpoint)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch tasks')
    }
    return response.data
  }

  async getTask(taskName: string): Promise<ScheduledTask> {
    const response = await this.request<ScheduledTask>(`/api/v1/admin/scheduler/tasks/${encodeURIComponent(taskName)}`)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch task')
    }
    return response.data
  }

  async createTask(task: Partial<ScheduledTask>): Promise<ScheduledTask> {
    const response = await this.request<ScheduledTask>('/api/v1/admin/scheduler/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    })
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create task')
    }
    return response.data
  }

  async updateTask(taskName: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask> {
    const response = await this.request<ScheduledTask>(`/api/v1/admin/scheduler/tasks/${encodeURIComponent(taskName)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update task')
    }
    return response.data
  }

  async deleteTask(taskName: string): Promise<void> {
    const response = await this.request(`/api/v1/admin/scheduler/tasks/${encodeURIComponent(taskName)}`, {
      method: 'DELETE',
    })
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete task')
    }
  }

  // ============================================================================
  // Task Control Endpoints
  // ============================================================================

  async triggerTask(taskName: string): Promise<TaskExecution> {
    const response = await this.request<TaskExecution>(`/api/v1/admin/scheduler/tasks/${encodeURIComponent(taskName)}/trigger`, {
      method: 'POST',
    })
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to trigger task')
    }
    return response.data
  }

  async pauseTask(taskName: string): Promise<void> {
    const response = await this.request(`/api/v1/admin/scheduler/tasks/${encodeURIComponent(taskName)}/pause`, {
      method: 'POST',
    })
    if (!response.success) {
      throw new Error(response.error || 'Failed to pause task')
    }
  }

  async resumeTask(taskName: string): Promise<void> {
    const response = await this.request(`/api/v1/admin/scheduler/tasks/${encodeURIComponent(taskName)}/resume`, {
      method: 'POST',
    })
    if (!response.success) {
      throw new Error(response.error || 'Failed to resume task')
    }
  }

  async updateTaskSchedule(taskName: string, cronExpression: string): Promise<ScheduledTask> {
    const response = await this.request<ScheduledTask>(`/api/v1/admin/scheduler/tasks/${encodeURIComponent(taskName)}/schedule`, {
      method: 'PUT',
      body: JSON.stringify({ cron_expression: cronExpression }),
    })
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update task schedule')
    }
    return response.data
  }

  // ============================================================================
  // Execution History Endpoints
  // ============================================================================

  async getExecutions(filters?: ExecutionHistoryFilters): Promise<PaginatedResponse<TaskExecution>> {
    const params = new URLSearchParams()

    if (filters) {
      if (filters.task_name) params.append('task_name', filters.task_name)
      if (filters.status) params.append('status', filters.status.join(','))
      if (filters.triggered_by) params.append('triggered_by', filters.triggered_by)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.per_page) params.append('per_page', filters.per_page.toString())
      if (filters.sort_by) params.append('sort_by', filters.sort_by)
      if (filters.sort_order) params.append('sort_order', filters.sort_order)

      if (filters.date_range) {
        if (filters.date_range.start) params.append('start_date', filters.date_range.start)
        if (filters.date_range.end) params.append('end_date', filters.date_range.end)
      }

      if (filters.duration_range) {
        params.append('min_duration_ms', filters.duration_range.min_ms.toString())
        params.append('max_duration_ms', filters.duration_range.max_ms.toString())
      }
    }

    const queryString = params.toString()
    const endpoint = queryString ? `/api/v1/admin/scheduler/executions?${queryString}` : '/api/v1/admin/scheduler/executions'

    const response = await this.request<PaginatedResponse<TaskExecution>>(endpoint)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch executions')
    }
    return response.data
  }

  async getExecution(executionId: string): Promise<TaskExecution> {
    const response = await this.request<TaskExecution>(`/api/v1/admin/scheduler/executions/${executionId}`)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch execution')
    }
    return response.data
  }

  async retryExecution(executionId: string): Promise<TaskExecution> {
    const response = await this.request<TaskExecution>(`/api/v1/admin/scheduler/executions/${executionId}/retry`, {
      method: 'POST',
    })
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to retry execution')
    }
    return response.data
  }

  async cancelExecution(executionId: string): Promise<void> {
    const response = await this.request(`/api/v1/admin/scheduler/executions/${executionId}/cancel`, {
      method: 'POST',
    })
    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel execution')
    }
  }

  async getExecutionLogs(executionId: string): Promise<string[]> {
    const response = await this.request<string[]>(`/api/v1/admin/scheduler/executions/${executionId}/logs`)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch execution logs')
    }
    return response.data
  }

  // ============================================================================
  // Statistics Endpoints
  // ============================================================================

  async getTaskStatistics(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<TaskStatistics[]> {
    const response = await this.request<TaskStatistics[]>(`/api/v1/admin/scheduler/statistics?range=${timeRange}`)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch task statistics')
    }
    return response.data
  }

  async getTaskStatistic(taskName: string, timeRange: '24h' | '7d' | '30d' = '24h'): Promise<TaskStatistics> {
    const response = await this.request<TaskStatistics>(`/api/v1/admin/scheduler/statistics/${encodeURIComponent(taskName)}?range=${timeRange}`)
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch task statistic')
    }
    return response.data
  }

  // ============================================================================
  // Leader Election Endpoints
  // ============================================================================

  async getLeaderStatus(): Promise<LeaderElectionStatus> {
    const response = await this.request<LeaderElectionStatus>('/api/v1/admin/scheduler/leader')
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch leader status')
    }
    return response.data
  }

  async forceLeaderElection(): Promise<LeaderElectionStatus> {
    const response = await this.request<LeaderElectionStatus>('/api/v1/admin/scheduler/leader/elect', {
      method: 'POST',
    })
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to force leader election')
    }
    return response.data
  }

  // ============================================================================
  // Health and Monitoring Endpoints
  // ============================================================================

  async getHealthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.request<{ status: string; timestamp: string }>('/api/v1/admin/scheduler/health')
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch health status')
    }
    return response.data
  }

  async getClusterInfo(): Promise<{
    total_instances: number
    active_instances: number
    leader_instance: string | null
    cluster_version: string
  }> {
    const response = await this.request<{
      total_instances: number
      active_instances: number
      leader_instance: string | null
      cluster_version: string
    }>('/api/v1/admin/scheduler/cluster')
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch cluster info')
    }
    return response.data
  }

  // ============================================================================
  // Alert Management
  // ============================================================================

  async acknowledgeAlert(alertId: string): Promise<void> {
    const response = await this.request(`/api/v1/admin/scheduler/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    })
    if (!response.success) {
      throw new Error(response.error || 'Failed to acknowledge alert')
    }
  }

  async dismissAlert(alertId: string): Promise<void> {
    const response = await this.request(`/api/v1/admin/scheduler/alerts/${alertId}`, {
      method: 'DELETE',
    })
    if (!response.success) {
      throw new Error(response.error || 'Failed to dismiss alert')
    }
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================

  setToken(token: string): void {
    this.token = token
  }

  clearToken(): void {
    this.token = undefined
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout
  }
}

// Default instance
let defaultSchedulerAPI: SchedulerAPI | null = null

export const createSchedulerAPI = (config: SchedulerAPIConfig): SchedulerAPI => {
  return new SchedulerAPI(config)
}

export const getSchedulerAPI = (): SchedulerAPI => {
  if (!defaultSchedulerAPI) {
    // Use QA environment with real backend API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://black-alligator-qa-646040465533.asia-east1.run.app'
    defaultSchedulerAPI = new SchedulerAPI({
      baseUrl,
      useMockData: false // Use real API - backend now has scheduler/dashboard endpoint
    })
  }
  return defaultSchedulerAPI
}

export const setDefaultSchedulerAPI = (api: SchedulerAPI): void => {
  defaultSchedulerAPI = api
}

export default SchedulerAPI