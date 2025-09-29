/**
 * Environment Indicator Component
 *
 * Displays the current environment in the UI for development and QA environments.
 * This helps developers and testers identify which environment they're working with.
 */

'use client';

import { config } from '@/config/environment';
import { cn } from '@/lib/utils';

interface EnvironmentIndicatorProps {
  className?: string;
}

export function EnvironmentIndicator({ className }: EnvironmentIndicatorProps) {
  // Don't show the indicator if it's disabled or in production
  if (!config.features.showEnvironmentIndicator || config.isProduction) {
    return null;
  }

  const envColors = {
    development: 'bg-blue-500 hover:bg-blue-600',
    qa: 'bg-orange-500 hover:bg-orange-600',
    production: 'bg-red-500 hover:bg-red-600', // Should not show, but just in case
  };

  const envLabels = {
    development: 'DEV',
    qa: 'QA',
    production: 'PROD',
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 px-3 py-1 rounded-md text-white text-sm font-medium shadow-lg transition-colors',
        envColors[config.env],
        className
      )}
      title={`Environment: ${config.env} | API: ${config.apiUrl}`}
    >
      {envLabels[config.env]}
    </div>
  );
}

/**
 * Environment Banner Component
 *
 * A more prominent banner for displaying environment information.
 * Useful for QA environments where it's important to be clear about the environment.
 */

interface EnvironmentBannerProps {
  className?: string;
}

export function EnvironmentBanner({ className }: EnvironmentBannerProps) {
  // Only show in QA environment
  if (!config.isQA || !config.features.showEnvironmentIndicator) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-full bg-orange-100 border-orange-200 border-b px-4 py-2 text-center text-orange-800 text-sm',
        className
      )}
    >
      <span className="font-medium">QA Environment</span>
      {' - '}
      <span className="text-orange-600">
        This is a testing environment. Data may be reset at any time.
      </span>
    </div>
  );
}

/**
 * Development Tools Panel
 *
 * A collapsible panel showing development information and tools.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Settings } from 'lucide-react';

interface DevelopmentToolsProps {
  className?: string;
}

export function DevelopmentTools({ className }: DevelopmentToolsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development environment with debug tools enabled
  if (!config.isDevelopment || !config.features.enableDebugTools) {
    return null;
  }

  const configSummary = {
    Environment: config.env,
    'API URL': config.apiUrl,
    'App Name': config.app.name,
    Version: config.app.version,
    'Log Level': config.logging.level,
    'Mock Data': config.features.enableMockData ? 'Enabled' : 'Disabled',
    'DevTools': config.features.enableReactQueryDevtools ? 'Enabled' : 'Disabled',
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-50 bg-gray-900 text-white rounded-lg shadow-lg max-w-sm',
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-gray-800 rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span>Dev Tools</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 py-2 border-t border-gray-700">
          <div className="space-y-1 text-xs">
            {Object.entries(configSummary).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400">{key}:</span>
                <span className="text-gray-200 ml-2 truncate">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700">
            <button
              onClick={() => {
                console.log('Environment Configuration:', config);
              }}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Log config to console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnvironmentIndicator;