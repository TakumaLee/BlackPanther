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
  FileText,
  Shield,
  Network,
  UserCog,
  BarChart3,
  AlertTriangle,
  Eye,
  MessageSquare,
  Ban,
  Cpu,
  Cog,
  Brain,
} from 'lucide-react';
import classNames from 'classnames';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export default function Sidebar() {
  const pathname = usePathname();

  const navigationSections: SidebarSection[] = [
    {
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
        { name: 'Economy', href: '/dashboard/economy', icon: <DollarSign className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Review & Moderation',
      items: [
        { name: 'Invite Reviews', href: '/dashboard/reviews', icon: <Eye className="w-5 h-5" /> },
        { name: 'Content', href: '/dashboard/content', icon: <FileText className="w-5 h-5" /> },
        { name: 'Invites', href: '/dashboard/invites', icon: <Mail className="w-5 h-5" /> },
      ]
    },
    {
      title: 'User Management',
      items: [
        { name: 'Users', href: '/dashboard/users', icon: <Users className="w-5 h-5" /> },
        { name: 'Admins', href: '/dashboard/admins', icon: <UserCog className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Security',
      items: [
        { name: 'Blocks', href: '/dashboard/blocks', icon: <Ban className="w-5 h-5" /> },
        { name: 'IP Monitoring', href: '/dashboard/ip-monitoring', icon: <Network className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Statistics', href: '/dashboard/stats', icon: <BarChart3 className="w-5 h-5" /> },
        { name: 'Analytics', href: '/dashboard/analytics', icon: <Activity className="w-5 h-5" /> },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Monitoring', href: '/dashboard/monitoring', icon: <Cpu className="w-5 h-5" /> },
        { name: 'Scheduler', href: '/dashboard/scheduler', icon: <Clock className="w-5 h-5" /> },
        { name: 'AI Config', href: '/dashboard/ai-config', icon: <Brain className="w-5 h-5" /> },
        { name: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
      ]
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    if (href === '/dashboard') {
      return false;
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
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigationSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-4">
            {section.title && (
              <h3 className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
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
            </div>
          </div>
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