// IP Monitoring Types
// IP 監控類型定義

export interface IPMonitoringStats {
  total_suspicious: number;
  total_blocked: number;
  pending_review: number;
  today_new: number;
}

export interface SuspiciousIP {
  ip_address: string;
  suspicious_score: number;
  total_requests: number;
  failed_auth_count: number;
  countries: string[];
  first_seen_at: string;
  last_seen_at: string;
  is_reviewed: boolean;
  is_blocked: boolean;
}

export interface IPCheckResult {
  ip_address: string;
  is_suspicious: boolean;
  is_blocked: boolean;
  suspicious_score: number;
  total_requests: number;
  failed_auth_count: number;
  countries: string[];
  first_seen_at: string;
  last_seen_at: string;
  is_reviewed: boolean;
  block_info?: {
    blocked_by: string;
    blocked_at: string;
    reason: string;
    blocked_until?: string;
  };
}

export interface IPBlockRequest {
  ip_address: string;
  reason: string;
  duration_hours?: number;
}

export interface IPBlockResponse {
  message: string;
  ip_address: string;
  blocked_until?: string;
}

export interface SuspiciousIPsResponse {
  data: SuspiciousIP[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
}

export interface IPFilters {
  search?: string;
  status?: 'all' | 'pending_review' | 'blocked' | 'reviewed';
  min_score?: number;
  page?: number;
  limit?: number;
}
