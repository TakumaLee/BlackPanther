'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  TrendingUp,
  Users,
  FileText,
  Settings,
  BarChart,
  DollarSign,
  UserPlus,
  Activity
} from 'lucide-react';

export default function HomePage() {
  const dashboardCards = [
    {
      title: '經濟系統配置',
      description: '管理金幣定價、獎勵和促銷活動',
      href: '/dashboard/economy',
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      title: '用戶管理',
      description: '查看和管理平台用戶',
      href: '/dashboard/users',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: '內容管理',
      description: '審核和管理用戶發布的內容',
      href: '/dashboard/content',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: '數據分析',
      description: '平台數據統計和分析',
      href: '/dashboard/analytics',
      icon: BarChart,
      color: 'text-purple-600'
    },
    {
      title: '邀請系統',
      description: '管理邀請碼和獎勵',
      href: '/dashboard/invites',
      icon: UserPlus,
      color: 'text-pink-600'
    },
    {
      title: '系統監控',
      description: '查看系統狀態和性能',
      href: '/dashboard/monitoring',
      icon: Activity,
      color: 'text-red-600'
    },
    {
      title: 'AI 配置',
      description: '管理 AI 分析模型設定',
      href: '/dashboard/ai-config',
      icon: TrendingUp,
      color: 'text-indigo-600'
    },
    {
      title: '系統設定',
      description: '全局系統配置和設定',
      href: '/dashboard/settings',
      icon: Settings,
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Black Swamp 管理後台</h1>
        <p className="text-gray-600">管理和監控 Black Swamp 平台的各項功能</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${card.color}`} />
                    {card.title}
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">快速統計</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">今日活躍用戶</p>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">今日新增文章</p>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">今日金幣交易</p>
            <p className="text-2xl font-bold">-</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-600">系統狀態</p>
            <p className="text-2xl font-bold text-green-600">正常</p>
          </div>
        </div>
      </div>
    </div>
  );
}