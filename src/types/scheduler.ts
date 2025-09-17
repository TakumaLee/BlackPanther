// ============================================================================
// Scheduler Dashboard Type Definitions
// ============================================================================

// Base Task Interface
export interface ScheduledTask {
  id: string
  name: string
  description: string
  cron_expression: string
  next_run: string | Date
  last_run?: string | Date
  status: 'active' | 'paused' | 'disabled'
  enabled: boolean
  created_at: string | Date
  updated_at: string | Date
  created_by: string
  retry_attempts: number
  timeout_seconds: number
  task_type: string
  parameters?: Record<string, unknown>
}

// Task Execution Record
export interface TaskExecution {
  id: string
  task_name: string
  task_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled'
  started_at: string | Date
  completed_at?: string | Date
  duration_ms?: number
  retry_attempt: number
  max_retries: number
  executed_by: string
  triggered_by?: string
  error_message?: string
  error_code?: string
  result?: Record<string, unknown> | string | null
  memory_peak_mb?: number
  cpu_usage_percent?: number
  logs?: string[]
  metadata?: Record<string, unknown>
}

// Task Statistics
export interface TaskStatistics {
  task_name: string
  total_executions: number
  successful_executions: number
  failed_executions: number
  success_rate: number
  average_duration_ms: number
  min_duration_ms: number
  max_duration_ms: number
  last_24h_executions: number
  last_7d_executions: number
  last_30d_executions: number
  current_streak: number
  longest_streak: number
  error_rate_24h: number
}

// Leader Election Status
export interface LeaderElectionStatus {
  current_leader: string | null
  leader_since: string | Date | null
  election_term: number
  instances: SchedulerInstance[]
  last_election_at: string | Date
  next_election_check: string | Date
  is_healthy: boolean
}

// Scheduler Instance
export interface SchedulerInstance {
  instance_id: string
  hostname: string
  pid: number
  status: 'active' | 'inactive' | 'candidate' | 'leader'
  last_heartbeat: string | Date
  version: string
  started_at: string | Date
  load_factor: number
  active_tasks: number
  is_healthy: boolean
  uptime_seconds: number
  memory_usage_mb: number
  cpu_usage_percent: number
}

// Dashboard Data
export interface DashboardData {
  tasks: ScheduledTask[]
  recent_executions: TaskExecution[]
  task_statistics: TaskStatistics[]
  leader_status: LeaderElectionStatus
  system_metrics: SystemMetrics
  summary: DashboardSummary
}

// System Metrics
export interface SystemMetrics {
  total_tasks: number
  active_tasks: number
  paused_tasks: number
  disabled_tasks: number
  running_executions: number
  pending_executions: number
  total_executions_today: number
  successful_executions_today: number
  failed_executions_today: number
  average_execution_time_ms: number
  cluster_health_score: number
  last_updated: string | Date
}

// Dashboard Summary
export interface DashboardSummary {
  overall_success_rate: number
  total_executions: number
  active_instances: number
  pending_tasks: number
  failed_tasks_24h: number
  system_status: 'healthy' | 'warning' | 'critical'
  alerts: Alert[]
}

// Alert Interface
export interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  task_name?: string
  instance_id?: string
  created_at: string | Date
  severity: 'low' | 'medium' | 'high' | 'critical'
  acknowledged: boolean
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'task_execution_update' | 'leader_election_change' | 'system_metrics_update' | 'task_status_change' | 'alert'
  payload: unknown
  timestamp: string
}

export interface TaskExecutionUpdate {
  execution_id: string
  task_name: string
  status: TaskExecution['status']
  progress_percent?: number
  current_step?: string
  eta_seconds?: number
}

export interface LeaderElectionChange {
  new_leader: string
  previous_leader?: string
  election_term: number
  timestamp: string | Date
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  error_code?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

// Filter and Query Types
export interface ExecutionHistoryFilters {
  task_name?: string
  status?: TaskExecution['status'][]
  date_range?: {
    start: string
    end: string
  }
  duration_range?: {
    min_ms: number
    max_ms: number
  }
  triggered_by?: string
  page?: number
  per_page?: number
  sort_by?: 'started_at' | 'duration_ms' | 'status'
  sort_order?: 'asc' | 'desc'
}

export interface TaskListFilters {
  status?: ScheduledTask['status'][]
  task_type?: string[]
  created_by?: string
  search?: string
  sort_by?: 'name' | 'next_run' | 'last_run' | 'created_at'
  sort_order?: 'asc' | 'desc'
}

// Component Props Types
export interface TaskCardProps {
  task: ScheduledTask
  statistics?: TaskStatistics
  onTrigger: (taskName: string) => Promise<void>
  onPause: (taskName: string) => Promise<void>
  onResume: (taskName: string) => Promise<void>
  onUpdateSchedule: (taskName: string, cronExpression: string) => Promise<void>
  onViewDetails: (taskName: string) => void
  loading?: boolean
  expanded?: boolean
}

export interface ExecutionHistoryProps {
  executions: TaskExecution[]
  loading: boolean
  onRefresh: () => void
  onLoadMore?: () => void
  hasMore?: boolean
  onViewExecution: (execution: TaskExecution) => void
  onRetryExecution?: (executionId: string) => Promise<void>
  filters?: ExecutionHistoryFilters
  onFiltersChange?: (filters: ExecutionHistoryFilters) => void
}

export interface LeaderStatusProps {
  leaderStatus: LeaderElectionStatus
  loading?: boolean
  onRefresh: () => void
  onForceElection?: () => Promise<void>
}

export interface StatisticsChartProps {
  data: TaskStatistics[]
  chartType: 'success-rate' | 'execution-count' | 'duration' | 'timeline'
  timeRange?: '24h' | '7d' | '30d'
  height?: number
  loading?: boolean
  onTimeRangeChange?: (range: '24h' | '7d' | '30d') => void
}

export interface SystemMetricsProps {
  metrics: SystemMetrics
  instances: SchedulerInstance[]
  loading?: boolean
  onRefresh: () => void
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: string | Date
  value: number
  label?: string
  color?: string
}

export interface SuccessRateChartData {
  task_name: string
  success_rate: number
  total_executions: number
  period: string
}

export interface ExecutionCountChartData {
  date: string
  successful: number
  failed: number
  total: number
}

export interface DurationChartData {
  task_name: string
  average_duration: number
  min_duration: number
  max_duration: number
  executions_count: number
}

// Real-time Update Types
export interface UseSchedulerWebSocketOptions {
  url: string
  token?: string
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onMessage?: (message: WebSocketMessage) => void
}

export interface WebSocketConnection {
  isConnected: boolean
  isConnecting: boolean
  lastMessage: WebSocketMessage | null
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  connect: () => void
  disconnect: () => void
  sendMessage: (message: unknown) => void
}

// Hook Return Types
export interface UseSchedulerDashboard {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  lastUpdated: Date | null
}

export interface UseTaskExecutions {
  executions: TaskExecution[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  filters: ExecutionHistoryFilters
  setFilters: (filters: ExecutionHistoryFilters) => void
}

export interface UseTaskControl {
  triggerTask: (taskName: string) => Promise<void>
  pauseTask: (taskName: string) => Promise<void>
  resumeTask: (taskName: string) => Promise<void>
  updateSchedule: (taskName: string, cronExpression: string) => Promise<void>
  deleteTask: (taskName: string) => Promise<void>
  loading: Record<string, boolean>
  errors: Record<string, string | null>
}

// Configuration Types
export interface SchedulerConfig {
  apiUrl: string
  wsUrl: string
  authToken?: string
  refreshInterval: number
  wsReconnectAttempts: number
  wsReconnectInterval: number
  pagination: {
    defaultPerPage: number
    maxPerPage: number
  }
  timeouts: {
    apiRequest: number
    wsConnection: number
  }
}