'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Users,
  Settings,
  LogOut,
  Home,
  Clock,
  Mail,
  DollarSign,
} from 'lucide-react';
import classNames from 'classnames';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function Sidebar() {
  const pathname = usePathname();

  const navigation: SidebarItem[] = [
    { name: 'Dashboard', href: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Economy', href: '/economy', icon: <DollarSign className="w-5 h-5" /> },
    { name: 'Scheduler', href: '/scheduler', icon: <Clock className="w-5 h-5" /> },
    { name: 'Invites', href: '/invites', icon: <Mail className="w-5 h-5" /> },
    { name: 'Users', href: '/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Analytics', href: '/analytics', icon: <Activity className="w-5 h-5" /> },
    { name: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center bg-gray-800">
        <h1 className="text-xl font-bold text-white">Black Swamp Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={classNames(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
              isActive(item.href)
                ? 'bg-gray-800 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
            {item.badge && (
              <span className="ml-auto inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-red-600 text-white">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="flex flex-shrink-0 border-t border-gray-700 p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs font-medium text-gray-400">admin@blackswamp.com</p>
          </div>
          <button className="ml-auto text-gray-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}