'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Settings,
  Zap,
  Shield,
  BarChart3,
  Eye,
  Save,
  RotateCcw,
  TestTube,
  Activity,
  Filter,
  Globe
} from 'lucide-react';

// 模擬數據接口
interface AIModel {
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

interface AIConfig {
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

export default function AIConfigPage() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<{
    success: boolean;
    response_time: number;
    result: {
      sentiment: string;
      confidence: number;
      toxicity_score: number;
      categories: string[];
      summary: string;
    };
  } | null>(null);

  // 模擬數據加載
  useEffect(() => {
    const loadAIConfig = async () => {
      setLoading(true);

      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockConfig: AIConfig = {
        models: [
          {
            id: '1',
            name: 'GPT-4',
            provider: 'OpenAI',
            type: 'sentiment',
            api_endpoint: 'https://api.openai.com/v1/chat/completions',
            api_key: 'sk-***************',
            enabled: true,
            rate_limit: 60,
            timeout: 30000,
            cost_per_request: 0.03,
            usage_stats: {
              total_requests: 12456,
              successful_requests: 12234,
              failed_requests: 222,
              avg_response_time: 1250
            }
          },
          {
            id: '2',
            name: 'Claude-3',
            provider: 'Anthropic',
            type: 'content_analysis',
            api_endpoint: 'https://api.anthropic.com/v1/messages',
            api_key: 'sk-ant-***************',
            enabled: true,
            rate_limit: 50,
            timeout: 25000,
            cost_per_request: 0.025,
            usage_stats: {
              total_requests: 8976,
              successful_requests: 8856,
              failed_requests: 120,
              avg_response_time: 980
            }
          },
          {
            id: '3',
            name: 'Gemini Pro',
            provider: 'Google',
            type: 'moderation',
            api_endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro',
            api_key: 'AIza***************',
            enabled: false,
            rate_limit: 40,
            timeout: 20000,
            cost_per_request: 0.02,
            usage_stats: {
              total_requests: 3456,
              successful_requests: 3401,
              failed_requests: 55,
              avg_response_time: 750
            }
          },
          {
            id: '4',
            name: 'Azure Translator',
            provider: 'Microsoft',
            type: 'translation',
            api_endpoint: 'https://api.cognitive.microsofttranslator.com/translate',
            api_key: '***************',
            enabled: true,
            rate_limit: 100,
            timeout: 15000,
            cost_per_request: 0.01,
            usage_stats: {
              total_requests: 5678,
              successful_requests: 5634,
              failed_requests: 44,
              avg_response_time: 450
            }
          }
        ],
        analysis_settings: {
          auto_moderate: true,
          sentiment_threshold: 0.7,
          toxicity_threshold: 0.8,
          min_confidence: 0.6,
          batch_size: 10,
          retry_attempts: 3
        },
        content_filters: {
          enable_nsfw_detection: true,
          enable_spam_detection: true,
          enable_hate_speech_detection: true,
          enable_self_harm_detection: true,
          custom_keywords: ['禁用詞1', '禁用詞2', '禁用詞3']
        },
        monitoring: {
          log_all_requests: true,
          alert_on_failures: true,
          performance_tracking: true,
          cost_tracking: true
        }
      };

      setConfig(mockConfig);
      setLoading(false);
    };

    loadAIConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      // 模擬 API 請求
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ type: 'success', text: 'AI 配置已更新成功' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: '更新配置失敗' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('確定要重設為預設值嗎？')) return;

    try {
      setSaving(true);
      // 模擬重設
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: '已重設為預設值' });
    } catch {
      setMessage({ type: 'error', text: '重設失敗' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestModel = async (modelId: string) => {
    if (!testInput.trim()) {
      setMessage({ type: 'error', text: '請輸入測試內容' });
      return;
    }

    try {
      setTesting(modelId);
      // 模擬 API 測試
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult = {
        success: true,
        response_time: Math.floor(Math.random() * 2000) + 500,
        result: {
          sentiment: 'negative',
          confidence: 0.85,
          toxicity_score: 0.3,
          categories: ['stress', 'work'],
          summary: '用戶表達了工作壓力和焦慮情緒'
        }
      };

      setTestResults(mockResult);
      setMessage({ type: 'success', text: '測試完成' });
    } catch {
      setMessage({ type: 'error', text: '測試失敗' });
    } finally {
      setTesting(null);
    }
  };

  const updateModelConfig = (modelId: string, field: string, value: string | number | boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      models: config.models.map(model =>
        model.id === modelId
          ? { ...model, [field]: value }
          : model
      )
    });
  };

  const updateAnalysisSettings = (field: string, value: string | number | boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      analysis_settings: {
        ...config.analysis_settings,
        [field]: value
      }
    });
  };

  const updateContentFilters = (field: string, value: string | boolean | string[]) => {
    if (!config) return;
    setConfig({
      ...config,
      content_filters: {
        ...config.content_filters,
        [field]: value
      }
    });
  };

  const updateMonitoring = (field: string, value: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      monitoring: {
        ...config.monitoring,
        [field]: value
      }
    });
  };

  const getModelTypeText = (type: string) => {
    switch (type) {
      case 'sentiment': return '情感分析';
      case 'content_analysis': return '內容分析';
      case 'moderation': return '內容審核';
      case 'translation': return '翻譯服務';
      default: return '未知';
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'sentiment': return <BarChart3 className="h-4 w-4" />;
      case 'content_analysis': return <Eye className="h-4 w-4" />;
      case 'moderation': return <Shield className="h-4 w-4" />;
      case 'translation': return <Globe className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const formatSuccessRate = (stats: { total_requests: number; successful_requests: number }) => {
    if (stats.total_requests === 0) return '0%';
    return ((stats.successful_requests / stats.total_requests) * 100).toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!config) {
    return <div>無法載入 AI 配置</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">AI 配置</h1>
          <p className="text-[var(--text-secondary)] mt-2">管理 AI 分析模型設定</p>
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
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="models">AI 模型</TabsTrigger>
          <TabsTrigger value="analysis">分析設定</TabsTrigger>
          <TabsTrigger value="filters">內容篩選</TabsTrigger>
          <TabsTrigger value="monitoring">監控設定</TabsTrigger>
          <TabsTrigger value="testing">模型測試</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {config.models.map((model) => (
              <Card key={model.id} className="border-[var(--border)] bg-[var(--surface)]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getModelTypeIcon(model.type)}
                      {model.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        model.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {model.enabled ? '啟用' : '停用'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={model.enabled}
                          onChange={(e) => updateModelConfig(model.id, 'enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {model.provider} • {getModelTypeText(model.type)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>API 端點</Label>
                      <Input
                        value={model.api_endpoint}
                        onChange={(e) => updateModelConfig(model.id, 'api_endpoint', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>API 金鑰</Label>
                      <Input
                        type="password"
                        value={model.api_key}
                        onChange={(e) => updateModelConfig(model.id, 'api_key', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>速率限制 (/分鐘)</Label>
                      <Input
                        type="number"
                        value={model.rate_limit}
                        onChange={(e) => updateModelConfig(model.id, 'rate_limit', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>超時時間 (ms)</Label>
                      <Input
                        type="number"
                        value={model.timeout}
                        onChange={(e) => updateModelConfig(model.id, 'timeout', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>單次成本 ($)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        value={model.cost_per_request}
                        onChange={(e) => updateModelConfig(model.id, 'cost_per_request', parseFloat(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border)]">
                    <h4 className="font-medium mb-3">使用統計</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--text-secondary)]">總請求數：</span>
                        <span className="font-medium">{model.usage_stats.total_requests.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)]">成功率：</span>
                        <span className={`font-medium ${
                          parseFloat(formatSuccessRate(model.usage_stats)) > 95 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {formatSuccessRate(model.usage_stats)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)]">平均回應時間：</span>
                        <span className="font-medium">{model.usage_stats.avg_response_time}ms</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)]">失敗次數：</span>
                        <span className="font-medium text-red-600">{model.usage_stats.failed_requests}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                分析設定
              </CardTitle>
              <CardDescription>配置 AI 分析的各項參數</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="auto-moderate"
                    checked={config.analysis_settings.auto_moderate}
                    onChange={(e) => updateAnalysisSettings('auto_moderate', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="auto-moderate" className="font-medium">啟用自動審核</Label>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  當內容被標記為有問題時，自動進行審核處理
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>情感分析閾值</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.analysis_settings.sentiment_threshold}
                    onChange={(e) => updateAnalysisSettings('sentiment_threshold', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    當情感負面程度超過此值時觸發警告
                  </p>
                </div>

                <div>
                  <Label>毒性內容閾值</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.analysis_settings.toxicity_threshold}
                    onChange={(e) => updateAnalysisSettings('toxicity_threshold', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    當毒性評分超過此值時自動審核
                  </p>
                </div>

                <div>
                  <Label>最低信心度</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.analysis_settings.min_confidence}
                    onChange={(e) => updateAnalysisSettings('min_confidence', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    AI 分析結果的最低可信度要求
                  </p>
                </div>

                <div>
                  <Label>批次處理大小</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={config.analysis_settings.batch_size}
                    onChange={(e) => updateAnalysisSettings('batch_size', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    每次處理的文章數量
                  </p>
                </div>

                <div>
                  <Label>重試次數</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={config.analysis_settings.retry_attempts}
                    onChange={(e) => updateAnalysisSettings('retry_attempts', parseInt(e.target.value))}
                    className="mt-1"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    API 請求失敗時的重試次數
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                內容篩選設定
              </CardTitle>
              <CardDescription>配置自動內容篩選規則</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="nsfw-detection"
                      checked={config.content_filters.enable_nsfw_detection}
                      onChange={(e) => updateContentFilters('enable_nsfw_detection', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="nsfw-detection">NSFW 內容偵測</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="spam-detection"
                      checked={config.content_filters.enable_spam_detection}
                      onChange={(e) => updateContentFilters('enable_spam_detection', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="spam-detection">垃圾內容偵測</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hate-speech-detection"
                      checked={config.content_filters.enable_hate_speech_detection}
                      onChange={(e) => updateContentFilters('enable_hate_speech_detection', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="hate-speech-detection">仇恨言論偵測</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="self-harm-detection"
                      checked={config.content_filters.enable_self_harm_detection}
                      onChange={(e) => updateContentFilters('enable_self_harm_detection', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="self-harm-detection">自殘內容偵測</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">自定義關鍵詞</Label>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  設定需要特別審核的關鍵詞，每行一個
                </p>
                <textarea
                  className="w-full h-32 px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--foreground)]"
                  value={config.content_filters.custom_keywords.join('\n')}
                  onChange={(e) => updateContentFilters('custom_keywords', e.target.value.split('\n').filter(k => k.trim()))}
                  placeholder="請輸入關鍵詞，每行一個"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  目前有 {config.content_filters.custom_keywords.length} 個自定義關鍵詞
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                監控設定
              </CardTitle>
              <CardDescription>配置 AI 服務的監控和日誌記錄</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div>
                      <Label className="font-medium">記錄所有請求</Label>
                      <p className="text-sm text-[var(--text-secondary)]">
                        保存所有 AI API 請求的詳細日誌
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.monitoring.log_all_requests}
                        onChange={(e) => updateMonitoring('log_all_requests', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div>
                      <Label className="font-medium">失敗告警</Label>
                      <p className="text-sm text-[var(--text-secondary)]">
                        當 API 請求失敗時發送告警通知
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.monitoring.alert_on_failures}
                        onChange={(e) => updateMonitoring('alert_on_failures', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div>
                      <Label className="font-medium">性能追蹤</Label>
                      <p className="text-sm text-[var(--text-secondary)]">
                        監控 API 回應時間和成功率
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.monitoring.performance_tracking}
                        onChange={(e) => updateMonitoring('performance_tracking', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div>
                      <Label className="font-medium">成本追蹤</Label>
                      <p className="text-sm text-[var(--text-secondary)]">
                        追蹤 AI 服務的使用成本
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.monitoring.cost_tracking}
                        onChange={(e) => updateMonitoring('cost_tracking', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                AI 模型測試
              </CardTitle>
              <CardDescription>測試 AI 模型的分析功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="test-input">測試內容</Label>
                <textarea
                  id="test-input"
                  className="w-full h-32 px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--foreground)] mt-1"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="請輸入要測試的文章內容..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.models.filter(m => m.enabled).map((model) => (
                  <div key={model.id} className="p-4 border border-[var(--border)] rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getModelTypeIcon(model.type)}
                        <span className="font-medium">{model.name}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleTestModel(model.id)}
                        disabled={testing === model.id || !testInput.trim()}
                      >
                        {testing === model.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        測試
                      </Button>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {getModelTypeText(model.type)} • {model.provider}
                    </p>
                  </div>
                ))}
              </div>

              {testResults && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">測試結果</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">回應時間：</span>
                          <span className="font-medium">{testResults.response_time}ms</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">狀態：</span>
                          <span className="font-medium text-green-600">成功</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">分析結果：</span>
                        <pre className="mt-1 p-3 bg-white border rounded text-sm overflow-x-auto">
                          {JSON.stringify(testResults.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}