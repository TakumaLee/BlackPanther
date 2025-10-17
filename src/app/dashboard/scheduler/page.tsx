'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Server,
  RefreshCw,
  PlayCircle,
  Lock,
} from 'lucide-react';
import { getSchedulerAPI } from '@/lib/api/scheduler-api';
import type { DashboardData } from '@/types/scheduler';

// Import scheduler components
import SchedulerStatus from '@/components/scheduler/SchedulerStatus';
import JobsList from '@/components/scheduler/JobsList';
import ExecutionHistory from '@/components/scheduler/ExecutionHistory';
import LocksTable from '@/components/scheduler/LocksTable';
import InstancesMonitor from '@/components/scheduler/InstancesMonitor';

export default function SchedulerPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const schedulerAPI = getSchedulerAPI();

  const loadSchedulerData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await schedulerAPI.getDashboard();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load scheduler data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scheduler data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedulerData();
  }, []);

  const handleRefresh = () => {
    loadSchedulerData();
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">載入失敗</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重試
          </Button>
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.system_metrics;
  const summary = dashboardData?.summary;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">調度器管理</h1>
          <p className="text-[var(--text-secondary)] mt-2">監控和管理後端排程任務</p>
          {lastUpdated && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              最後更新：{lastUpdated.toLocaleString('zh-TW')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Status Card */}
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">系統狀態</p>
                <div className="flex items-center gap-2 mt-1">
                  {summary && getStatusIcon(summary.system_status)}
                  <span className={`font-medium ${summary ? getStatusColor(summary.system_status) : 'text-gray-600'}`}>
                    {summary?.system_status === 'healthy' ? '正常' :
                     summary?.system_status === 'warning' ? '警告' : '嚴重'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  活躍實例：{summary?.active_instances || 0}
                </p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Tasks Card */}
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">總任務數</p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
                  {metrics?.total_tasks || 0}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  活躍：{metrics?.active_tasks || 0} / 暫停：{metrics?.paused_tasks || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {/* Executions Today Card */}
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">今日執行</p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
                  {metrics?.total_executions_today || 0}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  成功：{metrics?.successful_executions_today || 0} / 失敗：{metrics?.failed_executions_today || 0}
                </p>
              </div>
              <PlayCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Running Tasks Card */}
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">運行中任務</p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
                  {metrics?.running_executions || 0}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  待處理：{metrics?.pending_executions || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {summary && summary.alerts && summary.alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">系統警告 ({summary.alerts.length})</span>
          </div>
          <div className="space-y-2">
            {summary.alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="text-sm text-yellow-700">
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="overview">概覽</TabsTrigger>
          <TabsTrigger value="jobs">預定任務</TabsTrigger>
          <TabsTrigger value="executions">執行記錄</TabsTrigger>
          <TabsTrigger value="locks">分散式鎖</TabsTrigger>
          <TabsTrigger value="instances">實例監控</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scheduler Status */}
            {dashboardData && (
              <SchedulerStatus
                leaderStatus={dashboardData.leader_status}
                metrics={dashboardData.system_metrics}
                loading={loading}
                onRefresh={handleRefresh}
              />
            )}

            {/* Recent Executions Summary */}
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardHeader>
                <CardTitle>最近執行</CardTitle>
                <CardDescription>查看最近的任務執行狀態</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.recent_executions && dashboardData.recent_executions.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recent_executions.slice(0, 5).map((execution) => (
                      <div key={execution.id} className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-[var(--foreground)]">{execution.task_name}</div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {new Date(execution.started_at).toLocaleString('zh-TW')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {execution.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          {execution.status === 'running' && <Activity className="h-4 w-4 text-blue-600 animate-pulse" />}
                          {execution.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          <span className={`text-sm ${
                            execution.status === 'completed' ? 'text-green-600' :
                            execution.status === 'running' ? 'text-blue-600' :
                            'text-red-600'
                          }`}>
                            {execution.status === 'completed' ? '完成' :
                             execution.status === 'running' ? '運行中' : '失敗'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-[var(--text-secondary)] py-8">
                    暫無執行記錄
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task Statistics */}
          {dashboardData?.task_statistics && dashboardData.task_statistics.length > 0 && (
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardHeader>
                <CardTitle>任務統計</CardTitle>
                <CardDescription>各任務執行統計數據</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">任務名稱</th>
                        <th className="text-right p-3 text-sm font-medium text-[var(--text-secondary)]">總執行</th>
                        <th className="text-right p-3 text-sm font-medium text-[var(--text-secondary)]">成功率</th>
                        <th className="text-right p-3 text-sm font-medium text-[var(--text-secondary)]">平均時長</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.task_statistics.map((stat) => (
                        <tr key={stat.task_name} className="border-b border-[var(--border)]">
                          <td className="p-3 font-medium text-[var(--foreground)]">{stat.task_name}</td>
                          <td className="p-3 text-right text-[var(--foreground)]">{stat.total_executions}</td>
                          <td className="p-3 text-right">
                            <span className={`${stat.success_rate >= 90 ? 'text-green-600' : stat.success_rate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {stat.success_rate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3 text-right text-[var(--foreground)]">
                            {(stat.average_duration_ms / 1000).toFixed(2)}s
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          {dashboardData && (
            <JobsList
              tasks={dashboardData.tasks}
              loading={loading}
              onRefresh={handleRefresh}
              onTriggerTask={async (taskName) => {
                await schedulerAPI.triggerTask(taskName);
                await loadSchedulerData();
              }}
            />
          )}
        </TabsContent>

        {/* Executions Tab */}
        <TabsContent value="executions">
          {dashboardData && (
            <ExecutionHistory
              executions={dashboardData.recent_executions}
              loading={loading}
              onRefresh={handleRefresh}
              onCancelTask={async (executionId) => {
                await schedulerAPI.cancelExecution(executionId);
                await loadSchedulerData();
              }}
            />
          )}
        </TabsContent>

        {/* Locks Tab */}
        <TabsContent value="locks">
          <LocksTable
            loading={loading}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        {/* Instances Tab */}
        <TabsContent value="instances">
          {dashboardData && (
            <InstancesMonitor
              instances={dashboardData.leader_status.instances}
              leaderStatus={dashboardData.leader_status}
              loading={loading}
              onRefresh={handleRefresh}
              onForceElection={async () => {
                await schedulerAPI.forceLeaderElection();
                await loadSchedulerData();
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
