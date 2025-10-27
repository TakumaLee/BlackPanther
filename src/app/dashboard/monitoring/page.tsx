'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Server,
  Database,
  // Wifi,
  // HardDrive,
  // Cpu,
  // MemoryStick,
  // Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  // TrendingUp,
  // TrendingDown,
  Zap,
  Globe,
  // Monitor,
  // BarChart3,
  Shield
  // Users
} from 'lucide-react';
import { getSystemMetrics, getSystemLogs, getAlerts, toggleAlert, SystemMetrics, LogEntry, AlertRule, LogFilters } from '@/lib/api/monitoring';

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [logFilters, setLogFilters] = useState<LogFilters>({ page: 1, limit: 20 });
  const [hasMoreLogs, setHasMoreLogs] = useState(false);

  // Load monitoring data from API
  useEffect(() => {
    const loadMonitoringData = async () => {
      setLoading(true);
      try {
        const [metricsData, logsData, alertsData] = await Promise.all([
          getSystemMetrics(),
          getSystemLogs(logFilters),
          getAlerts()
        ]);

        setMetrics(metricsData);
        setLogs(logsData.logs);
        setHasMoreLogs(logsData.has_next);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Failed to load monitoring data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMonitoringData();
  }, []);

  // Auto-refresh metrics
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const metricsData = await getSystemMetrics();
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to refresh metrics:', error);
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
      case 'error':
      case 'stopped':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
      case 'error':
      case 'stopped':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'critical': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}天 ${hours}小時 ${minutes}分鐘`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [metricsData, logsData, alertsData] = await Promise.all([
        getSystemMetrics(),
        getSystemLogs(logFilters),
        getAlerts()
      ]);

      setMetrics(metricsData);
      setLogs(logsData.logs);
      setHasMoreLogs(logsData.has_next);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to refresh monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAlert = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    try {
      const result = await toggleAlert(alertId, !alert.enabled);
      setAlerts(prev => prev.map(a =>
        a.id === alertId ? result.alert : a
      ));
    } catch (error) {
      console.error('Failed to toggle alert:', error);
    }
  };

  const loadMoreLogs = async () => {
    if (!hasMoreLogs) return;

    try {
      const nextPage = (logFilters.page || 1) + 1;
      const logsData = await getSystemLogs({ ...logFilters, page: nextPage });
      setLogs(prev => [...prev, ...logsData.logs]);
      setHasMoreLogs(logsData.has_next);
      setLogFilters(prev => ({ ...prev, page: nextPage }));
    } catch (error) {
      console.error('Failed to load more logs:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return <div>無法載入監控數據</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">系統監控</h1>
          <p className="text-[var(--text-secondary)] mt-2">查看系統狀態和性能</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)]">自動刷新：</label>
            <select
              className="px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--foreground)]"
              value={autoRefresh ? refreshInterval : 'off'}
              onChange={(e) => {
                if (e.target.value === 'off') {
                  setAutoRefresh(false);
                } else {
                  setAutoRefresh(true);
                  setRefreshInterval(parseInt(e.target.value));
                }
              }}
            >
              <option value="off">關閉</option>
              <option value="10">10秒</option>
              <option value="30">30秒</option>
              <option value="60">1分鐘</option>
              <option value="300">5分鐘</option>
            </select>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            手動刷新
          </Button>
        </div>
      </div>

      {/* 系統狀態總覽 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">伺服器狀態</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(metrics.server.status)}
                  <span className={`font-medium ${getStatusColor(metrics.server.status)}`}>
                    {metrics.server.status === 'healthy' ? '正常' :
                     metrics.server.status === 'warning' ? '警告' : '嚴重'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  運行時間：{formatUptime(metrics.server.uptime)}
                </p>
              </div>
              <Server className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">資料庫狀態</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(metrics.database.status)}
                  <span className={`font-medium ${getStatusColor(metrics.database.status)}`}>
                    {metrics.database.status === 'healthy' ? '正常' :
                     metrics.database.status === 'warning' ? '警告' : '嚴重'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  連線：{metrics.database.connections}/{metrics.database.max_connections}
                </p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">API 狀態</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(metrics.api.status)}
                  <span className={`font-medium ${getStatusColor(metrics.api.status)}`}>
                    {metrics.api.status === 'healthy' ? '正常' :
                     metrics.api.status === 'warning' ? '警告' : '嚴重'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  回應時間：{metrics.api.response_time_avg}ms
                </p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">活躍服務</p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
                  {metrics.services.filter(s => s.status === 'running').length}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  共 {metrics.services.length} 個服務
                </p>
              </div>
              <Activity className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="metrics">系統指標</TabsTrigger>
          <TabsTrigger value="services">服務狀態</TabsTrigger>
          <TabsTrigger value="logs">系統日誌</TabsTrigger>
          <TabsTrigger value="alerts">告警設定</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 伺服器資源 */}
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  伺服器資源
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">CPU 使用率</span>
                    <span className="text-sm font-medium">{metrics.server.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metrics.server.cpu_usage > 80 ? 'bg-red-600' :
                        metrics.server.cpu_usage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${metrics.server.cpu_usage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">記憶體使用率</span>
                    <span className="text-sm font-medium">{metrics.server.memory_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metrics.server.memory_usage > 80 ? 'bg-red-600' :
                        metrics.server.memory_usage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${metrics.server.memory_usage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">磁碟使用率</span>
                    <span className="text-sm font-medium">{metrics.server.disk_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metrics.server.disk_usage > 80 ? 'bg-red-600' :
                        metrics.server.disk_usage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${metrics.server.disk_usage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border)]">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-[var(--foreground)]">{metrics.server.load_average[0]}</div>
                      <div className="text-[var(--text-secondary)]">1分鐘</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[var(--foreground)]">{metrics.server.load_average[1]}</div>
                      <div className="text-[var(--text-secondary)]">5分鐘</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[var(--foreground)]">{metrics.server.load_average[2]}</div>
                      <div className="text-[var(--text-secondary)]">15分鐘</div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-[var(--text-muted)] mt-2">系統負載平均值</div>
                </div>
              </CardContent>
            </Card>

            {/* API 性能 */}
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  API 性能
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {metrics.api.response_time_avg}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">平均回應時間 (ms)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {metrics.api.requests_per_minute}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">每分鐘請求數</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">錯誤率</span>
                    <span className={`text-sm font-medium ${
                      metrics.api.error_rate > 5 ? 'text-red-600' :
                      metrics.api.error_rate > 2 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {metrics.api.error_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metrics.api.error_rate > 5 ? 'bg-red-600' :
                        metrics.api.error_rate > 2 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(100, metrics.api.error_rate * 10)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 資料庫性能 */}
            <Card className="border-[var(--border)] bg-[var(--surface)] lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  資料庫性能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {metrics.database.connections}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">活躍連線</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      / {metrics.database.max_connections} 最大
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {metrics.database.query_time_avg}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">平均查詢時間</div>
                    <div className="text-xs text-[var(--text-muted)]">毫秒</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {metrics.database.slow_queries}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">慢查詢</div>
                    <div className="text-xs text-[var(--text-muted)]">最近1小時</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getStatusColor(metrics.database.status)}`}>
                      {metrics.database.status === 'healthy' ? '正常' :
                       metrics.database.status === 'warning' ? '警告' : '嚴重'}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">資料庫狀態</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle>服務狀態</CardTitle>
              <CardDescription>查看各個服務的運行狀態</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--foreground)]">{service.name}</div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          運行時間：{formatUptime(service.uptime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                        {service.status === 'running' ? '運行中' :
                         service.status === 'stopped' ? '已停止' : '錯誤'}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        最後檢查：{formatTimestamp(service.last_check)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle>系統日誌</CardTitle>
              <CardDescription>查看最近的系統事件和錯誤</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 border border-[var(--border)] rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className="font-medium text-[var(--foreground)]">{log.service}</span>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                        <div className="text-[var(--foreground)] mb-2">{log.message}</div>
                        {log.details && (
                          <div className="text-sm text-[var(--text-secondary)] font-mono bg-[var(--surface-hover)] p-2 rounded">
                            {log.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMoreLogs && (
                <div className="text-center mt-6">
                  <Button variant="outline" onClick={loadMoreLogs}>
                    載入更多日誌
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                告警規則設定
              </CardTitle>
              <CardDescription>管理系統監控告警規則</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-[var(--foreground)] mb-1">{alert.name}</div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        當 {alert.metric} {alert.condition} {alert.threshold} 時觸發告警
                      </div>
                      {alert.last_triggered && (
                        <div className="text-xs text-[var(--text-muted)] mt-1">
                          最後觸發：{formatTimestamp(alert.last_triggered)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAlert(alert.id)}
                        className={alert.enabled ? 'text-red-600 border-red-600' : 'text-green-600 border-green-600'}
                      >
                        {alert.enabled ? '停用' : '啟用'}
                      </Button>
                      <div className={`w-3 h-3 rounded-full ${alert.enabled ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-[var(--surface-hover)] rounded-lg">
                <h4 className="font-medium text-[var(--foreground)] mb-2">新增告警規則</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  如需新增自定義告警規則，請聯絡系統管理員或使用 API 進行配置。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}