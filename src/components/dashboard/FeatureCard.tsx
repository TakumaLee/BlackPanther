'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color?: string
  stats?: string
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  color = 'blue',
  stats
}: FeatureCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      text: 'text-blue-700'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      hover: 'hover:bg-green-100',
      text: 'text-green-700'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      hover: 'hover:bg-purple-100',
      text: 'text-purple-700'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      hover: 'hover:bg-orange-100',
      text: 'text-orange-700'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      hover: 'hover:bg-red-100',
      text: 'text-red-700'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'text-indigo-600',
      hover: 'hover:bg-indigo-100',
      text: 'text-indigo-700'
    },
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      icon: 'text-pink-600',
      hover: 'hover:bg-pink-100',
      text: 'text-pink-700'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      hover: 'hover:bg-gray-100',
      text: 'text-gray-700'
    }
  }

  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue

  return (
    <Link href={href} className="block">
      <div className={`
        p-6 rounded-lg border transition-all duration-200 cursor-pointer
        ${classes.bg} ${classes.border} ${classes.hover}
        hover:shadow-md hover:scale-105 hover:border-opacity-50
      `}>
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg bg-white shadow-sm ${classes.border}`}>
            <Icon className={`h-6 w-6 ${classes.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold ${classes.text} mb-1`}>
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {description}
            </p>
            {stats && (
              <div className={`text-xs font-medium ${classes.text}`}>
                {stats}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}