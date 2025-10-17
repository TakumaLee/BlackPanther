'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Server,
  Crown,
  CheckCircle2,
  XCircle,
  Activity,
  Clock,
  Cpu,
  HardDrive,
  RefreshCw,
  Zap
} from 'lucide-react';
import type { SchedulerInstance, LeaderElectionStatus } from '@/types/scheduler';

interface InstancesMonitorProps {
  instances: SchedulerInstance[];
  leaderStatus: LeaderElectionStatus;
  loading?: boolean;
  onRefresh: () => void;
  onForceElection: () => Promise<void>;
}

export default function InstancesMonitor({
  instances,
  leaderStatus,
  loading = false,
  onRefresh,
  onForceElection
}: InstancesMonitorProps) {
  const handleForceElection = async () => {
    if (!confirm('確定要強制觸發領導選舉嗎？這將會選出新的領導者。')) {
      return;
    }

    try {
      await onForceElection();
    } catch (error) {
      console.error('Failed to force election:', error);
      alert('觸發選舉失敗：' + (error instanceof Error ? error.message : '未知錯誤'));
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}天 ${hours}小時`;
    } else if (hours > 0) {
      return `${hours}小時 ${minutes}分鐘`;
    } else {
      return `${minutes}分鐘`;
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  const getStatusIcon = (status: string, isHealthy: boolean) => {
    if (!isHealthy) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }

    switch (status) {
      case 'leader':
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'candidate':
        return <Activity className="h-5 w-5 text-blue-600" />;
      default:
        return <Server className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string, isHealthy: boolean) => {
    if (!isHealthy) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          異常
        </span>
      );
    }

    switch (status) {
      case 'leader':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Crown className="h-3 w-3" />
            領導者
          </span>
        );
      case 'active':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            活躍
          </span>
        );
      case 'candidate':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            候選
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const healthyInstances = instances.filter(i => i.is_healthy).length;
  const totalInstances = instances.length;

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              實例監控
            </CardTitle>
            <CardDescription>
              調度器實例狀態監控 ({healthyInstances}/{totalInstances} 健康)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleForceElection}
              disabled={loading}
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              強制選舉
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Leader Election Summary */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <span className="font-medium text-yellow-800 dark:text-yellow-300">領導選舉資訊</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-yellow-700 dark:text-yellow-400">當前領導:</span>
              <span className="ml-2 font-mono font-medium text-yellow-900 dark:text-yellow-200">
                {leaderStatus.current_leader || '無'}
              </span>
            </div>
            <div>
              <span className="text-yellow-700 dark:text-yellow-400">選舉任期:</span>
              <span className="ml-2 font-medium text-yellow-900 dark:text-yellow-200">
                #{leaderStatus.election_term}
              </span>
            </div>
            <div>
              <span className="text-yellow-700 dark:text-yellow-400">健康狀態:</span>
              <span className={`ml-2 font-medium ${
                leaderStatus.is_healthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {leaderStatus.is_healthy ? '正常' : '異常'}
              </span>
            </div>
          </div>
        </div>

        {/* Instances Grid */}
        {instances.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暫無實例資訊</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instances.map((instance) => (
              <div
                key={instance.instance_id}
                className={`border rounded-lg p-4 ${
                  instance.status === 'leader'
                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
                    : instance.is_healthy
                    ? 'border-[var(--border)] bg-[var(--surface-hover)]'
                    : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                {/* Instance Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(instance.status, instance.is_healthy)}
                    <div>
                      <div className="font-medium text-[var(--foreground)] text-sm truncate">
                        {instance.hostname}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] font-mono">
                        {instance.instance_id}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(instance.status, instance.is_healthy)}
                </div>

                {/* Instance Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded">
                    <Cpu className="h-4 w-4 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[var(--text-secondary)]">CPU</div>
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        {instance.cpu_usage_percent.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded">
                    <HardDrive className="h-4 w-4 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[var(--text-secondary)]">記憶體</div>
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        {instance.memory_usage_mb.toFixed(0)} MB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded">
                    <Activity className="h-4 w-4 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[var(--text-secondary)]">活躍任務</div>
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        {instance.active_tasks}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[var(--text-secondary)]">運行時長</div>
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        {formatUptime(instance.uptime_seconds)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instance Details */}
                <div className="pt-3 border-t border-[var(--border)] space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">版本:</span>
                    <span className="font-mono text-[var(--foreground)]">{instance.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">PID:</span>
                    <span className="font-mono text-[var(--foreground)]">{instance.pid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">負載係數:</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {instance.load_factor.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">啟動時間:</span>
                    <span className="text-[var(--text-muted)]">
                      {formatTimestamp(instance.started_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">最後心跳:</span>
                    <span className="text-[var(--text-muted)]">
                      {formatTimestamp(instance.last_heartbeat)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
