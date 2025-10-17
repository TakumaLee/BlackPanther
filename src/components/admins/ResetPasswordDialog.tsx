'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Copy, CheckCircle2 } from 'lucide-react';

interface ResetPasswordDialogProps {
  adminId: string;
  adminUsername: string;
  isOpen: boolean;
  onClose: () => void;
  onReset: (adminId: string, newPassword?: string) => Promise<string>;
}

export function ResetPasswordDialog({
  adminId,
  adminUsername,
  isOpen,
  onClose,
  onReset
}: ResetPasswordDialogProps) {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualPassword, setManualPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setError(null);

    if (mode === 'manual') {
      if (!manualPassword || manualPassword.length < 8) {
        setError('密碼至少需要 8 個字元');
        return;
      }
    }

    if (!confirm(`確定要重置 ${adminUsername} 的密碼嗎？`)) {
      return;
    }

    setLoading(true);
    try {
      const password = await onReset(
        adminId,
        mode === 'manual' ? manualPassword : undefined
      );
      setNewPassword(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重置密碼失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (newPassword) {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setMode('auto');
    setManualPassword('');
    setNewPassword(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full m-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>重置密碼</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!newPassword ? (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
                <p className="font-medium">管理員資訊</p>
                <p className="mt-1">Username: {adminUsername}</p>
              </div>

              <div>
                <Label>重置方式</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reset-mode"
                      checked={mode === 'auto'}
                      onChange={() => setMode('auto')}
                      disabled={loading}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">自動生成隨機密碼（推薦）</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="reset-mode"
                      checked={mode === 'manual'}
                      onChange={() => setMode('manual')}
                      disabled={loading}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">手動輸入新密碼</span>
                  </label>
                </div>
              </div>

              {mode === 'manual' && (
                <div>
                  <Label htmlFor="manual-password">新密碼 *</Label>
                  <Input
                    id="manual-password"
                    type="password"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="至少 8 個字元"
                    disabled={loading}
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">密碼需至少 8 個字元</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? '處理中...' : '重置密碼'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">密碼重置成功</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
                <p className="font-medium">重要提醒</p>
                <p className="mt-1">新密碼僅顯示一次，請立即複製並安全保存</p>
              </div>

              <div>
                <Label htmlFor="new-password">新密碼</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="new-password"
                    type="text"
                    value={newPassword}
                    readOnly
                    className="font-mono bg-gray-50"
                  />
                  <Button
                    type="button"
                    onClick={handleCopy}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        已複製
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        複製
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  className="w-full"
                >
                  完成
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
