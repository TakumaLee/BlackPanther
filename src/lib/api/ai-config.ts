/**
 * AI Configuration API Client
 * Handles AI model configuration, analysis settings, and content filtering
 */

import { getAuthHeaders } from './auth';
import { buildApiUrl } from './client';

// Type definitions matching backend schemas
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'sentiment' | 'content_analysis' | 'moderation' | 'translation';
  api_endpoint: string;
  api_key: string;
  enabled: boolean;
  rate_limit: number;
  timeout: number;
  cost_per_request: number;
  usage_stats: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    avg_response_time: number;
  };
}

export interface AIConfig {
  models: AIModel[];
  analysis_settings: {
    auto_moderate: boolean;
    sentiment_threshold: number;
    toxicity_threshold: number;
    min_confidence: number;
    batch_size: number;
    retry_attempts: number;
  };
  content_filters: {
    enable_nsfw_detection: boolean;
    enable_spam_detection: boolean;
    enable_hate_speech_detection: boolean;
    enable_self_harm_detection: boolean;
    custom_keywords: string[];
  };
  monitoring: {
    log_all_requests: boolean;
    alert_on_failures: boolean;
    performance_tracking: boolean;
    cost_tracking: boolean;
  };
}

export interface TestModelRequest {
  model_id: string;
  text: string;
}

export interface TestModelResponse {
  success: boolean;
  response_time: number;
  result: {
    sentiment: string;
    confidence: number;
    toxicity_score: number;
    categories: string[];
    summary: string;
  };
}

/**
 * Get AI configuration
 */
export async function getAIConfig(): Promise<AIConfig> {
  const response = await fetch(buildApiUrl('/api/v1/admin/ai-config'), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch AI config: ${response.status}`);
  }

  return response.json();
}

/**
 * Update AI configuration
 */
export async function updateAIConfig(config: Partial<AIConfig>): Promise<{
  success: boolean;
  message: string;
  config: AIConfig;
}> {
  const response = await fetch(buildApiUrl('/api/v1/admin/ai-config'), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update AI config: ${response.status}`);
  }

  return response.json();
}

/**
 * Test an AI model with sample text
 */
export async function testAIModel(modelId: string, text: string): Promise<TestModelResponse> {
  const response = await fetch(buildApiUrl('/api/v1/admin/ai-config/test'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ model_id: modelId, text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to test AI model: ${response.status}`);
  }

  return response.json();
}

/**
 * Reset AI configuration to defaults
 */
export async function resetAIConfig(): Promise<{
  success: boolean;
  message: string;
  config: AIConfig;
}> {
  const response = await fetch(buildApiUrl('/api/v1/admin/ai-config/reset'), {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to reset AI config: ${response.status}`);
  }

  return response.json();
}
