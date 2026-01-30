/**
 * API Error Handling Utilities
 * Provides specific error messages based on error type
 */

export interface APIError {
  type: 'cors' | 'not_found' | 'unauthorized' | 'server_error' | 'network' | 'timeout' | 'unknown'
  message: string
  originalError?: Error
  statusCode?: number
  userMessage: string
  canRetry: boolean
}

/**
 * Parse error and return structured error information
 */
export function parseAPIError(error: unknown): APIError {
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    // CORS errors
    if (message.includes('cors') || message.includes('cross-origin')) {
      return {
        type: 'cors',
        message: error.message,
        originalError: error,
        userMessage: 'API 連接被阻擋，請聯繫管理員',
        canRetry: false
      }
    }

    // 404 errors
    if (message.includes('404') || message.includes('not found')) {
      return {
        type: 'not_found',
        message: error.message,
        originalError: error,
        statusCode: 404,
        userMessage: 'API 端點不存在',
        canRetry: false
      }
    }

    // 401 errors
    if (message.includes('401') || message.includes('unauthorized') || message.includes('authentication')) {
      return {
        type: 'unauthorized',
        message: error.message,
        originalError: error,
        statusCode: 401,
        userMessage: '登入已過期，請重新登入',
        canRetry: false
      }
    }

    // 500 errors
    if (message.includes('500') || message.includes('internal server')) {
      return {
        type: 'server_error',
        message: error.message,
        originalError: error,
        statusCode: 500,
        userMessage: '伺服器錯誤，請稍後再試',
        canRetry: true
      }
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        type: 'network',
        message: error.message,
        originalError: error,
        userMessage: '網路連線失敗，請檢查網路',
        canRetry: true
      }
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('aborted')) {
      return {
        type: 'timeout',
        message: error.message,
        originalError: error,
        userMessage: '請求超時，請重試',
        canRetry: true
      }
    }
  }

  // Default unknown error
  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : String(error),
    originalError: error instanceof Error ? error : undefined,
    userMessage: '發生未知錯誤，請稍後再試',
    canRetry: true
  }
}

/**
 * Get error icon class based on error type
 */
export function getErrorIconColor(errorType: APIError['type']): string {
  switch (errorType) {
    case 'cors':
    case 'not_found':
      return 'text-orange-600'
    case 'unauthorized':
      return 'text-yellow-600'
    case 'server_error':
    case 'network':
    case 'timeout':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Get background color class for error alert
 */
export function getErrorBgColor(errorType: APIError['type']): string {
  switch (errorType) {
    case 'cors':
    case 'not_found':
      return 'bg-orange-50 border-orange-200 text-orange-800'
    case 'unauthorized':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    case 'server_error':
    case 'network':
    case 'timeout':
      return 'bg-red-50 border-red-200 text-red-800'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800'
  }
}

/**
 * Format error for logging
 */
export function formatErrorForLog(error: APIError): string {
  return `[${error.type.toUpperCase()}] ${error.message}${error.statusCode ? ` (${error.statusCode})` : ''}`
}
