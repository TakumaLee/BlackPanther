import { getAuthHeaders } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface EconomyConfig {
  ai_analysis_pricing: Record<string, {
    cost: number;
    original_cost?: number;
    is_promotional?: boolean;
    description: string;
  }>;
  daily_signin_rewards: {
    base_reward: number;
    streak_bonuses: Record<string, number>;
  };
  article_extensions: Record<string, number>;
  translation_pricing: Record<string, number>;
  vip_membership: {
    monthly_cost: number;
    yearly_cost: number;
  };
  invite_rewards: {
    inviter: number;
    invitee: number;
  };
  new_user_rewards: {
    signup_bonus: number;
    first_analysis_free: boolean;
  };
}

export async function getEconomyConfig() {
  const response = await fetch(`${API_URL}/api/v1/admin/economy/config`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch economy config');
  }

  return response.json();
}

export async function updateEconomyConfig(config: Partial<EconomyConfig>) {
  const response = await fetch(`${API_URL}/api/v1/admin/economy/config`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error('Failed to update economy config');
  }

  return response.json();
}

export async function resetEconomyConfig() {
  const response = await fetch(`${API_URL}/api/v1/admin/economy/config/reset`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to reset economy config');
  }

  return response.json();
}

export async function previewPricingChanges(model: string, newPrice: number) {
  const params = new URLSearchParams({
    model,
    new_price: newPrice.toString(),
  });

  const response = await fetch(`${API_URL}/api/v1/admin/economy/pricing-preview?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to preview pricing changes');
  }

  return response.json();
}