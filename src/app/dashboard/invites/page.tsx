'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  UserPlus,
  Copy,
  Search,
  Filter,
  Gift,
  TrendingUp,
  Users,
  Coins,
  Calendar,
  // Award,
  Plus,
  Trash2,
  // Edit,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import {
  getInviteCodes,
  getInviteStats,
  getInviteActivities,
  createInviteCode,
  updateInviteCode,
  deleteInviteCode,
  type InviteCode,
  type InviteStats,
  type InviteActivity
} from '@/lib/api/invites';

export default function InvitesPage() {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [inviteStats, setInviteStats] = useState<InviteStats | null>(null);
  const [inviteActivities, setInviteActivities] = useState<InviteActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newInviteData, setNewInviteData] = useState({
    code: '',
    expires_at: '',
    usage_limit: '',
    reward_inviter: '',
    reward_invitee: '',
    description: ''
  });

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [codesData, statsData, activitiesData] = await Promise.all([
        getInviteCodes(searchTerm, statusFilter),
        getInviteStats(),
        getInviteActivities(1, 20)
      ]);

      setInviteCodes(codesData);
      setInviteStats(statsData);
      setInviteActivities(activitiesData.activities || activitiesData);
    } catch (err) {
      console.error('Failed to load invite data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invite data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'disabled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '啟用中';
      case 'expired': return '已過期';
      case 'disabled': return '已停用';
      default: return '未知';
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'pending': return '處理中';
      case 'failed': return '失敗';
      default: return '未知';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`邀請碼 ${code} 已複製到剪貼板`);
  };

  const handleCreateInvite = async () => {
    try {
      setOperationLoading(true);
      setError(null);

      const requestData = {
        code: newInviteData.code || undefined,
        expires_at: newInviteData.expires_at || null,
        usage_limit: newInviteData.usage_limit ? parseInt(newInviteData.usage_limit) : null,
        reward_inviter: newInviteData.reward_inviter ? parseInt(newInviteData.reward_inviter) : 30,
        reward_invitee: newInviteData.reward_invitee ? parseInt(newInviteData.reward_invitee) : 20,
        description: newInviteData.description || undefined
      };

      const result = await createInviteCode(requestData);

      alert(result.message || '邀請碼建立成功');
      setShowCreateModal(false);
      setNewInviteData({
        code: '',
        expires_at: '',
        usage_limit: '',
        reward_inviter: '',
        reward_invitee: '',
        description: ''
      });

      // Reload data to get the new code
      await loadData();
    } catch (err) {
      console.error('Failed to create invite code:', err);
      setError(err instanceof Error ? err.message : 'Failed to create invite code');
      alert(err instanceof Error ? err.message : '建立邀請碼失敗');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setOperationLoading(true);
      const code = inviteCodes.find(c => c.id === id);
      if (!code) return;

      const newStatus = code.status === 'active' ? 'disabled' : 'active';

      await updateInviteCode(id, { status: newStatus });

      // Update local state
      setInviteCodes(prev => prev.map(c =>
        c.id === id ? { ...c, status: newStatus } : c
      ));

      alert('邀請碼狀態已更新');
    } catch (err) {
      console.error('Failed to toggle invite code status:', err);
      alert(err instanceof Error ? err.message : '更新邀請碼狀態失敗');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('確定要刪除這個邀請碼嗎？')) return;

    try {
      setOperationLoading(true);
      await deleteInviteCode(id);

      // Update local state
      setInviteCodes(prev => prev.filter(code => code.id !== id));

      alert('邀請碼已刪除');

      // Reload stats
      const statsData = await getInviteStats();
      setInviteStats(statsData);
    } catch (err) {
      console.error('Failed to delete invite code:', err);
      alert(err instanceof Error ? err.message : '刪除邀請碼失敗');
    } finally {
      setOperationLoading(false);
    }
  };

  // Apply search and filter with API calls
  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const codesData = await getInviteCodes(searchTerm, statusFilter);
      setInviteCodes(codesData);
    } catch (err) {
      console.error('Failed to search invite codes:', err);
      setError(err instanceof Error ? err.message : 'Failed to search invite codes');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    setSearchTerm('');
    setStatusFilter('');
    setLoading(true);
    setError(null);

    try {
      const codesData = await getInviteCodes();
      setInviteCodes(codesData);
    } catch (err) {
      console.error('Failed to load invite codes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invite codes');
    } finally {
      setLoading(false);
    }
  };

  const filteredCodes = inviteCodes;

  if (loading && !inviteCodes.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">邀請系統</h1>
          <p className="text-[var(--text-secondary)] mt-2">管理邀請碼和獎勵</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} disabled={loading || operationLoading}>
          <Plus className="h-4 w-4 mr-2" />
          建立邀請碼
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 統計卡片 */}
      {inviteStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">總邀請碼</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {inviteStats.total_codes}
                  </p>
                </div>
                <Gift className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">啟用中</p>
                  <p className="text-2xl font-bold text-green-600">
                    {inviteStats.active_codes}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">總邀請數</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {inviteStats.total_invites}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">成功註冊</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {inviteStats.successful_registrations}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">轉換率</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {inviteStats.conversion_rate}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">總獎勵</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {inviteStats.total_rewards_given.toLocaleString()}
                  </p>
                </div>
                <Coins className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="codes" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="codes">邀請碼管理</TabsTrigger>
          <TabsTrigger value="activities">邀請記錄</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="space-y-4">
          {/* 搜尋與篩選 */}
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                搜尋與篩選
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search">搜尋邀請碼</Label>
                  <div className="relative mt-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                      id="search"
                      placeholder="邀請碼、建立者或描述"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">狀態篩選</Label>
                  <select
                    id="status"
                    className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--foreground)]"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                    }}
                  >
                    <option value="">全部狀態</option>
                    <option value="active">啟用中</option>
                    <option value="expired">已過期</option>
                    <option value="disabled">已停用</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    搜尋
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重設
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 邀請碼列表 */}
          <div className="space-y-4">
            {filteredCodes.map((code) => (
              <Card key={code.id} className="border-[var(--border)] bg-[var(--surface)] hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[var(--foreground)] font-mono">
                          {code.code}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(code.status)}`}>
                          {getStatusText(code.status)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCode(code.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>

                      {code.description && (
                        <p className="text-[var(--text-secondary)] text-sm mb-2">
                          {code.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-[var(--text-secondary)]">建立者：</span>
                          <span className="ml-1 font-medium">{code.creator_name}</span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">使用次數：</span>
                          <span className="ml-1 font-medium">
                            {code.used_count} {code.usage_limit ? `/ ${code.usage_limit}` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">邀請者獎勵：</span>
                          <span className="ml-1 font-medium text-yellow-600">
                            {code.reward_inviter} 金幣
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">受邀者獎勵：</span>
                          <span className="ml-1 font-medium text-yellow-600">
                            {code.reward_invitee} 金幣
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-[var(--text-secondary)]">
                        <div>建立時間：{formatDate(code.created_at)}</div>
                        {code.expires_at && (
                          <div>過期時間：{formatDate(code.expires_at)}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(code.id)}
                        disabled={operationLoading}
                        className={code.status === 'active' ? 'text-red-600 border-red-600' : 'text-green-600 border-green-600'}
                      >
                        {code.status === 'active' ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            停用
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            啟用
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCode(code.id)}
                        disabled={operationLoading}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredCodes.length === 0 && (
              <Card className="border-[var(--border)] bg-[var(--surface)]">
                <CardContent className="p-12 text-center">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">沒有找到邀請碼</h3>
                  <p className="text-[var(--text-secondary)]">請調整搜尋條件或建立新的邀請碼</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle>邀請記錄</CardTitle>
              <CardDescription>查看最近的邀請活動</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inviteActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <UserPlus className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--foreground)]">
                          {activity.inviter_name} 邀請了 {activity.invitee_name}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          邀請碼：{activity.invite_code} • {formatDate(activity.registered_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getActivityStatusColor(activity.status)}`}>
                        {getActivityStatusText(activity.status)}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        獎勵：{activity.reward_given} 金幣
                      </div>
                    </div>
                  </div>
                ))}

                {inviteActivities.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">暫無邀請記錄</h3>
                    <p className="text-[var(--text-secondary)]">邀請活動記錄將顯示在這裡</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 建立邀請碼模態 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-lg w-full m-4">
            <CardHeader>
              <CardTitle>建立新邀請碼</CardTitle>
              <CardDescription>設定邀請碼的參數和獎勵</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="new-code">邀請碼（留空自動生成）</Label>
                <Input
                  id="new-code"
                  placeholder="例如：SPECIAL2024"
                  value={newInviteData.code}
                  onChange={(e) => setNewInviteData(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reward-inviter">邀請者獎勵（金幣）</Label>
                  <Input
                    id="reward-inviter"
                    type="number"
                    placeholder="30"
                    value={newInviteData.reward_inviter}
                    onChange={(e) => setNewInviteData(prev => ({ ...prev, reward_inviter: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reward-invitee">受邀者獎勵（金幣）</Label>
                  <Input
                    id="reward-invitee"
                    type="number"
                    placeholder="20"
                    value={newInviteData.reward_invitee}
                    onChange={(e) => setNewInviteData(prev => ({ ...prev, reward_invitee: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expires-at">過期時間（可選）</Label>
                  <Input
                    id="expires-at"
                    type="datetime-local"
                    value={newInviteData.expires_at}
                    onChange={(e) => setNewInviteData(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="usage-limit">使用限制（可選）</Label>
                  <Input
                    id="usage-limit"
                    type="number"
                    placeholder="100"
                    value={newInviteData.usage_limit}
                    onChange={(e) => setNewInviteData(prev => ({ ...prev, usage_limit: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">描述（可選）</Label>
                <Input
                  id="description"
                  placeholder="邀請碼用途說明"
                  value={newInviteData.description}
                  onChange={(e) => setNewInviteData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={operationLoading}
                >
                  取消
                </Button>
                <Button onClick={handleCreateInvite} disabled={operationLoading}>
                  {operationLoading ? '建立中...' : '建立邀請碼'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}