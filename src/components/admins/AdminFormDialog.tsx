'use client';

import { useState, useEffect } from 'react';
import { Admin, AdminCreateRequest, AdminUpdateRequest } from '@/types/admins';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface AdminFormDialogProps {
  admin?: Admin;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AdminCreateRequest | AdminUpdateRequest) => Promise<void>;
}

export function AdminFormDialog({ admin, isOpen, onClose, onSave }: AdminFormDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    role: 'moderator',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!admin;

  useEffect(() => {
    if (admin) {
      setFormData({
        email: admin.email,
        username: admin.username,
        password: '',
        role: admin.role,
        is_active: admin.is_active
      });
    } else {
      setFormData({
        email: '',
        username: '',
        password: '',
        role: 'moderator',
        is_active: true
      });
    }
    setError(null);
  }, [admin, isOpen]);

  const validateForm = (): boolean => {
    if (!isEditMode) {
      // Create mode validation
      if (!formData.email.trim()) {
        setError('Email 為必填欄位');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Email 格式不正確');
        return false;
      }
      if (!formData.username.trim()) {
        setError('Username 為必填欄位');
        return false;
      }
      if (!formData.password || formData.password.length < 8) {
        setError('密碼至少需要 8 個字元');
        return false;
      }
    } else {
      // Edit mode validation
      if (!formData.username.trim()) {
        setError('Username 為必填欄位');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        const updateData: AdminUpdateRequest = {
          username: formData.username,
          role: formData.role,
          is_active: formData.is_active
        };
        await onSave(updateData);
      } else {
        const createData: AdminCreateRequest = {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: formData.role
        };
        await onSave(createData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full m-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {isEditMode ? '編輯管理員' : '新增管理員'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!isEditMode && (
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                  disabled={loading}
                  required
                />
              </div>
            )}

            {isEditMode && (
              <div>
                <Label htmlFor="email-readonly">Email</Label>
                <Input
                  id="email-readonly"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Email 無法修改</p>
              </div>
            )}

            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin_username"
                disabled={loading}
                required
              />
            </div>

            {!isEditMode && (
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="至少 8 個字元"
                  disabled={loading}
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">密碼需至少 8 個字元</p>
              </div>
            )}

            <div>
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md shadow-sm bg-[var(--surface)] text-[var(--foreground)]"
                disabled={loading}
              >
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Moderator: 基本審核權限 | Admin: 完整管理權限 | Super Admin: 最高權限
              </p>
            </div>

            {isEditMode && (
              <div>
                <Label htmlFor="is_active">狀態</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    disabled={loading}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">
                    {formData.is_active ? '啟用' : '停用'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? '處理中...' : (isEditMode ? '更新' : '建立')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
