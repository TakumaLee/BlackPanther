/**
 * Environment Configuration Module
 *
 * This module provides a centralized, type-safe way to manage environment variables
 * and configuration across different deployment environments (development, qa, production).
 */

// Environment types
export type Environment = 'development' | 'qa' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Configuration interface
export interface EnvironmentConfig {
  // Environment identification
  env: Environment;
  isDevelopment: boolean;
  isQA: boolean;
  isProduction: boolean;

  // API configuration
  apiUrl: string;

  // Supabase configuration
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string; // Only available server-side
  };

  // Application configuration
  app: {
    name: string;
    version: string;
    adminEmailDomain: string;
  };

  // Feature flags
  features: {
    enableDebugTools: boolean;
    enableMockData: boolean;
    showEnvironmentIndicator: boolean;
    enableReactQueryDevtools: boolean;
    enableSourceMaps: boolean;
  };

  // Logging configuration
  logging: {
    level: LogLevel;
    enableConsoleLogs: boolean;
  };
}

/**
 * Get the current environment from environment variables
 */
function getCurrentEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_APP_ENV as Environment;

  // Fallback logic
  if (env && ['development', 'qa', 'production'].includes(env)) {
    return env;
  }

  // Fallback based on NODE_ENV
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }

  // Default to QA for backward compatibility
  return 'qa';
}

/**
 * Convert string to boolean with proper defaults
 */
function stringToBoolean(value: string | undefined, defaultValue: boolean = false): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Validate required environment variables
 */
function validateRequiredEnvVars() {
  const required = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Create the environment configuration
 */
function createEnvironmentConfig(): EnvironmentConfig {
  // Validate required variables
  validateRequiredEnvVars();

  const env = getCurrentEnvironment();

  const config: EnvironmentConfig = {
    // Environment identification
    env,
    isDevelopment: env === 'development',
    isQA: env === 'qa',
    isProduction: env === 'production',

    // API configuration
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,

    // Supabase configuration
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // Only on server
    },

    // Application configuration
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'Black Swamp Admin',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      adminEmailDomain: process.env.NEXT_PUBLIC_ADMIN_EMAIL_DOMAIN || '@nebulab.com',
    },

    // Feature flags
    features: {
      enableDebugTools: stringToBoolean(process.env.NEXT_PUBLIC_ENABLE_DEBUG_TOOLS, env !== 'production'),
      enableMockData: stringToBoolean(process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA, false),
      showEnvironmentIndicator: stringToBoolean(process.env.NEXT_PUBLIC_SHOW_ENV_INDICATOR, env !== 'production'),
      enableReactQueryDevtools: stringToBoolean(process.env.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS, env !== 'production'),
      enableSourceMaps: stringToBoolean(process.env.NEXT_PUBLIC_ENABLE_SOURCE_MAPS, false),
    },

    // Logging configuration
    logging: {
      level: (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || (env === 'production' ? 'error' : 'info'),
      enableConsoleLogs: stringToBoolean(process.env.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS, env !== 'production'),
    },
  };

  return config;
}

// Create and export the configuration
export const config = createEnvironmentConfig();

/**
 * Helper functions for common environment checks
 */
export const isServer = typeof window === 'undefined';
export const isClient = !isServer;

/**
 * Environment-specific logger
 */
export const logger = {
  debug: (...args: unknown[]) => {
    if (config.logging.enableConsoleLogs && ['debug'].includes(config.logging.level)) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (config.logging.enableConsoleLogs && ['debug', 'info'].includes(config.logging.level)) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (config.logging.enableConsoleLogs && ['debug', 'info', 'warn'].includes(config.logging.level)) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (config.logging.enableConsoleLogs) {
      console.error('[ERROR]', ...args);
    }
  },
};

/**
 * Environment configuration summary for debugging
 */
export function getConfigSummary() {
  return {
    environment: config.env,
    apiUrl: config.apiUrl,
    appName: config.app.name,
    version: config.app.version,
    features: Object.entries(config.features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
    logLevel: config.logging.level,
  };
}

// Log configuration on startup (only in development)
if (config.isDevelopment && config.logging.enableConsoleLogs) {
  logger.info('Environment configuration loaded:', getConfigSummary());
}

export default config;