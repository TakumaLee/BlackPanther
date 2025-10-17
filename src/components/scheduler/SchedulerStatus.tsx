'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Server,
  CheckCircle2,
  XCircle,
  Crown,
  Clock,
  RefreshCw
} from 'lucide-react';
import type { LeaderElectionStatus, SystemMetrics } from '@/types/scheduler';

interface SchedulerStatusProps {
  leaderStatus: LeaderElectionStatus;
  metrics: SystemMetrics;
  loading?: boolean;
  onRefresh: () => void;
}

export default function SchedulerStatus({
  leaderStatus,
  metrics,
  loading = false,
  onRefresh
}: SchedulerStatusProps) {
  const formatUptime = (startedAt: string | Date) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}天 ${diffHours % 24}小時`;
    } else if (diffHours > 0) {
      return `${diffHours}小時 ${diffMins % 60}分鐘`;
    } else {
      return `${diffMins}分鐘`;
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  const isHealthy = leaderStatus.is_healthy && leaderStatus.current_leader !== null;

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              調度器狀態
            </CardTitle>
            <CardDescription>領導選舉與實例狀態</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Status */}
        <div className="flex items-center justify-between p-4 bg-[var(--surface-hover)] rounded-lg">
          <div className="flex items-center gap-3">
            {isHealthy ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <div>
              <div className="font-medium text-[var(--foreground)]">
                系統健康狀態
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {isHealthy ? '正常運行' : '需要注意'}
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isHealthy
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {isHealthy ? '健康' : '異常'}
          </div>
        </div>

        {/* Leader Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <Crown className="h-4 w-4" />
            領導者資訊
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-[var(--border)] rounded-lg">
              <div className="text-xs text-[var(--text-secondary)] mb-1">當前領導</div>
              <div className="font-medium text-[var(--foreground)] truncate">
                {leaderStatus.current_leader || '無領導者'}
              </div>
            </div>

            <div className="p-3 border border-[var(--border)] rounded-lg">
              <div className="text-xs text-[var(--text-secondary)] mb-1">活躍實例</div>
              <div className="font-medium text-[var(--foreground)]">
                {leaderStatus.instances.filter(i => i.is_healthy).length} / {leaderStatus.instances.length}
              </div>
            </div>
          </div>

          {leaderStatus.leader_since && (
            <div className="p-3 border border-[var(--border)] rounded-lg">
              <div className="text-xs text-[var(--text-secondary)] mb-1">領導起始時間</div>
              <div className="font-medium text-[var(--foreground)]">
                {formatTimestamp(leaderStatus.leader_since)}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                運行時長：{formatUptime(leaderStatus.leader_since)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-[var(--border)] rounded-lg">
              <div className="text-xs text-[var(--text-secondary)] mb-1">選舉任期</div>
              <div className="font-medium text-[var(--foreground)]">
                #{leaderStatus.election_term}
              </div>
            </div>

            <div className="p-3 border border-[var(--border)] rounded-lg">
              <div className="text-xs text-[var(--text-secondary)] mb-1">最後選舉</div>
              <div className="font-medium text-[var(--foreground)] text-xs">
                {formatTimestamp(leaderStatus.last_election_at)}
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="space-y-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <Clock className="h-4 w-4" />
            系統指標
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">活躍任務</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {metrics.active_tasks}
              </div>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">今日成功</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {metrics.successful_executions_today}
              </div>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">運行中</div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {metrics.running_executions}
              </div>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">平均時長</div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {(metrics.average_execution_time_ms / 1000).toFixed(1)}s
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-[var(--text-muted)] text-center pt-2 border-t border-[var(--border)]">
          最後更新：{formatTimestamp(metrics.last_updated)}
        </div>
      </CardContent>
    </Card>
  );
}
