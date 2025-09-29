'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart3,
  Home,
  Shield,
  Users,
  Clock,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileText,
  Settings,
  UserPlus,
  Activity,
  TrendingUp
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  current: boolean;
  badge?: string | number;
  subItems?: {
    name: string;
    href: string;
    badge?: string | number;
  }[];
}

const navigation: NavigationItem[] = [
  {
    name: '儀表板',
    href: '/dashboard',
    icon: Home,
    current: false,
  },
  {
    name: '經濟系統',
    href: '/dashboard/economy',
    icon: DollarSign,
    current: false,
  },
  {
    name: '邀請審核',
    href: '/dashboard/reviews',
    icon: Clock,
    current: false,
    // badge 數量應該從 API 動態獲取
    subItems: [
      {
        name: '待審核',
        href: '/dashboard/reviews?status=pending',
      },
      {
        name: '高風險',
        href: '/dashboard/reviews?fraud_score=high',
      },
      {
        name: '已批准',
        href: '/dashboard/reviews?status=approved',
      },
      {
        name: '已拒絕',
        href: '/dashboard/reviews?status=rejected',
      }
    ]
  },
  {
    name: '用戶管理',
    href: '/dashboard/users',
    icon: Users,
    current: false,
  },
  {
    name: '內容管理',
    href: '/dashboard/content',
    icon: FileText,
    current: false,
  },
  {
    name: '邀請系統',
    href: '/dashboard/invites',
    icon: UserPlus,
    current: false,
  },
  {
    name: '封鎖管理',
    href: '/dashboard/blocks',
    icon: Shield,
    current: false,
  },
  {
    name: '統計報告',
    href: '/dashboard/stats',
    icon: BarChart3,
    current: false,
  },
  {
    name: '數據分析',
    href: '/dashboard/analytics',
    icon: BarChart3,
    current: false,
  },
  {
    name: '系統監控',
    href: '/dashboard/monitoring',
    icon: Activity,
    current: false,
  },
  {
    name: 'AI 配置',
    href: '/dashboard/ai-config',
    icon: TrendingUp,
    current: false,
  },
  {
    name: '系統設定',
    href: '/dashboard/settings',
    icon: Settings,
    current: false,
  },
]

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['邀請審核'])

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  // 檢查當前路徑是否匹配
  const isCurrentPath = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href.split('?')[0])
  }

  return (
    <div className={`flex flex-col w-64 ${className}`}>
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">
                Black Swamp
              </h1>
              <p className="text-xs text-gray-500">管理控制台</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isExpanded = expandedItems.includes(item.name)
              const isCurrent = isCurrentPath(item.href)
              
              return (
                <div key={item.name}>
                  {item.subItems ? (
                    // 有子選單的項目
                    <>
                      <button
                        onClick={() => toggleExpand(item.name)}
                        className={`
                          w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                          ${isCurrent
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon
                          className={`
                            mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                            ${isCurrent ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                          `}
                        />
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.badge && (
                          <span className={`
                            mx-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full
                            ${isCurrent 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-red-100 text-red-600'
                            }
                          `}>
                            {item.badge}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      
                      {/* 子選單 */}
                      {isExpanded && (
                        <div className="ml-10 mt-1 space-y-1">
                          {item.subItems.map((subItem) => {
                            const isSubCurrent = pathname === subItem.href
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`
                                  group flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200
                                  ${isSubCurrent
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }
                                `}
                              >
                                <span className="flex-1">{subItem.name}</span>
                                {subItem.badge && (
                                  <span className={`
                                    inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full
                                    ${isSubCurrent 
                                      ? 'bg-blue-100 text-blue-600' 
                                      : subItem.name === '高風險' 
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-gray-100 text-gray-600'
                                    }
                                  `}>
                                    {subItem.badge}
                                  </span>
                                )}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    // 沒有子選單的項目
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                        ${isCurrent
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon
                        className={`
                          mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                          ${isCurrent ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                        `}
                      />
                      {item.name}
                      {item.badge && (
                        <span className={`
                          ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full
                          ${isCurrent 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* 底部狀態指示器 */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
            <p className="ml-2 text-xs text-gray-500">
              系統運行正常
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}