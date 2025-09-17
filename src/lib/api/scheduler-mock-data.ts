import {
  DashboardData,
  ScheduledTask,
  TaskExecution,
  TaskStatistics,
  LeaderElectionStatus,
  SystemMetrics,
  Alert,
} from '@/types/scheduler'

// Mock data for development and demo purposes
export const getMockDashboardData = (): DashboardData => {
  const now = new Date()
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const tasks: ScheduledTask[] = [
    {
      id: 'task-1',
      name: 'article_expiration_check',
      description: '檢查並處理過期文章',
      cron_expression: '0 */15 * * *',
      next_run: new Date(now.getTime() + 15 * 60 * 1000),
      last_run: hourAgo,
      status: 'active',
      enabled: true,
      created_at: dayAgo,
      updated_at: hourAgo,
      created_by: 'system',
      retry_attempts: 3,
      timeout_seconds: 300,
      task_type: 'maintenance',
      parameters: { batch_size: 100 }
    },
    {
      id: 'task-2',
      name: 'popularity_calculation',
      description: '計算文章熱門度分數',
      cron_expression: '0 * * * *',
      next_run: new Date(now.getTime() + 45 * 60 * 1000),
      last_run: new Date(now.getTime() - 15 * 60 * 1000),
      status: 'active',
      enabled: true,
      created_at: dayAgo,
      updated_at: hourAgo,
      created_by: 'system',
      retry_attempts: 3,
      timeout_seconds: 600,
      task_type: 'analytics',
      parameters: { algorithm: 'weighted' }
    },
    {
      id: 'task-3',
      name: 'daily_statistics_report',
      description: '生成每日統計報告',
      cron_expression: '0 2 * * *',
      next_run: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      last_run: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      status: 'active',
      enabled: true,
      created_at: dayAgo,
      updated_at: dayAgo,
      created_by: 'system',
      retry_attempts: 3,
      timeout_seconds: 1800,
      task_type: 'reporting',
    },
    {
      id: 'task-4',
      name: 'cleanup_old_logs',
      description: '清理舊日誌檔案',
      cron_expression: '0 3 * * 0',
      next_run: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      last_run: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      status: 'paused',
      enabled: false,
      created_at: dayAgo,
      updated_at: dayAgo,
      created_by: 'admin',
      retry_attempts: 1,
      timeout_seconds: 900,
      task_type: 'cleanup',
    },
    {
      id: 'task-5',
      name: 'ai_analysis_batch',
      description: 'AI 批次分析處理',
      cron_expression: '0 */30 * * *',
      next_run: new Date(now.getTime() + 20 * 60 * 1000),
      last_run: new Date(now.getTime() - 10 * 60 * 1000),
      status: 'active',
      enabled: true,
      created_at: dayAgo,
      updated_at: hourAgo,
      created_by: 'system',
      retry_attempts: 5,
      timeout_seconds: 1200,
      task_type: 'processing',
      parameters: { model: 'gpt-4', batch_size: 50 }
    },
  ]

  const recent_executions: TaskExecution[] = [
    {
      id: 'exec-1',
      task_name: 'article_expiration_check',
      task_id: 'task-1',
      status: 'completed',
      started_at: hourAgo,
      completed_at: new Date(hourAgo.getTime() + 2 * 60 * 1000),
      duration_ms: 120000,
      retry_attempt: 0,
      max_retries: 3,
      executed_by: 'scheduler-instance-1',
      result: { processed: 42, expired: 15 },
      memory_peak_mb: 128,
      cpu_usage_percent: 45.2,
    },
    {
      id: 'exec-2',
      task_name: 'popularity_calculation',
      task_id: 'task-2',
      status: 'running',
      started_at: new Date(now.getTime() - 5 * 60 * 1000),
      duration_ms: 300000,
      retry_attempt: 0,
      max_retries: 3,
      executed_by: 'scheduler-instance-2',
      memory_peak_mb: 256,
      cpu_usage_percent: 62.8,
    },
    {
      id: 'exec-3',
      task_name: 'ai_analysis_batch',
      task_id: 'task-5',
      status: 'failed',
      started_at: new Date(now.getTime() - 20 * 60 * 1000),
      completed_at: new Date(now.getTime() - 18 * 60 * 1000),
      duration_ms: 120000,
      retry_attempt: 1,
      max_retries: 5,
      executed_by: 'scheduler-instance-1',
      error_message: 'Connection timeout to AI service',
      memory_peak_mb: 192,
      cpu_usage_percent: 38.5,
    },
    {
      id: 'exec-4',
      task_name: 'daily_statistics_report',
      task_id: 'task-3',
      status: 'completed',
      started_at: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      completed_at: new Date(now.getTime() - 11.5 * 60 * 60 * 1000),
      duration_ms: 1800000,
      retry_attempt: 0,
      max_retries: 3,
      executed_by: 'scheduler-instance-3',
      result: { reports_generated: 5, emails_sent: 10 },
      memory_peak_mb: 512,
      cpu_usage_percent: 78.3,
    },
    {
      id: 'exec-5',
      task_name: 'article_expiration_check',
      task_id: 'task-1',
      status: 'completed',
      started_at: new Date(now.getTime() - 75 * 60 * 1000),
      completed_at: new Date(now.getTime() - 73 * 60 * 1000),
      duration_ms: 120000,
      retry_attempt: 0,
      max_retries: 3,
      executed_by: 'scheduler-instance-1',
      result: { processed: 38, expired: 12 },
      memory_peak_mb: 115,
      cpu_usage_percent: 42.1,
    },
  ]

  const task_statistics: TaskStatistics[] = tasks.map((task, index) => ({
    task_name: task.name,
    total_executions: 100 + index * 20,
    successful_executions: 90 + index * 15,
    failed_executions: 10 + index * 5,
    success_rate: 85 + Math.random() * 15,
    average_duration_ms: 60000 + index * 30000,
    min_duration_ms: 30000 + index * 10000,
    max_duration_ms: 120000 + index * 60000,
    last_24h_executions: 24 + index * 4,
    last_7d_executions: 168 + index * 20,
    last_30d_executions: 720 + index * 100,
    current_streak: 5 + index,
    longest_streak: 20 + index * 3,
    error_rate_24h: Math.random() * 10,
  }))

  const leader_status: LeaderElectionStatus = {
    current_leader: 'scheduler-instance-1',
    leader_since: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    election_term: 42,
    instances: [
      {
        instance_id: 'scheduler-instance-1',
        hostname: 'scheduler-prod-1.cluster.local',
        pid: 12345,
        status: 'leader',
        last_heartbeat: now,
        version: '1.0.0',
        started_at: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        load_factor: 0.65,
        active_tasks: 3,
        is_healthy: true,
        uptime_seconds: 86400,
        memory_usage_mb: 256,
        cpu_usage_percent: 45.2,
      },
      {
        instance_id: 'scheduler-instance-2',
        hostname: 'scheduler-prod-2.cluster.local',
        pid: 12346,
        status: 'active',
        last_heartbeat: new Date(now.getTime() - 10 * 1000),
        version: '1.0.0',
        started_at: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        load_factor: 0.42,
        active_tasks: 2,
        is_healthy: true,
        uptime_seconds: 43200,
        memory_usage_mb: 192,
        cpu_usage_percent: 32.8,
      },
      {
        instance_id: 'scheduler-instance-3',
        hostname: 'scheduler-prod-3.cluster.local',
        pid: 12347,
        status: 'active',
        last_heartbeat: new Date(now.getTime() - 5 * 1000),
        version: '1.0.0',
        started_at: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        load_factor: 0.28,
        active_tasks: 1,
        is_healthy: true,
        uptime_seconds: 21600,
        memory_usage_mb: 128,
        cpu_usage_percent: 18.5,
      },
    ],
    last_election_at: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    next_election_check: new Date(now.getTime() + 10 * 60 * 1000),
    is_healthy: true,
  }

  const system_metrics: SystemMetrics = {
    total_tasks: tasks.length,
    active_tasks: tasks.filter(t => t.status === 'active').length,
    paused_tasks: tasks.filter(t => t.status === 'paused').length,
    disabled_tasks: tasks.filter(t => t.status === 'disabled').length,
    running_executions: 1,
    pending_executions: 2,
    total_executions_today: 142,
    successful_executions_today: 128,
    failed_executions_today: 14,
    average_execution_time_ms: 85000,
    cluster_health_score: 92.5,
    last_updated: now,
  }

  const alerts: Alert[] = [
    {
      id: 'alert-1',
      type: 'warning',
      message: 'Task "ai_analysis_batch" has failed 3 times in the last hour',
      task_name: 'ai_analysis_batch',
      created_at: new Date(now.getTime() - 30 * 60 * 1000),
      severity: 'medium',
      acknowledged: false,
    },
    {
      id: 'alert-2',
      type: 'info',
      message: 'Scheduler instance-4 has been offline for 2 hours',
      instance_id: 'scheduler-instance-4',
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      severity: 'low',
      acknowledged: true,
    },
  ]

  return {
    tasks,
    recent_executions,
    task_statistics,
    leader_status,
    system_metrics,
    summary: {
      overall_success_rate: 90.1,
      total_executions: recent_executions.length,
      active_instances: leader_status.instances.filter(i => i.is_healthy).length,
      pending_tasks: 2,
      failed_tasks_24h: 14,
      system_status: 'healthy',
      alerts,
    },
  }
}

export const getMockExecutions = (filters?: any): TaskExecution[] => {
  const baseExecutions = getMockDashboardData().recent_executions

  // Generate more mock executions for history page
  const additionalExecutions: TaskExecution[] = []
  const now = new Date()

  for (let i = 0; i < 20; i++) {
    const startTime = new Date(now.getTime() - (i + 5) * 60 * 60 * 1000)
    const duration = 60000 + Math.random() * 240000
    const status = ['completed', 'failed', 'timeout'][Math.floor(Math.random() * 3)] as TaskExecution['status']

    additionalExecutions.push({
      id: `exec-${i + 10}`,
      task_name: ['article_expiration_check', 'popularity_calculation', 'ai_analysis_batch'][i % 3],
      task_id: `task-${(i % 3) + 1}`,
      status,
      started_at: startTime,
      completed_at: status !== 'running' ? new Date(startTime.getTime() + duration) : undefined,
      duration_ms: status !== 'running' ? duration : undefined,
      retry_attempt: Math.floor(Math.random() * 3),
      max_retries: 3,
      executed_by: `scheduler-instance-${(i % 3) + 1}`,
      error_message: status === 'failed' ? `Error: Task failed with code ${500 + i}` : undefined,
      memory_peak_mb: 100 + Math.random() * 400,
      cpu_usage_percent: 20 + Math.random() * 60,
    })
  }

  return [...baseExecutions, ...additionalExecutions]
}