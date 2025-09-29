'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 使用 auth context 的 login 方法
      await login({ email, password });

      // 登入成功後導航到 dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : '登入失敗，請檢查電子郵件和密碼');
    } finally {
      setLoading(false);
    }
  };

  // 測試用的自動填入功能（開發環境）
  const fillTestCredentials = () => {
    setEmail('admin@blackswamp.com');
    setPassword('Admin@123456');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-6">
        {/* 頁面標題區域 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Black Swamp</h1>
          <p className="text-gray-600">管理控制台</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 border-white/20 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center text-gray-900">管理員登入</CardTitle>
            <CardDescription className="text-center text-gray-600">
              請輸入您的管理員應證資料
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">電子郵件</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="輸入管理員電子郵件"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">密碼</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="輸入密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    登入中...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    登入
                  </>
                )}
              </Button>

              {/* 開發環境提示 */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    開發環境測試帳號
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    onClick={fillTestCredentials}
                  >
                    使用測試帳號 (admin@blackswamp.com)
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* 版權資訊 */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            © 2024 Black Swamp. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            版本 2.1.0 - 安全管理平台
          </p>
        </div>
      </div>
    </div>
  );
}