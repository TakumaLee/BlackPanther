/**
 * System Monitoring API Client
 * Handles system metrics, logs, and alert management
 */

import { getAuthHeaders } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Type definitions matching backend schemas
export interface SystemMetrics {
  server: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    uptime: number;
    load_average: [number, number, number];
    status: 'healthy' | 'warning' | 'critical';
  };
  database: {
    connections: number;
    max_connections: number;
    query_time_avg: number;
    slow_queries: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  api: {
    response_time_avg: number;
    requests_per_minute: number;
    error_rate: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  services: Array<{
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: number;
    last_check: string;
  }>;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  service: string;
  message: string;
  details?: string;
}

export interface LogFilters {
  level?: 'info' | 'warning' | 'error' | 'critical' | 'all';
  service?: string;
  start_time?: string;
  end_time?: string;
  page?: number;
  limit?: number;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  last_triggered?: string;
}

export interface CreateAlertRequest {
  name: string;
  metric: string;
  condition: '>' | '<' | '=' | '>=' | '<=';
  threshold: number;
  enabled?: boolean;
}

/**
 * Get system metrics
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  const response = await fetch(`${API_URL}/api/v1/admin/monitoring/metrics`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch system metrics: ${response.status}`);
  }

  return response.json();
}

/**
 * Get system logs with filters
 */
export async function getSystemLogs(filters: LogFilters = {}): Promise<LogsResponse> {
  const params = new URLSearchParams();

  if (filters.level && filters.level !== 'all') params.append('level', filters.level);
  if (filters.service) params.append('service', filters.service);
  if (filters.start_time) params.append('start_time', filters.start_time);
  if (filters.end_time) params.append('end_time', filters.end_time);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const query = params.toString();
  const response = await fetch(`${API_URL}/api/v1/admin/monitoring/logs${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch system logs: ${response.status}`);
  }

  return response.json();
}

/**
 * Get all alert rules
 */
export async function getAlerts(): Promise<AlertRule[]> {
  const response = await fetch(`${API_URL}/api/v1/admin/monitoring/alerts`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch alerts: ${response.status}`);
  }

  return response.json();
}

/**
 * Create a new alert rule
 */
export async function createAlert(alert: CreateAlertRequest): Promise<{
  success: boolean;
  message: string;
  alert: AlertRule;
}> {
  const response = await fetch(`${API_URL}/api/v1/admin/monitoring/alerts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(alert),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create alert: ${response.status}`);
  }

  return response.json();
}

/**
 * Update an alert rule
 */
export async function updateAlert(alertId: string, alert: Partial<AlertRule>): Promise<{
  success: boolean;
  message: string;
  alert: AlertRule;
}> {
  const response = await fetch(`${API_URL}/api/v1/admin/monitoring/alerts/${alertId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(alert),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update alert: ${response.status}`);
  }

  return response.json();
}

/**
 * Delete an alert rule
 */
export async function deleteAlert(alertId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch(`${API_URL}/api/v1/admin/monitoring/alerts/${alertId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete alert: ${response.status}`);
  }

  return response.json();
}

/**
 * Toggle alert enabled status
 */
export async function toggleAlert(alertId: string, enabled: boolean): Promise<{
  success: boolean;
  message: string;
  alert: AlertRule;
}> {
  return updateAlert(alertId, { enabled });
}
