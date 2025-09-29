'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  Users,
  FileText,
  Settings,
  BarChart,
  DollarSign,
  UserPlus,
  Activity,
  ArrowUpRight,
  // ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useEffect, useState } from 'react';

// 數字動畫 hook
function useAnimatedValue(end: number, duration: number = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setValue(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return value;
}

export default function HomePage() {
  // 模擬數據 - 實際應從 API 獲取
  const todayActiveUsers = useAnimatedValue(128, 800);
  const todayArticles = useAnimatedValue(42, 900);
  const todayTransactions = useAnimatedValue(1234, 1000);
  const systemUptime = 99.9;

  const dashboardCards = [
    {
      title: '經濟系統配置',
      description: '管理金幣定價、獎勵和促銷活動',
      href: '/dashboard/economy',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      hoverBorder: 'hover:border-yellow-400'
    },
    {
      title: '用戶管理',
      description: '查看和管理平台用戶',
      href: '/dashboard/users',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400'
    },
    {
      title: '內容管理',
      description: '審核和管理用戶發布的內容',
      href: '/dashboard/content',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverBorder: 'hover:border-green-400'
    },
    {
      title: '數據分析',
      description: '平台數據統計和分析',
      href: '/dashboard/analytics',
      icon: BarChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBorder: 'hover:border-purple-400'
    },
    {
      title: '邀請系統',
      description: '管理邀請碼和獎勵',
      href: '/dashboard/invites',
      icon: UserPlus,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      hoverBorder: 'hover:border-pink-400'
    },
    {
      title: '系統監控',
      description: '查看系統狀態和性能',
      href: '/dashboard/monitoring',
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverBorder: 'hover:border-red-400'
    },
    {
      title: 'AI 配置',
      description: '管理 AI 分析模型設定',
      href: '/dashboard/ai-config',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      hoverBorder: 'hover:border-indigo-400'
    },
    {
      title: '系統設定',
      description: '全局系統配置和設定',
      href: '/dashboard/settings',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      hoverBorder: 'hover:border-gray-400'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'user', message: '用戶 #12345 發布了新文章', time: '5 分鐘前' },
    { id: 2, type: 'report', message: '收到文章檢舉 #67890', time: '15 分鐘前' },
    { id: 3, type: 'transaction', message: '完成金幣交易 ¥299', time: '1 小時前' },
    { id: 4, type: 'system', message: '自動備份完成', time: '2 小時前' },
  ];

  const systemNotifications = [
    { id: 1, type: 'success', message: '資料庫備份成功', icon: CheckCircle2 },
    { id: 2, type: 'info', message: '系統更新可用 (v2.1.0)', icon: TrendingUp },
    { id: 3, type: 'warning', message: 'API 使用量接近限制', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* 頁面標題區塊 */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            管理控制台
          </h1>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Clock className="h-4 w-4" />
            <p>歡迎回來，管理員 • 最後登入時間：今天 09:30</p>
          </div>
        </div>

        {/* 關鍵指標卡片區 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-[var(--border)] bg-[var(--surface)] hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--text-secondary)]">今日活躍用戶</p>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-[var(--foreground)]">{todayActiveUsers.toLocaleString()}</p>
                <span className="flex items-center text-sm text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  12.5%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--surface)] hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--text-secondary)]">今日新增文章</p>
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-[var(--foreground)]">{todayArticles.toLocaleString()}</p>
                <span className="flex items-center text-sm text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  8.3%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--surface)] hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--text-secondary)]">今日金幣交易</p>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-[var(--foreground)]">{todayTransactions.toLocaleString()}</p>
                <span className="flex items-center text-sm text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  15.2%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--surface)] hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--text-secondary)]">系統狀態</p>
                <Activity className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-green-600">正常</p>
                <span className="text-sm text-[var(--text-secondary)]">
                  {systemUptime}% 在線率
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 功能模組區 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">核心功能</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href}>
                  <Card
                    className={`
                      group relative overflow-hidden h-full
                      border-[var(--border)] bg-[var(--surface)]
                      hover:shadow-xl hover:-translate-y-1
                      transition-all duration-300 cursor-pointer
                      animate-fade-in
                    `}
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <div className={`absolute inset-0 ${card.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-lg ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-[var(--foreground)] mb-2">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-[var(--text-secondary)]">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 快速操作區 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 最近活動 */}
          <Card className="border-[var(--border)] bg-[var(--surface)] animate-fade-in" style={{ animationDelay: '1.3s' }}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--foreground)]">最近活動</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      <p className="text-sm text-[var(--foreground)]">{activity.message}</p>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{activity.time}</p>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/activities" className="block mt-4">
                <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  查看所有活動 →
                </button>
              </Link>
            </CardContent>
          </Card>

          {/* 系統通知 */}
          <Card className="border-[var(--border)] bg-[var(--surface)] animate-fade-in" style={{ animationDelay: '1.4s' }}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--foreground)]">系統通知</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemNotifications.map((notification) => {
                  const Icon = notification.icon;
                  const colorClass = notification.type === 'success' ? 'text-green-600' :
                                    notification.type === 'warning' ? 'text-yellow-600' : 'text-blue-600';
                  return (
                    <div key={notification.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-hover)] hover:shadow-sm transition-all">
                      <Icon className={`h-5 w-5 ${colorClass}`} />
                      <p className="text-sm text-[var(--foreground)]">{notification.message}</p>
                    </div>
                  );
                })}
              </div>
              <Link href="/dashboard/notifications" className="block mt-4">
                <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  管理通知設定 →
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}