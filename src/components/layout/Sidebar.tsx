'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3, 
  CheckCircle, 
  Home, 
  Shield, 
  Users, 
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: '儀表板',
    href: '/dashboard',
    icon: Home,
    current: false,
  },
  {
    name: '待審核列表',
    href: '/dashboard/reviews',
    icon: Clock,
    current: false,
    badge: '12' // 可以動態更新
  },
  {
    name: '已批准',
    href: '/dashboard/reviews?status=approved',
    icon: CheckCircle,
    current: false,
  },
  {
    name: '已拒絕',
    href: '/dashboard/reviews?status=rejected',
    icon: XCircle,
    current: false,
  },
  {
    name: '高風險',
    href: '/dashboard/reviews?fraud_score=high',
    icon: AlertTriangle,
    current: false,
  },
  {
    name: '統計報告',
    href: '/dashboard/stats',
    icon: BarChart3,
    current: false,
  },
  {
    name: '用戶管理',
    href: '/dashboard/users',
    icon: Users,
    current: false,
  },
  {
    name: '封鎖管理',
    href: '/dashboard/blocks',
    icon: Shield,
    current: false,
  },
]

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()

  // 更新當前頁面狀態
  const navigationWithCurrent = navigation.map(item => ({
    ...item,
    current: pathname === item.href || 
             (item.href !== '/dashboard' && pathname.startsWith(item.href))
  }))

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
            {navigationWithCurrent.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${item.current
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                      ${item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {item.name}
                  {item.badge && (
                    <span className={`
                      ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full
                      ${item.current 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </Link>
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