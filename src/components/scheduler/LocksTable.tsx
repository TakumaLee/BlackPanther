'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { getSchedulerAPI } from '@/lib/api/scheduler-api';
import type { DistributedLock } from '@/types/scheduler';

interface LocksTableProps {
  loading?: boolean;
  onRefresh: () => void;
}

export default function LocksTable({
  loading: parentLoading = false,
  onRefresh
}: LocksTableProps) {
  const [locks, setLocks] = useState<DistributedLock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [releasingLock, setReleasingLock] = useState<string | null>(null);

  const schedulerAPI = getSchedulerAPI();

  const loadLocks = async () => {
    setLoading(true);
    setError(null);

    try {
      // Note: This endpoint needs to be added to scheduler-api.ts
      const response = await fetch(
        `${schedulerAPI.getBaseUrl()}/api/v1/admin/scheduler/locks-list`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setLocks(data.locks || []);
    } catch (err) {
      console.error('Failed to load locks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load locks');
      setLocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocks();
  }, []);

  const handleReleaseLock = async (lockName: string) => {
    if (!confirm(`確定要釋放鎖 "${lockName}" 嗎？這可能會導致任務重複執行。`)) {
      return;
    }

    setReleasingLock(lockName);

    try {
      // Note: This endpoint needs to be added to scheduler-api.ts
      const response = await fetch(
        `${schedulerAPI.getBaseUrl()}/api/v1/admin/scheduler/locks/${encodeURIComponent(lockName)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Reload locks after successful release
      await loadLocks();
      onRefresh();
    } catch (err) {
      console.error('Failed to release lock:', err);
      alert('釋放鎖失敗：' + (err instanceof Error ? err.message : '未知錯誤'));
    } finally {
      setReleasingLock(null);
    }
  };

  const handleRefresh = () => {
    loadLocks();
    onRefresh();
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  const getTimeRemaining = (expiresAt: string | Date) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMs < 0) {
      return '已過期';
    } else if (diffMins > 0) {
      return `${diffMins}分 ${diffSecs}秒`;
    } else {
      return `${diffSecs}秒`;
    }
  };

  const isLoading = loading || parentLoading;

  return (
    <Card className="border-[var(--border)] bg-[var(--surface)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              分散式鎖管理
            </CardTitle>
            <CardDescription>
              查看和管理調度器分散式鎖 ({locks.length} 個鎖)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">載入失敗</span>
            </div>
            <p className="text-red-700 mt-2 text-sm">{error}</p>
            <Button onClick={handleRefresh} className="mt-4" variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              重試
            </Button>
          </div>
        ) : locks.length === 0 && !isLoading ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <Unlock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>目前沒有活躍的分散式鎖</p>
            <p className="text-sm mt-2">當任務開始執行時，會自動建立分散式鎖</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">
                    鎖名稱
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">
                    持有實例
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">
                    取得時間
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">
                    過期時間
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">
                    剩餘時間
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">
                    狀態
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {locks.map((lock) => (
                  <tr key={lock.lock_name} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        <code className="text-sm font-medium text-[var(--foreground)] bg-[var(--surface-hover)] px-2 py-0.5 rounded">
                          {lock.lock_name}
                        </code>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-[var(--foreground)] font-mono">
                        {lock.instance_id}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {formatTimestamp(lock.acquired_at)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-[var(--text-secondary)]">
                        {formatTimestamp(lock.expires_at)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-sm font-medium ${
                        lock.is_expired ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {getTimeRemaining(lock.expires_at)}
                      </span>
                    </td>
                    <td className="p-3">
                      {lock.is_expired ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                          <AlertCircle className="h-3 w-3" />
                          已過期
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          有效
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReleaseLock(lock.lock_name)}
                        disabled={releasingLock === lock.lock_name}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {releasingLock === lock.lock_name ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            釋放中...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            強制釋放
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isLoading && locks.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">關於分散式鎖</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>分散式鎖用於確保同一任務在多個實例中只執行一次</li>
                <li>鎖會在任務完成或超時後自動釋放</li>
                <li>強制釋放鎖可能導致任務重複執行，請謹慎操作</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
