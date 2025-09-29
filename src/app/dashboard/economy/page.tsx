'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, RotateCcw, TrendingUp, Gift, Star } from 'lucide-react';

interface EconomyConfig {
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

export default function EconomyPage() {
  const { user: currentUser } = useAuth();
  const [config, setConfig] = useState<EconomyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editedConfig, setEditedConfig] = useState<EconomyConfig | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadConfig();
    }
  }, [currentUser]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getEconomyConfig();
      const configData = data as { config: EconomyConfig };
      setConfig(configData.config);
      setEditedConfig(configData.config);
    } catch (err) {
      console.error('Failed to load economy config:', err);
      setError(err instanceof Error ? err.message : '載入配置失敗');
      setMessage({ type: 'error', text: '載入配置失敗' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedConfig) return;

    try {
      setSaving(true);
      const data = await adminApi.updateEconomyConfig(editedConfig as unknown as Record<string, unknown>);
      if (data.config) {
        setConfig(data.config as unknown as EconomyConfig);
      }
      setMessage({ type: 'success', text: data.message || '配置已更新成功' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update economy config:', err);
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '更新配置失敗' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('確定要重設為預設值嗎？')) return;

    try {
      setSaving(true);
      const data = await adminApi.resetEconomyConfig();
      setConfig(data.config);
      setEditedConfig(data.config);
      setMessage({ type: 'success', text: data.message || '已重設為預設值' });
    } catch (err) {
      console.error('Failed to reset economy config:', err);
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '重設失敗' });
    } finally {
      setSaving(false);
    }
  };

  const updateAIPrice = (model: string, field: string, value: string | number) => {
    if (!editedConfig) return;
    setEditedConfig({
      ...editedConfig,
      ai_analysis_pricing: {
        ...editedConfig.ai_analysis_pricing,
        [model]: {
          ...editedConfig.ai_analysis_pricing[model],
          [field]: field === 'cost' || field === 'original_cost' ? parseInt(String(value)) : value
        }
      }
    });
  };

  const updateExtensionPrice = (duration: string, value: string) => {
    if (!editedConfig) return;
    setEditedConfig({
      ...editedConfig,
      article_extensions: {
        ...editedConfig.article_extensions,
        [duration]: parseInt(value)
      }
    });
  };

  const updateSigninReward = (field: string, value: string | number) => {
    if (!editedConfig) return;
    if (field === 'base_reward') {
      setEditedConfig({
        ...editedConfig,
        daily_signin_rewards: {
          ...editedConfig.daily_signin_rewards,
          base_reward: parseInt(String(value))
        }
      });
    } else {
      // Handle streak bonuses
      const [, day] = field.split('_');
      setEditedConfig({
        ...editedConfig,
        daily_signin_rewards: {
          ...editedConfig.daily_signin_rewards,
          streak_bonuses: {
            ...editedConfig.daily_signin_rewards.streak_bonuses,
            [day]: parseInt(String(value))
          }
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">載入經濟系統配置中...</p>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={loadConfig} disabled={loading}>
            重試
          </Button>
        </div>
      </div>
    );
  }

  if (!config || !editedConfig) {
    return <div>無法載入配置</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">經濟系統配置</h1>
          <p className="text-gray-600 mt-2">管理金幣定價、獎勵和促銷活動</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            重設預設值
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            儲存變更
          </Button>
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="ai-analysis" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="ai-analysis">AI 分析</TabsTrigger>
          <TabsTrigger value="signin">簽到獎勵</TabsTrigger>
          <TabsTrigger value="articles">文章功能</TabsTrigger>
          <TabsTrigger value="membership">會員制度</TabsTrigger>
          <TabsTrigger value="rewards">其他獎勵</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI 分析模型定價
              </CardTitle>
              <CardDescription>設定不同 AI 模型的金幣消耗</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(editedConfig.ai_analysis_pricing).map(([model, settings]) => (
                <div key={model} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">{model}</Label>
                    <p className="text-xs text-gray-500">{settings.description}</p>
                  </div>
                  <div>
                    <Label htmlFor={`${model}-cost`}>現行價格</Label>
                    <Input
                      id={`${model}-cost`}
                      type="number"
                      value={settings.cost}
                      onChange={(e) => updateAIPrice(model, 'cost', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {settings.original_cost && (
                    <div>
                      <Label htmlFor={`${model}-original`}>原價</Label>
                      <Input
                        id={`${model}-original`}
                        type="number"
                        value={settings.original_cost}
                        onChange={(e) => updateAIPrice(model, 'original_cost', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                  {settings.is_promotional && (
                    <div className="flex items-center">
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                        推廣中
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                每日簽到獎勵
              </CardTitle>
              <CardDescription>設定簽到基礎獎勵和連續簽到獎勵</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base-reward">基礎獎勵（每日）</Label>
                  <Input
                    id="base-reward"
                    type="number"
                    value={editedConfig.daily_signin_rewards.base_reward}
                    onChange={(e) => updateSigninReward('base_reward', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>連續簽到獎勵</Label>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(editedConfig.daily_signin_rewards.streak_bonuses).map(([day, bonus]) => (
                    day !== 'every_7_after_30' && (
                      <div key={day}>
                        <Label htmlFor={`streak-${day}`} className="text-sm">第 {day} 天</Label>
                        <Input
                          id={`streak-${day}`}
                          type="number"
                          value={bonus}
                          onChange={(e) => updateSigninReward(`streak_${day}`, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )
                  ))}
                  <div>
                    <Label htmlFor="streak-after30" className="text-sm">30天後每7天</Label>
                    <Input
                      id="streak-after30"
                      type="number"
                      value={editedConfig.daily_signin_rewards.streak_bonuses.every_7_after_30}
                      onChange={(e) => updateSigninReward('streak_every_7_after_30', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>文章延長保存價格</CardTitle>
              <CardDescription>設定不同保存時長的金幣消耗</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(editedConfig.article_extensions).map(([duration, price]) => (
                  <div key={duration}>
                    <Label htmlFor={`ext-${duration}`}>
                      {duration.replace('_', ' ').replace('days', '天')}
                    </Label>
                    <Input
                      id={`ext-${duration}`}
                      type="number"
                      value={price}
                      onChange={(e) => updateExtensionPrice(duration, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                VIP 會員價格
              </CardTitle>
              <CardDescription>設定會員訂閱費用</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vip-monthly">月費</Label>
                  <Input
                    id="vip-monthly"
                    type="number"
                    value={editedConfig.vip_membership.monthly_cost}
                    onChange={(e) => setEditedConfig({
                      ...editedConfig,
                      vip_membership: {
                        ...editedConfig.vip_membership,
                        monthly_cost: parseInt(e.target.value)
                      }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vip-yearly">年費</Label>
                  <Input
                    id="vip-yearly"
                    type="number"
                    value={editedConfig.vip_membership.yearly_cost}
                    onChange={(e) => setEditedConfig({
                      ...editedConfig,
                      vip_membership: {
                        ...editedConfig.vip_membership,
                        yearly_cost: parseInt(e.target.value)
                      }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>邀請獎勵</CardTitle>
              <CardDescription>設定邀請系統的金幣獎勵</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invite-inviter">邀請人獎勵</Label>
                  <Input
                    id="invite-inviter"
                    type="number"
                    value={editedConfig.invite_rewards.inviter}
                    onChange={(e) => setEditedConfig({
                      ...editedConfig,
                      invite_rewards: {
                        ...editedConfig.invite_rewards,
                        inviter: parseInt(e.target.value)
                      }
                    })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="invite-invitee">受邀人獎勵</Label>
                  <Input
                    id="invite-invitee"
                    type="number"
                    value={editedConfig.invite_rewards.invitee}
                    onChange={(e) => setEditedConfig({
                      ...editedConfig,
                      invite_rewards: {
                        ...editedConfig.invite_rewards,
                        invitee: parseInt(e.target.value)
                      }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>新用戶獎勵</CardTitle>
              <CardDescription>設定新用戶註冊獎勵</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signup-bonus">註冊獎勵</Label>
                  <Input
                    id="signup-bonus"
                    type="number"
                    value={editedConfig.new_user_rewards.signup_bonus}
                    onChange={(e) => setEditedConfig({
                      ...editedConfig,
                      new_user_rewards: {
                        ...editedConfig.new_user_rewards,
                        signup_bonus: parseInt(e.target.value)
                      }
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}