# Multi-Environment Configuration Guide

This document explains how to use the multi-environment configuration system for the Black Swamp Admin Dashboard.

## 🏗️ Environment Overview

The dashboard supports three environments:

- **Development** (`development`) - Local development with localhost API
- **QA** (`qa`) - Testing environment with QA API server
- **Production** (`production`) - Production environment with production API

## 📁 Configuration Files

### Environment-Specific Files

- `.env.development` - Development environment configuration
- `.env.qa` - QA environment configuration
- `.env.production` - Production environment configuration
- `.env.example` - Template with all available variables and documentation

### Active Configuration

- `.env.local` - Currently active environment (copied from environment-specific files)
- `.env` - Base configuration (currently set to QA for backward compatibility)

## 🚀 Quick Start

### Switching Environments

```bash
# Switch to development environment
npm run env:dev

# Switch to QA environment
npm run env:qa

# Switch to production environment
npm run env:prod

# Check current environment
npm run env:check
```

### Development

```bash
# Start development server with current environment
npm run dev

# Start development server with specific environment
npm run dev:qa      # QA environment
npm run dev:prod    # Production environment
```

### Building

```bash
# Build with current environment
npm run build

# Build with specific environment
npm run build:dev   # Development build
npm run build:qa    # QA build
npm run build:prod  # Production build
```

### Starting Production Server

```bash
# Start with current environment
npm start

# Start with specific environment
npm run start:dev   # Development environment
npm run start:qa    # QA environment
npm run start:prod  # Production environment
```

## ⚙️ Configuration Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_ENV` | Environment identifier | `qa`, `development`, `production` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://black-alligator-qa-646040465533.asia-east1.run.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key (server-side only) | `eyJ...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Application display name | `Black Swamp Admin` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` |
| `NEXT_PUBLIC_ADMIN_EMAIL_DOMAIN` | Allowed admin email domain | `@nebulab.com` |
| `NEXT_PUBLIC_ENABLE_DEBUG_TOOLS` | Enable debug features | `false` in production |
| `NEXT_PUBLIC_ENABLE_MOCK_DATA` | Enable mock data | `false` |
| `NEXT_PUBLIC_SHOW_ENV_INDICATOR` | Show environment indicator | `false` in production |
| `NEXT_PUBLIC_LOG_LEVEL` | Logging level | `error` in production |
| `NEXT_PUBLIC_ENABLE_CONSOLE_LOGS` | Enable console logging | `false` in production |
| `NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS` | Enable React Query DevTools | `false` in production |

## 🎯 Environment Features

### Development Environment

- Mock data enabled for testing
- Debug tools and verbose logging
- Development tools panel
- React Query DevTools
- Environment indicator visible

### QA Environment

- Real API connections
- Environment banner warning
- Debug tools enabled for testing
- Environment indicator visible
- React Query DevTools enabled

### Production Environment

- All debug features disabled
- Minimal logging (errors only)
- No environment indicators
- Optimized for performance

## 🔧 Type-Safe Configuration

The system provides type-safe configuration access through the `config` object:

```typescript
import { config, logger } from '@/config/environment';

// Environment checks
if (config.isDevelopment) {
  // Development-specific code
}

if (config.isQA) {
  // QA-specific code
}

if (config.isProduction) {
  // Production-specific code
}

// API URL
const apiUrl = config.apiUrl;

// Feature flags
if (config.features.enableDebugTools) {
  // Debug tools enabled
}

// Logging
logger.info('This respects log level configuration');
logger.debug('This only shows in development');
logger.error('This always shows');
```

## 🎨 UI Components

### Environment Indicator

Shows current environment in top-right corner (non-production only):

```typescript
import { EnvironmentIndicator } from '@/components/ui/environment-indicator';

// Automatically shows/hides based on environment
<EnvironmentIndicator />
```

### Environment Banner

Shows warning banner for QA environment:

```typescript
import { EnvironmentBanner } from '@/components/ui/environment-indicator';

// Only shows in QA environment
<EnvironmentBanner />
```

### Development Tools Panel

Shows configuration details and tools (development only):

```typescript
import { DevelopmentTools } from '@/components/ui/environment-indicator';

// Only shows in development with debug tools enabled
<DevelopmentTools />
```

## 🧪 Testing Configuration

A test script is provided to verify environment configuration:

```bash
node test-env-config.js
```

This will validate:
- Environment variables are loaded correctly
- API URLs match expected values
- Feature flags are set appropriately
- Backward compatibility is maintained

## 🔄 Migration from Old System

The new system is backward compatible. Existing `.env` files will continue to work, and the system defaults to QA environment if no specific environment is set.

To fully migrate:

1. Copy your existing values to the appropriate environment files
2. Use the new npm scripts for environment management
3. Update any hardcoded environment checks to use the new `config` object

## 🚨 Security Notes

- Never commit real API keys or secrets to version control
- Use environment-specific files for different API keys
- The `SUPABASE_SERVICE_ROLE_KEY` is only available server-side
- Production builds automatically disable debug features

## 📋 Troubleshooting

### Environment Not Switching

If the environment doesn't seem to change:

```bash
# Clean build cache and switch environment
npm run clean
npm run env:qa
npm run build:qa
```

### Missing Environment Variables

Check that all required variables are set in your environment file:

```bash
# Validate configuration
node test-env-config.js
```

### Build Errors

Ensure you're using the correct build command for your target environment:

```bash
# For QA deployment
npm run build:qa

# For production deployment
npm run build:prod
```