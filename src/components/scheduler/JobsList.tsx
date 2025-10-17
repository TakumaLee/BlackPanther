'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import type { ScheduledTask } from '@/types/scheduler';

interface JobsListProps {
  tasks: ScheduledTask[];
  loading?: boolean;
  onRefresh: () => void;
  onTriggerTask: (taskName: string) => Promise<void>;
}

export default function JobsList({
  tasks,
  loading = false,
  onRefresh,
  onTriggerTask
}: JobsListProps) {
  const [triggeringTask, setTriggeringTask] = useState<string | null>(null);

  const handleTriggerTask = async (taskName: string) => {
    setTriggeringTask(taskName);
    try {
      await onTriggerTask(taskName);
    } catch (error) {
      console.error('Failed to trigger task:', error);
      alert('觸發任務失敗：' + (error instanceof Error ? error.message : '未知錯誤'));
    } finally {
      setTriggeringTask(null);
    }
  };

  const formatNextRun = (nextRunTime: string | Date) => {
    const nextRun = new Date(nextRunTime);
    const now = new Date();
    const diffMs = nextRun.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return '已過期';
    } else if (diffDays > 0) {
      return `${diffDays}天後`;
    } else if (diffHours > 0) {
      return `${diffHours}小時後`;
    } else if (diffMins > 0) {
      return `${diffMins}分鐘後`;
    } else {
      return '即將執行';
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  const getStatusBadge = (status: string, enabled: boolean) => {
    if (!enabled) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          已停用
        </span>
      );
    }

    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            執行中
          </span>
        );
      case 'paused':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            已暫停
          </span>
        );
      case 'disabled':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            已停用
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {status}
          </span>
        );
    }
  };

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              預定任務列表
            </CardTitle>
            <CardDescription>
              查看和管理所有排程任務 ({tasks.length} 個任務)
            </CardDescription>
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
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暫無預定任務</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-[var(--border)] rounded-lg p-4 hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="flex items-start justify-between">
                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-[var(--foreground)] truncate">
                        {task.name}
                      </h3>
                      {getStatusBadge(task.status, task.enabled)}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <span className="font-medium">函數:</span>
                        <code className="text-xs bg-[var(--surface-hover)] px-2 py-0.5 rounded">
                          {task.task_type}
                        </code>
                      </div>

                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <span className="font-medium">觸發器:</span>
                        <span>Cron</span>
                        {task.cron_expression && (
                          <code className="text-xs bg-[var(--surface-hover)] px-2 py-0.5 rounded">
                            {task.cron_expression}
                          </code>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <span className="font-medium">下次執行:</span>
                        <span className="flex items-center gap-1">
                          {formatTimestamp(task.next_run)}
                          <span className="text-blue-600 font-medium">
                            ({formatNextRun(task.next_run)})
                          </span>
                        </span>
                      </div>

                      {task.last_run && (
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <span className="font-medium">上次執行:</span>
                          <span>{formatTimestamp(task.last_run)}</span>
                        </div>
                      )}

                      {task.description && (
                        <div className="text-[var(--text-secondary)] mt-2 text-xs">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTriggerTask(task.name)}
                      disabled={!task.enabled || triggeringTask === task.name || loading}
                      className="whitespace-nowrap"
                    >
                      {triggeringTask === task.name ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          執行中...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          手動觸發
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-6 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>重試次數: {task.retry_attempts}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>超時: {task.timeout_seconds}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>建立於: {formatTimestamp(task.created_at)}</span>
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
