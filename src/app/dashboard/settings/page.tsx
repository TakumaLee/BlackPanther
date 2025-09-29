'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  // Settings,
  Globe,
  Shield,
  Mail,
  Database,
  Bell,
  Save,
  RotateCcw,
  AlertTriangle,
  Download,
  FileText,
  Zap
} from 'lucide-react';

// 模擬數據接口
interface SystemSettings {
  general: {
    site_name: string;
    site_description: string;
    site_url: string;
    admin_email: string;
    timezone: string;
    language: string;
    maintenance_mode: boolean;
  };
  article: {
    default_expiry_hours: number;
    max_content_length: number;
    enable_ai_analysis: boolean;
    auto_moderate: boolean;
    allow_anonymous: boolean;
    require_approval: boolean;
  };
  security: {
    enable_rate_limiting: boolean;
    max_requests_per_minute: number;
    session_timeout_hours: number;
    require_2fa: boolean;
    password_min_length: number;
    enable_ip_blocking: boolean;
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    from_email: string;
    from_name: string;
    enable_ssl: boolean;
  };
  storage: {
    default_provider: string;
    max_file_size_mb: number;
    allowed_file_types: string[];
    auto_backup: boolean;
    backup_frequency_hours: number;
    retention_days: number;
  };
  notifications: {
    enable_push: boolean;
    enable_email: boolean;
    enable_sms: boolean;
    admin_notifications: string[];
    user_notifications: string[];
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  // 模擬數據加載
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);

      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockSettings: SystemSettings = {
        general: {
          site_name: 'Black Swamp',
          site_description: '負面情緒發洩平台',
          site_url: 'https://blackswamp.app',
          admin_email: 'admin@blackswamp.app',
          timezone: 'Asia/Taipei',
          language: 'zh-TW',
          maintenance_mode: false
        },
        article: {
          default_expiry_hours: 24,
          max_content_length: 5000,
          enable_ai_analysis: true,
          auto_moderate: true,
          allow_anonymous: true,
          require_approval: false
        },
        security: {
          enable_rate_limiting: true,
          max_requests_per_minute: 60,
          session_timeout_hours: 24,
          require_2fa: false,
          password_min_length: 8,
          enable_ip_blocking: true
        },
        email: {
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_username: 'noreply@blackswamp.app',
          smtp_password: '****************',
          from_email: 'noreply@blackswamp.app',
          from_name: 'Black Swamp',
          enable_ssl: true
        },
        storage: {
          default_provider: 'aws_s3',
          max_file_size_mb: 10,
          allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          auto_backup: true,
          backup_frequency_hours: 24,
          retention_days: 30
        },
        notifications: {
          enable_push: true,
          enable_email: true,
          enable_sms: false,
          admin_notifications: ['new_reports', 'system_errors', 'high_risk_content'],
          user_notifications: ['article_reactions', 'comment_replies', 'system_updates']
        }
      };

      setSettings(mockSettings);
      setLoading(false);
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      // 模擬 API 請求
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ type: 'success', text: '系統設定已更新成功' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: '更新設定失敗' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('確定要重設為預設值嗎？')) return;

    try {
      setSaving(true);
      // 模擬重設
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: '已重設為預設值' });
    } catch {
      setMessage({ type: 'error', text: '重設失敗' });
    } finally {
      setSaving(false);
    }
  };

  const updateGeneralSettings = (field: string, value: string | boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      general: {
        ...settings.general,
        [field]: value
      }
    });
  };

  const updateArticleSettings = (field: string, value: string | number | boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      article: {
        ...settings.article,
        [field]: value
      }
    });
  };

  const updateSecuritySettings = (field: string, value: string | number | boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [field]: value
      }
    });
  };

  const updateEmailSettings = (field: string, value: string | number | boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        [field]: value
      }
    });
  };

  const updateStorageSettings = (field: string, value: string | number | boolean | string[]) => {
    if (!settings) return;
    setSettings({
      ...settings,
      storage: {
        ...settings.storage,
        [field]: value
      }
    });
  };

  const updateNotificationSettings = (field: string, value: string | boolean | string[]) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [field]: value
      }
    });
  };

  const handleTestEmail = async () => {
    try {
      setMessage({ type: 'success', text: '測試郵件已發送' });
    } catch {
      setMessage({ type: 'error', text: '發送測試郵件失敗' });
    }
  };

  const handleExportSettings = () => {
    if (!settings) return;
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `blackswamp-settings-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleBackupDatabase = async () => {
    if (!confirm('確定要執行資料庫備份嗎？這可能需要幾分鐘時間。')) return;

    try {
      setSaving(true);
      // 模擬備份
      await new Promise(resolve => setTimeout(resolve, 3000));
      setMessage({ type: 'success', text: '資料庫備份已完成' });
    } catch {
      setMessage({ type: 'error', text: '資料庫備份失敗' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return <div>無法載入系統設定</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">系統設定</h1>
          <p className="text-[var(--text-secondary)] mt-2">全局系統配置和設定</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportSettings}
          >
            <Download className="h-4 w-4 mr-2" />
            匯出設定
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            重設預設值
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            儲存變更
          </Button>
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="general">一般設定</TabsTrigger>
          <TabsTrigger value="article">文章設定</TabsTrigger>
          <TabsTrigger value="security">安全設定</TabsTrigger>
          <TabsTrigger value="email">郵件設定</TabsTrigger>
          <TabsTrigger value="storage">儲存設定</TabsTrigger>
          <TabsTrigger value="notifications">通知設定</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                一般設定
              </CardTitle>
              <CardDescription>基本的系統配置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="site-name">網站名稱</Label>
                  <Input
                    id="site-name"
                    value={settings.general.site_name}
                    onChange={(e) => updateGeneralSettings('site_name', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="site-url">網站網址</Label>
                  <Input
                    id="site-url"
                    value={settings.general.site_url}
                    onChange={(e) => updateGeneralSettings('site_url', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="site-description">網站描述</Label>
                  <Input
                    id="site-description"
                    value={settings.general.site_description}
                    onChange={(e) => updateGeneralSettings('site_description', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="admin-email">管理員信箱</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={settings.general.admin_email}
                    onChange={(e) => updateGeneralSettings('admin_email', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="timezone">時區</Label>
                  <select
                    id="timezone"
                    className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--foreground)]"
                    value={settings.general.timezone}
                    onChange={(e) => updateGeneralSettings('timezone', e.target.value)}
                  >
                    <option value="Asia/Taipei">台北 (UTC+8)</option>
                    <option value="Asia/Tokyo">東京 (UTC+9)</option>
                    <option value="Asia/Seoul">首爾 (UTC+9)</option>
                    <option value="UTC">UTC (UTC+0)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="language">預設語言</Label>
                  <select
                    id="language"
                    className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--foreground)]"
                    value={settings.general.language}
                    onChange={(e) => updateGeneralSettings('language', e.target.value)}
                  >
                    <option value="zh-TW">繁體中文</option>
                    <option value="zh-CN">簡體中文</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">維護模式</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      啟用後將顯示維護頁面，只有管理員可以訪問
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.general.maintenance_mode}
                      onChange={(e) => updateGeneralSettings('maintenance_mode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                {settings.general.maintenance_mode && (
                  <Alert className="mt-4 border-red-500">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      維護模式已啟用。一般用戶將無法訪問網站。
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="article" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                文章設定
              </CardTitle>
              <CardDescription>文章發布和管理相關設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="expiry-hours">預設過期時間（小時）</Label>
                  <Input
                    id="expiry-hours"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.article.default_expiry_hours}
                    onChange={(e) => updateArticleSettings('default_expiry_hours', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    文章將在此時間後自動過期並刪除
                  </p>
                </div>

                <div>
                  <Label htmlFor="max-length">最大內容長度</Label>
                  <Input
                    id="max-length"
                    type="number"
                    min="100"
                    max="50000"
                    value={settings.article.max_content_length}
                    onChange={(e) => updateArticleSettings('max_content_length', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    單篇文章的最大字符數
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <Label className="font-medium">啟用 AI 分析</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      對新發布的文章進行自動 AI 分析
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.article.enable_ai_analysis}
                      onChange={(e) => updateArticleSettings('enable_ai_analysis', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <Label className="font-medium">自動審核</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      根據 AI 分析結果自動審核內容
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.article.auto_moderate}
                      onChange={(e) => updateArticleSettings('auto_moderate', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <Label className="font-medium">允許匿名發布</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      允許用戶匿名發布文章
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.article.allow_anonymous}
                      onChange={(e) => updateArticleSettings('allow_anonymous', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <Label className="font-medium">需要審核批准</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      所有文章需要管理員審核後才能公開
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.article.require_approval}
                      onChange={(e) => updateArticleSettings('require_approval', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                安全設定
              </CardTitle>
              <CardDescription>系統安全和訪問控制設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="max-requests">請求速率限制（每分鐘）</Label>
                  <Input
                    id="max-requests"
                    type="number"
                    min="10"
                    max="1000"
                    value={settings.security.max_requests_per_minute}
                    onChange={(e) => updateSecuritySettings('max_requests_per_minute', parseInt(e.target.value))}
                    className="mt-1"
                    disabled={!settings.security.enable_rate_limiting}
                  />
                </div>

                <div>
                  <Label htmlFor="session-timeout">會話超時時間（小時）</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.session_timeout_hours}
                    onChange={(e) => updateSecuritySettings('session_timeout_hours', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password-length">密碼最小長度</Label>
                  <Input
                    id="password-length"
                    type="number"
                    min="6"
                    max="32"
                    value={settings.security.password_min_length}
                    onChange={(e) => updateSecuritySettings('password_min_length', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <Label className="font-medium">啟用速率限制</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      限制用戶在一定時間內的請求次數
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.enable_rate_limiting}
                      onChange={(e) => updateSecuritySettings('enable_rate_limiting', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <Label className="font-medium">要求雙因子認證</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      管理員登入時需要雙因子認證
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.require_2fa}
                      onChange={(e) => updateSecuritySettings('require_2fa', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <Label className="font-medium">啟用 IP 封鎖</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      允許封鎖特定 IP 地址
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.enable_ip_blocking}
                      onChange={(e) => updateSecuritySettings('enable_ip_blocking', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                郵件設定
              </CardTitle>
              <CardDescription>SMTP 郵件服務設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtp-host">SMTP 主機</Label>
                  <Input
                    id="smtp-host"
                    value={settings.email.smtp_host}
                    onChange={(e) => updateEmailSettings('smtp_host', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="smtp-port">SMTP 埠口</Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    value={settings.email.smtp_port}
                    onChange={(e) => updateEmailSettings('smtp_port', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="smtp-username">SMTP 用戶名</Label>
                  <Input
                    id="smtp-username"
                    value={settings.email.smtp_username}
                    onChange={(e) => updateEmailSettings('smtp_username', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="smtp-password">SMTP 密碼</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    value={settings.email.smtp_password}
                    onChange={(e) => updateEmailSettings('smtp_password', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="from-email">發件人信箱</Label>
                  <Input
                    id="from-email"
                    type="email"
                    value={settings.email.from_email}
                    onChange={(e) => updateEmailSettings('from_email', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="from-name">發件人名稱</Label>
                  <Input
                    id="from-name"
                    value={settings.email.from_name}
                    onChange={(e) => updateEmailSettings('from_name', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                <div>
                  <Label className="font-medium">啟用 SSL/TLS</Label>
                  <p className="text-sm text-[var(--text-secondary)]">
                    使用加密連接發送郵件
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email.enable_ssl}
                    onChange={(e) => updateEmailSettings('enable_ssl', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <Button onClick={handleTestEmail} variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  發送測試郵件
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                儲存設定
              </CardTitle>
              <CardDescription>檔案儲存和備份設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="storage-provider">儲存提供商</Label>
                  <select
                    id="storage-provider"
                    className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--foreground)]"
                    value={settings.storage.default_provider}
                    onChange={(e) => updateStorageSettings('default_provider', e.target.value)}
                  >
                    <option value="local">本地儲存</option>
                    <option value="aws_s3">Amazon S3</option>
                    <option value="google_cloud">Google Cloud Storage</option>
                    <option value="azure_blob">Azure Blob Storage</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="max-file-size">最大檔案大小（MB）</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.storage.max_file_size_mb}
                    onChange={(e) => updateStorageSettings('max_file_size_mb', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="backup-frequency">備份頻率（小時）</Label>
                  <Input
                    id="backup-frequency"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.storage.backup_frequency_hours}
                    onChange={(e) => updateStorageSettings('backup_frequency_hours', parseInt(e.target.value))}
                    className="mt-1"
                    disabled={!settings.storage.auto_backup}
                  />
                </div>

                <div>
                  <Label htmlFor="retention-days">備份保留天數</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.storage.retention_days}
                    onChange={(e) => updateStorageSettings('retention_days', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>允許的檔案類型</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'doc', 'docx'].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.storage.allowed_file_types.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateStorageSettings('allowed_file_types', [...settings.storage.allowed_file_types, type]);
                          } else {
                            updateStorageSettings('allowed_file_types', settings.storage.allowed_file_types.filter(t => t !== type));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{type.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                <div>
                  <Label className="font-medium">自動備份</Label>
                  <p className="text-sm text-[var(--text-secondary)]">
                    定期自動備份資料庫和檔案
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.storage.auto_backup}
                    onChange={(e) => updateStorageSettings('auto_backup', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <Button
                  onClick={handleBackupDatabase}
                  variant="outline"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  立即備份資料庫
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                通知設定
              </CardTitle>
              <CardDescription>系統通知和警報設定</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <Label className="font-medium">推播通知</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      啟用瀏覽器推播通知
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.enable_push}
                      onChange={(e) => updateNotificationSettings('enable_push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <Label className="font-medium">電子郵件通知</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      啟用電子郵件通知
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.enable_email}
                      onChange={(e) => updateNotificationSettings('enable_email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                  <div>
                    <Label className="font-medium">簡訊通知</Label>
                    <p className="text-sm text-[var(--text-secondary)]">
                      啟用簡訊通知（需要額外設定）
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.enable_sms}
                      onChange={(e) => updateNotificationSettings('enable_sms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium">管理員通知類型</Label>
                  <div className="mt-3 space-y-2">
                    {[
                      { id: 'new_reports', label: '新的檢舉報告' },
                      { id: 'system_errors', label: '系統錯誤' },
                      { id: 'high_risk_content', label: '高風險內容' },
                      { id: 'server_alerts', label: '伺服器告警' },
                      { id: 'security_events', label: '安全事件' }
                    ].map((notification) => (
                      <label key={notification.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.admin_notifications.includes(notification.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateNotificationSettings('admin_notifications', [...settings.notifications.admin_notifications, notification.id]);
                            } else {
                              updateNotificationSettings('admin_notifications', settings.notifications.admin_notifications.filter(n => n !== notification.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{notification.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">用戶通知類型</Label>
                  <div className="mt-3 space-y-2">
                    {[
                      { id: 'article_reactions', label: '文章反應' },
                      { id: 'comment_replies', label: '留言回覆' },
                      { id: 'system_updates', label: '系統更新' },
                      { id: 'maintenance_notices', label: '維護通知' },
                      { id: 'policy_changes', label: '政策變更' }
                    ].map((notification) => (
                      <label key={notification.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.notifications.user_notifications.includes(notification.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateNotificationSettings('user_notifications', [...settings.notifications.user_notifications, notification.id]);
                            } else {
                              updateNotificationSettings('user_notifications', settings.notifications.user_notifications.filter(n => n !== notification.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{notification.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}