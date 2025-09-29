'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  MessageSquare,
  Heart
} from 'lucide-react';

// 模擬數據接口
interface AnalyticsData {
  overview: {
    total_users: number;
    active_users: number;
    total_articles: number;
    total_revenue: number;
    growth_rates: {
      users: number;
      articles: number;
      revenue: number;
    };
  };
  daily_stats: Array<{
    date: string;
    users: number;
    articles: number;
    revenue: number;
    active_users: number;
  }>;
  user_demographics: {
    by_provider: Record<string, number>;
    by_country: Record<string, number>;
    by_age_group: Record<string, number>;
  };
  content_analytics: {
    sentiment_distribution: Record<string, number>;
    popular_topics: Array<{ topic: string; count: number }>;
    engagement_metrics: {
      avg_reactions_per_article: number;
      avg_comments_per_article: number;
      total_interactions: number;
    };
  };
  revenue_analytics: {
    coin_sales: Array<{ package: string; sales: number; revenue: number }>;
    ai_usage: Array<{ model: string; usage_count: number; revenue: number }>;
    subscription_metrics: {
      active_subscribers: number;
      monthly_revenue: number;
      churn_rate: number;
    };
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  // 模擬數據加載
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);

      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: AnalyticsData = {
        overview: {
          total_users: 12456,
          active_users: 8234,
          total_articles: 45678,
          total_revenue: 234567,
          growth_rates: {
            users: 12.5,
            articles: 8.3,
            revenue: 15.7
          }
        },
        daily_stats: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          users: Math.floor(Math.random() * 100) + 200,
          articles: Math.floor(Math.random() * 50) + 80,
          revenue: Math.floor(Math.random() * 5000) + 8000,
          active_users: Math.floor(Math.random() * 80) + 150
        })).reverse(),
        user_demographics: {
          by_provider: {
            'Google': 6234,
            'Apple': 3456,
            '匿名': 2766
          },
          by_country: {
            '台灣': 5678,
            '日本': 3456,
            '韓國': 2123,
            '其他': 1199
          },
          by_age_group: {
            '18-25': 4567,
            '26-35': 5678,
            '36-45': 1890,
            '45+': 321
          }
        },
        content_analytics: {
          sentiment_distribution: {
            '正面': 3456,
            '中性': 12345,
            '負面': 29877
          },
          popular_topics: [
            { topic: '工作壓力', count: 5678 },
            { topic: '人際關係', count: 4321 },
            { topic: '心理健康', count: 3456 },
            { topic: '生活困擾', count: 2890 },
            { topic: '情感支持', count: 2345 }
          ],
          engagement_metrics: {
            avg_reactions_per_article: 8.5,
            avg_comments_per_article: 3.2,
            total_interactions: 89765
          }
        },
        revenue_analytics: {
          coin_sales: [
            { package: '100 金幣', sales: 1234, revenue: 30000 },
            { package: '500 金幣', sales: 567, revenue: 70000 },
            { package: '1000 金幣', sales: 234, revenue: 56000 },
            { package: '2000 金幣', sales: 123, revenue: 49200 },
            { package: '5000 金幣', sales: 67, revenue: 53600 },
            { package: '10000 金幣', sales: 23, revenue: 23000 }
          ],
          ai_usage: [
            { model: 'GPT-4', usage_count: 5678, revenue: 45424 },
            { model: 'Claude', usage_count: 3456, revenue: 20736 },
            { model: 'Gemini', usage_count: 2345, revenue: 11725 }
          ],
          subscription_metrics: {
            active_subscribers: 567,
            monthly_revenue: 89650,
            churn_rate: 5.8
          }
        }
      };

      setData(mockData);
      setLoading(false);
    };

    loadAnalytics();
  }, [selectedPeriod]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `NT$ ${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div>無法載入數據</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">數據分析</h1>
          <p className="text-[var(--text-secondary)] mt-2">平台數據統計和分析</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)]">時間範圍：</label>
            <select
              className="px-3 py-2 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--foreground)]"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            >
              <option value="7d">最近 7 天</option>
              <option value="30d">最近 30 天</option>
              <option value="90d">最近 90 天</option>
            </select>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            重新整理
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            匯出報表
          </Button>
        </div>
      </div>

      {/* 總覽統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">總用戶數</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {data.overview.total_users.toLocaleString()}
                </p>
                <div className="flex items-center text-sm mt-1">
                  {data.overview.growth_rates.users >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={data.overview.growth_rates.users >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(data.overview.growth_rates.users)}
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">活躍用戶</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {data.overview.active_users.toLocaleString()}
                </p>
                <div className="flex items-center text-sm mt-1">
                  <Activity className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">
                    {((data.overview.active_users / data.overview.total_users) * 100).toFixed(1)}% 活躍率
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">總文章數</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {data.overview.total_articles.toLocaleString()}
                </p>
                <div className="flex items-center text-sm mt-1">
                  {data.overview.growth_rates.articles >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={data.overview.growth_rates.articles >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(data.overview.growth_rates.articles)}
                  </span>
                </div>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">總收入</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {formatCurrency(data.overview.total_revenue)}
                </p>
                <div className="flex items-center text-sm mt-1">
                  {data.overview.growth_rates.revenue >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={data.overview.growth_rates.revenue >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(data.overview.growth_rates.revenue)}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="users">用戶分析</TabsTrigger>
          <TabsTrigger value="content">內容分析</TabsTrigger>
          <TabsTrigger value="revenue">收入分析</TabsTrigger>
          <TabsTrigger value="trends">趨勢分析</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 用戶來源分布 */}
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  登入提供商分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.user_demographics.by_provider).map(([provider, count]) => {
                    const percentage = ((count / data.overview.total_users) * 100).toFixed(1);
                    return (
                      <div key={provider} className="flex items-center justify-between">
                        <span className="text-[var(--foreground)]">{provider}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-[var(--text-secondary)] w-12 text-right">
                            {percentage}%
                          </span>
                          <span className="text-sm font-medium w-16 text-right">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 地區分布 */}
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardHeader>
                <CardTitle>地區分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.user_demographics.by_country).map(([country, count]) => {
                    const percentage = ((count / data.overview.total_users) * 100).toFixed(1);
                    return (
                      <div key={country} className="flex items-center justify-between">
                        <span className="text-[var(--foreground)]">{country}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-[var(--text-secondary)] w-12 text-right">
                            {percentage}%
                          </span>
                          <span className="text-sm font-medium w-16 text-right">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 年齡分布 */}
            <Card className="border-[var(--border)] bg-[var(--surface)] lg:col-span-2">
              <CardHeader>
                <CardTitle>年齡分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(data.user_demographics.by_age_group).map(([ageGroup, count]) => {
                    const percentage = ((count / data.overview.total_users) * 100).toFixed(1);
                    return (
                      <div key={ageGroup} className="text-center">
                        <div className="text-2xl font-bold text-[var(--foreground)]">
                          {count.toLocaleString()}
                        </div>
                        <div className="text-sm text-[var(--text-secondary)]">{ageGroup} 歲</div>
                        <div className="text-xs text-[var(--text-muted)]">{percentage}%</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 情感分析 */}
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  情感分析分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.content_analytics.sentiment_distribution).map(([sentiment, count]) => {
                    const total = Object.values(data.content_analytics.sentiment_distribution).reduce((a, b) => a + b, 0);
                    const percentage = ((count / total) * 100).toFixed(1);
                    const color = sentiment === '正面' ? 'bg-green-600' :
                                 sentiment === '負面' ? 'bg-red-600' : 'bg-yellow-600';
                    return (
                      <div key={sentiment} className="flex items-center justify-between">
                        <span className="text-[var(--foreground)]">{sentiment}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`${color} h-2 rounded-full`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-[var(--text-secondary)] w-12 text-right">
                            {percentage}%
                          </span>
                          <span className="text-sm font-medium w-16 text-right">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 熱門話題 */}
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardHeader>
                <CardTitle>熱門話題</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.content_analytics.popular_topics.map((topic, index) => (
                    <div key={topic.topic} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--text-secondary)] w-4">
                          #{index + 1}
                        </span>
                        <span className="text-[var(--foreground)]">{topic.topic}</span>
                      </div>
                      <span className="text-sm font-medium">{topic.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 互動數據 */}
            <Card className="border-[var(--border)] bg-[var(--surface)] lg:col-span-2">
              <CardHeader>
                <CardTitle>互動數據統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {data.content_analytics.engagement_metrics.avg_reactions_per_article}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">平均每篇反應數</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <MessageSquare className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {data.content_analytics.engagement_metrics.avg_comments_per_article}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">平均每篇留言數</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Activity className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {data.content_analytics.engagement_metrics.total_interactions.toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">總互動次數</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 金幣販售 */}
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  金幣包銷售
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.revenue_analytics.coin_sales.map((sale) => (
                    <div key={sale.package} className="flex items-center justify-between">
                      <span className="text-[var(--foreground)]">{sale.package}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {sale.sales} 次
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {formatCurrency(sale.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI 使用統計 */}
            <Card className="border-[var(--border)] bg-[var(--surface)]">
              <CardHeader>
                <CardTitle>AI 模型使用統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.revenue_analytics.ai_usage.map((model) => (
                    <div key={model.model} className="flex items-center justify-between">
                      <span className="text-[var(--foreground)]">{model.model}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {model.usage_count.toLocaleString()} 次
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {formatCurrency(model.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 訂閱數據 */}
            <Card className="border-[var(--border)] bg-[var(--surface)] lg:col-span-2">
              <CardHeader>
                <CardTitle>訂閱數據</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {data.revenue_analytics.subscription_metrics.active_subscribers.toLocaleString()}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">活躍訂閱用戶</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--foreground)]">
                      {formatCurrency(data.revenue_analytics.subscription_metrics.monthly_revenue)}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">月訂閱收入</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {data.revenue_analytics.subscription_metrics.churn_rate}%
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">流失率</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-[var(--border)] bg-[var(--surface)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                趨勢分析
              </CardTitle>
              <CardDescription>
                基於 {selectedPeriod === '7d' ? '7天' : selectedPeriod === '30d' ? '30天' : '90天'} 的數據趨勢
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">圖表功能開發中</h3>
                <p className="text-[var(--text-secondary)]">
                  此處將顯示用戶增長、文章發布、收入等趨勢圖表
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <div className="font-medium text-[var(--foreground)]">平均日活躍用戶</div>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      {Math.round(data.daily_stats.reduce((sum, day) => sum + day.active_users, 0) / data.daily_stats.length)}
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <div className="font-medium text-[var(--foreground)]">平均日新增文章</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {Math.round(data.daily_stats.reduce((sum, day) => sum + day.articles, 0) / data.daily_stats.length)}
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <div className="font-medium text-[var(--foreground)]">平均日收入</div>
                    <div className="text-2xl font-bold text-yellow-600 mt-1">
                      {formatCurrency(Math.round(data.daily_stats.reduce((sum, day) => sum + day.revenue, 0) / data.daily_stats.length))}
                    </div>
                  </div>
                  <div className="p-4 bg-[var(--surface-hover)] rounded-lg">
                    <div className="font-medium text-[var(--foreground)]">平均日註冊用戶</div>
                    <div className="text-2xl font-bold text-purple-600 mt-1">
                      {Math.round(data.daily_stats.reduce((sum, day) => sum + day.users, 0) / data.daily_stats.length)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}