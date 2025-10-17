'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Ban,
  Search,
  Filter,
} from 'lucide-react';
import { ipMonitoringApi } from '@/lib/api/ip-monitoring';
import type {
  IPMonitoringStats,
  SuspiciousIP,
  IPFilters,
} from '@/types/ip-monitoring';

export default function IPMonitoringPage() {
  const [stats, setStats] = useState<IPMonitoringStats | null>(null);
  const [suspiciousIPs, setSuspiciousIPs] = useState<SuspiciousIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_review' | 'blocked' | 'reviewed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // Block IP Dialog State
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedIP, setSelectedIP] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState<number | undefined>(undefined);
  const [blockLoading, setBlockLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: IPFilters = {
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
      };

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const [statsData, ipsData] = await Promise.all([
        ipMonitoringApi.getIPMonitoringStats(),
        ipMonitoringApi.getSuspiciousIPs(filters),
      ]);

      setStats(statsData);
      setSuspiciousIPs(ipsData.data);
      setTotalCount(ipsData.total);
      setTotalPages(Math.ceil(ipsData.total / pageSize));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load IP monitoring data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load IP monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const handleRefresh = () => {
    loadData();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadData();
  };

  const handleBlockIP = async () => {
    if (!selectedIP || !blockReason.trim()) {
      return;
    }

    setBlockLoading(true);
    try {
      await ipMonitoringApi.blockIP({
        ip_address: selectedIP,
        reason: blockReason.trim(),
        duration_hours: blockDuration,
      });

      setBlockDialogOpen(false);
      setSelectedIP(null);
      setBlockReason('');
      setBlockDuration(undefined);
      loadData();
    } catch (err) {
      console.error('Failed to block IP:', err);
      alert(err instanceof Error ? err.message : 'Failed to block IP');
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblockIP = async (ip: string) => {
    if (!confirm(`Are you sure you want to unblock ${ip}?`)) {
      return;
    }

    try {
      await ipMonitoringApi.unblockIP(ip);
      loadData();
    } catch (err) {
      console.error('Failed to unblock IP:', err);
      alert(err instanceof Error ? err.message : 'Failed to unblock IP');
    }
  };

  const handleMarkReviewed = async (ip: string) => {
    try {
      await ipMonitoringApi.markIPReviewed(ip);
      loadData();
    } catch (err) {
      console.error('Failed to mark IP as reviewed:', err);
      alert(err instanceof Error ? err.message : 'Failed to mark as reviewed');
    }
  };

  const openBlockDialog = (ip: string) => {
    setSelectedIP(ip);
    setBlockDialogOpen(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-red-100';
    if (score >= 50) return 'bg-orange-100';
    if (score >= 30) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Failed to Load</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">IP Monitoring</h1>
          <p className="text-[var(--text-secondary)] mt-2">Monitor and manage suspicious IP addresses</p>
          {lastUpdated && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Suspicious</p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
                  {stats?.total_suspicious || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Blocked IPs</p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
                  {stats?.total_blocked || 0}
                </p>
              </div>
              <Ban className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Pending Review</p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
                  {stats?.pending_review || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">New Today</p>
                <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
                  {stats?.today_new || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Search IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-[var(--text-secondary)]" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pending_review">Pending Review</option>
                <option value="blocked">Blocked</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suspicious IPs Table */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader>
          <CardTitle>Suspicious IP Addresses</CardTitle>
          <CardDescription>
            Showing {suspiciousIPs.length} of {totalCount} suspicious IPs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suspiciousIPs.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">IP Address</th>
                      <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">Score</th>
                      <th className="text-right p-3 text-sm font-medium text-[var(--text-secondary)]">Requests</th>
                      <th className="text-right p-3 text-sm font-medium text-[var(--text-secondary)]">Failed Auth</th>
                      <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">Countries</th>
                      <th className="text-left p-3 text-sm font-medium text-[var(--text-secondary)]">First/Last Seen</th>
                      <th className="text-center p-3 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                      <th className="text-center p-3 text-sm font-medium text-[var(--text-secondary)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspiciousIPs.map((ip) => (
                      <tr key={ip.ip_address} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)]">
                        <td className="p-3 font-mono text-sm">{ip.ip_address}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-md text-xs font-semibold ${getScoreColor(ip.suspicious_score)} ${getScoreBgColor(ip.suspicious_score)}`}>
                              {ip.suspicious_score}
                            </div>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${ip.suspicious_score >= 80 ? 'bg-red-600' : ip.suspicious_score >= 50 ? 'bg-orange-600' : ip.suspicious_score >= 30 ? 'bg-yellow-600' : 'bg-green-600'}`}
                                style={{ width: `${ip.suspicious_score}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right">{ip.total_requests}</td>
                        <td className="p-3 text-right">
                          <span className={ip.failed_auth_count > 0 ? 'text-red-600 font-semibold' : ''}>
                            {ip.failed_auth_count}
                          </span>
                        </td>
                        <td className="p-3 text-xs">
                          {ip.countries.length > 0 ? ip.countries.join(', ') : 'N/A'}
                        </td>
                        <td className="p-3 text-xs">
                          <div>{new Date(ip.first_seen_at).toLocaleDateString()}</div>
                          <div className="text-[var(--text-muted)]">{new Date(ip.last_seen_at).toLocaleDateString()}</div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex flex-col gap-1 items-center">
                            {ip.is_blocked && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                                <Ban className="h-3 w-3" />
                                Blocked
                              </span>
                            )}
                            {ip.is_reviewed && !ip.is_blocked && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                <CheckCircle2 className="h-3 w-3" />
                                Reviewed
                              </span>
                            )}
                            {!ip.is_reviewed && !ip.is_blocked && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                                <Clock className="h-3 w-3" />
                                Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 justify-center">
                            {!ip.is_blocked && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openBlockDialog(ip.ip_address)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Ban className="h-3 w-3 mr-1" />
                                  Block
                                </Button>
                                {!ip.is_reviewed && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMarkReviewed(ip.ip_address)}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Review
                                  </Button>
                                )}
                              </>
                            )}
                            {ip.is_blocked && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnblockIP(ip.ip_address)}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Unblock
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="text-sm text-[var(--text-secondary)]">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-[var(--text-secondary)] py-8">
              No suspicious IPs found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block IP Dialog */}
      {blockDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Block IP Address</CardTitle>
              <CardDescription>Block {selectedIP} from accessing the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reason *</label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter reason for blocking..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (hours, optional)</label>
                <input
                  type="number"
                  value={blockDuration || ''}
                  onChange={(e) => setBlockDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Leave empty for permanent block"
                  min="1"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBlockDialogOpen(false);
                    setSelectedIP(null);
                    setBlockReason('');
                    setBlockDuration(undefined);
                  }}
                  disabled={blockLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBlockIP}
                  disabled={!blockReason.trim() || blockLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {blockLoading ? 'Blocking...' : 'Block IP'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
