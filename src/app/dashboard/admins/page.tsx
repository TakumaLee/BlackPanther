'use client';

import { useState, useEffect } from 'react';
import { adminsApi } from '@/lib/api/admins';
import { useAuth } from '@/lib/auth/auth-context';
import { Admin, AdminCreateRequest, AdminUpdateRequest } from '@/types/admins';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminFormDialog } from '@/components/admins/AdminFormDialog';
import { ResetPasswordDialog } from '@/components/admins/ResetPasswordDialog';
import {
  UserPlus,
  Search,
  Edit,
  Key,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

export default function AdminsPage() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

  // Dialogs
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | undefined>(undefined);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [resetPasswordAdmin, setResetPasswordAdmin] = useState<Admin | null>(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminsApi.getAdmins({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        is_active: statusFilter
      });

      setAdmins(response.data);
      setTotal(response.total);
      setHasNext(response.has_next);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      setError(err instanceof Error ? err.message : '載入管理員列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (data: AdminCreateRequest | AdminUpdateRequest) => {
    await adminsApi.createAdmin(data as AdminCreateRequest);
    fetchAdmins();
  };

  const handleUpdateAdmin = async (data: AdminCreateRequest | AdminUpdateRequest) => {
    if (!editingAdmin) return;
    await adminsApi.updateAdmin(editingAdmin.id, data as AdminUpdateRequest);
    fetchAdmins();
  };

  const handleToggleStatus = async (admin: Admin) => {
    const action = admin.is_active ? '停用' : '啟用';
    if (!confirm(`確定要${action} ${admin.username} 嗎？`)) {
      return;
    }

    try {
      await adminsApi.updateAdmin(admin.id, {
        is_active: !admin.is_active
      });
      fetchAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : `${action}失敗`);
    }
  };

  const handleResetPassword = async (adminId: string, newPassword?: string) => {
    const response = await adminsApi.resetAdminPassword(adminId, newPassword);
    return response.new_password;
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    if (value === '') {
      setStatusFilter(undefined);
    } else {
      setStatusFilter(value === 'active');
    }
    setCurrentPage(1);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <ShieldAlert className="h-4 w-4" />;
      case 'admin':
        return <ShieldCheck className="h-4 w-4" />;
      case 'moderator':
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderator';
      default:
        return role;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '從未登入';
    return new Date(dateString).toLocaleString('zh-TW');
  };

  if (loading && admins.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Admin Account Management</h1>
          <p className="text-[var(--text-secondary)] mt-2">管理系統管理員帳戶</p>
        </div>
        {isSuperAdmin && (
          <Button
            onClick={() => {
              setEditingAdmin(undefined);
              setShowFormDialog(true);
            }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            新增管理員
          </Button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium">權限限制</p>
          <p className="text-sm mt-1">您只能查看管理員列表，新增、編輯和停用功能僅限 Super Admin 使用</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">總管理員數</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">{total}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">啟用中</p>
                <p className="text-2xl font-bold text-green-600">
                  {admins.filter(a => a.is_active).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">已停用</p>
                <p className="text-2xl font-bold text-red-600">
                  {admins.filter(a => !a.is_active).length}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Super Admins</p>
                <p className="text-2xl font-bold text-red-600">
                  {admins.filter(a => a.role === 'super_admin').length}
                </p>
              </div>
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader>
          <CardTitle className="text-lg">搜尋與篩選</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">搜尋</Label>
              <div className="relative mt-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  id="search"
                  placeholder="Email 或 Username"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={roleFilter}
                onChange={(e) => handleRoleFilterChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md shadow-sm bg-[var(--surface)] text-[var(--foreground)]"
              >
                <option value="">全部 Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status">狀態</Label>
              <select
                id="status"
                value={statusFilter === undefined ? '' : statusFilter ? 'active' : 'inactive'}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md shadow-sm bg-[var(--surface)] text-[var(--foreground)]"
              >
                <option value="">全部狀態</option>
                <option value="active">啟用</option>
                <option value="inactive">停用</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin List Table */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最後登入
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {admin.username}
                      {currentUser?.id === admin.id && (
                        <span className="ml-2 text-xs text-blue-600">(您)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(admin.role)}`}>
                        {getRoleIcon(admin.role)}
                        {getRoleText(admin.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(admin.last_login_at)}</div>
                      {admin.last_login_ip && (
                        <div className="text-xs text-gray-400">{admin.last_login_ip}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {isSuperAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingAdmin(admin);
                                setShowFormDialog(true);
                              }}
                              title="編輯"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setResetPasswordAdmin(admin);
                                setShowResetPasswordDialog(true);
                              }}
                              title="重置密碼"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(admin)}
                              className={admin.is_active ? 'text-red-600 border-red-600 hover:bg-red-50' : 'text-green-600 border-green-600 hover:bg-green-50'}
                              title={admin.is_active ? '停用' : '啟用'}
                              disabled={currentUser?.id === admin.id}
                            >
                              {admin.is_active ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-secondary)]">
            顯示第 {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, total)} 項，共 {total} 項
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              上一頁
            </Button>

            <span className="text-sm text-[var(--text-secondary)]">
              第 {currentPage} / {Math.ceil(total / ITEMS_PER_PAGE)} 頁
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasNext || loading}
            >
              下一頁
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <AdminFormDialog
        admin={editingAdmin}
        isOpen={showFormDialog}
        onClose={() => {
          setShowFormDialog(false);
          setEditingAdmin(undefined);
        }}
        onSave={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
      />

      {/* Reset Password Dialog */}
      {resetPasswordAdmin && (
        <ResetPasswordDialog
          adminId={resetPasswordAdmin.id}
          adminUsername={resetPasswordAdmin.username}
          isOpen={showResetPasswordDialog}
          onClose={() => {
            setShowResetPasswordDialog(false);
            setResetPasswordAdmin(null);
          }}
          onReset={handleResetPassword}
        />
      )}
    </div>
  );
}
