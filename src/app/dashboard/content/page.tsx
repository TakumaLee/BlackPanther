'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  MessageSquare,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// 模擬數據接口
interface Article {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'reported' | 'deleted' | 'expired';
  reactions_count: number;
  comments_count: number;
  reports_count: number;
  ai_analysis?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    risk_score: number;
    keywords: string[];
  };
}

interface ContentFilters {
  search: string;
  status: string;
  date_from: string;
  date_to: string;
  risk_level: string;
}

export default function ContentPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ContentFilters>({
    search: '',
    status: '',
    date_from: '',
    date_to: '',
    risk_level: ''
  });
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 模擬數據
  useEffect(() => {
    const mockArticles: Article[] = [
      {
        id: '1',
        title: '今天心情很沮喪...',
        content: '工作壓力很大，感覺快要撐不下去了。希望能有人理解我的感受。',
        author_id: 'user1',
        author_name: '匿名用戶#1234',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        status: 'active',
        reactions_count: 15,
        comments_count: 8,
        reports_count: 0,
        ai_analysis: {
          sentiment: 'negative',
          risk_score: 0.3,
          keywords: ['工作壓力', '沮喪', '支持']
        }
      },
      {
        id: '2',
        title: '分享一些正面能量',
        content: '雖然生活有困難，但我們要保持希望。分享一些讓我開心的事情...',
        author_id: 'user2',
        author_name: '匿名用戶#5678',
        created_at: '2024-01-14T15:20:00Z',
        updated_at: '2024-01-14T15:20:00Z',
        status: 'active',
        reactions_count: 42,
        comments_count: 23,
        reports_count: 0,
        ai_analysis: {
          sentiment: 'positive',
          risk_score: 0.1,
          keywords: ['正面', '希望', '分享']
        }
      },
      {
        id: '3',
        title: '疑似不當內容...',
        content: '這裡包含一些可能不適當的內容...',
        author_id: 'user3',
        author_name: '匿名用戶#9999',
        created_at: '2024-01-13T09:15:00Z',
        updated_at: '2024-01-13T09:15:00Z',
        status: 'reported',
        reactions_count: 3,
        comments_count: 1,
        reports_count: 5,
        ai_analysis: {
          sentiment: 'negative',
          risk_score: 0.8,
          keywords: ['不當', '檢舉', '風險']
        }
      }
    ];

    setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
      setTotalPages(3);
    }, 1000);
  }, [filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'reported': return 'bg-red-100 text-red-800';
      case 'deleted': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '正常';
      case 'reported': return '被檢舉';
      case 'deleted': return '已刪除';
      case 'expired': return '已過期';
      default: return '未知';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 0.7) return '高風險';
    if (score >= 0.4) return '中風險';
    return '低風險';
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('確定要刪除這篇文章嗎？')) return;
    // 實際應該調用 API
    setArticles(prev => prev.filter(article => article.id !== articleId));
  };

  const handleApproveArticle = async (articleId: string) => {
    // 實際應該調用 API
    setArticles(prev => prev.map(article =>
      article.id === articleId
        ? { ...article, status: 'active' as const, reports_count: 0 }
        : article
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">內容管理</h1>
          <p className="text-[var(--text-secondary)] mt-2">審核和管理用戶發布的內容</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-[var(--text-secondary)]">
            共 {articles.length} 篇文章
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">總文章數</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {articles.filter(a => a.status === 'active').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">待審核</p>
                <p className="text-2xl font-bold text-red-600">
                  {articles.filter(a => a.status === 'reported').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">高風險內容</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {articles.filter(a => a.ai_analysis && a.ai_analysis.risk_score >= 0.7).length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">今日新增</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 過濾器 */}
      <Card className="border-[var(--border)] bg-[var(--surface)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            搜尋與篩選
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">搜尋內容</Label>
              <div className="relative mt-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  id="search"
                  placeholder="標題或內容"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">文章狀態</Label>
              <select
                id="status"
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md shadow-sm bg-[var(--surface)] text-[var(--foreground)]"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">全部狀態</option>
                <option value="active">正常</option>
                <option value="reported">被檢舉</option>
                <option value="deleted">已刪除</option>
                <option value="expired">已過期</option>
              </select>
            </div>

            <div>
              <Label htmlFor="risk_level">風險等級</Label>
              <select
                id="risk_level"
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-md shadow-sm bg-[var(--surface)] text-[var(--foreground)]"
                value={filters.risk_level}
                onChange={(e) => setFilters(prev => ({ ...prev, risk_level: e.target.value }))}
              >
                <option value="">全部等級</option>
                <option value="low">低風險</option>
                <option value="medium">中風險</option>
                <option value="high">高風險</option>
              </select>
            </div>

            <div>
              <Label htmlFor="date_from">開始日期</Label>
              <Input
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="date_to">結束日期</Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文章列表 */}
      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="border-[var(--border)] bg-[var(--surface)] hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      {article.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                      {getStatusText(article.status)}
                    </span>
                    {article.ai_analysis && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(article.ai_analysis.risk_score)}`}>
                        {getRiskLevel(article.ai_analysis.risk_score)}
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm mb-2">
                    作者：{article.author_name} • 發布時間：{formatDate(article.created_at)}
                  </p>
                  <p className="text-[var(--foreground)] line-clamp-2">
                    {article.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {article.reactions_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {article.comments_count}
                  </div>
                  {article.reports_count > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      {article.reports_count} 檢舉
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    查看詳情
                  </Button>

                  {article.status === 'reported' && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveArticle(article.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      通過審核
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteArticle(article.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    刪除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 分頁 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--text-secondary)]">
          顯示第 {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, articles.length)} 項，共 {articles.length} 項
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            上一頁
          </Button>

          <span className="text-sm text-[var(--text-secondary)]">
            第 {currentPage} / {totalPages} 頁
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            下一頁
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 文章詳情模態 */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedArticle.title}</CardTitle>
                  <CardDescription>
                    作者：{selectedArticle.author_name} • {formatDate(selectedArticle.created_at)}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedArticle(null)}
                >
                  關閉
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">內容</h4>
                  <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
                    {selectedArticle.content}
                  </p>
                </div>

                {selectedArticle.ai_analysis && (
                  <div>
                    <h4 className="font-medium mb-2">AI 分析結果</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--text-secondary)]">情感傾向：</span>
                        <span className="ml-2 font-medium">
                          {selectedArticle.ai_analysis.sentiment === 'positive' ? '正面' :
                           selectedArticle.ai_analysis.sentiment === 'negative' ? '負面' : '中性'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--text-secondary)]">風險評分：</span>
                        <span className={`ml-2 font-medium ${getRiskColor(selectedArticle.ai_analysis.risk_score)}`}>
                          {(selectedArticle.ai_analysis.risk_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-[var(--text-secondary)]">關鍵詞：</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedArticle.ai_analysis.keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-[var(--surface-hover)] rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  {selectedArticle.status === 'reported' && (
                    <Button
                      onClick={() => {
                        handleApproveArticle(selectedArticle.id);
                        setSelectedArticle(null);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      通過審核
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleDeleteArticle(selectedArticle.id);
                      setSelectedArticle(null);
                    }}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    刪除文章
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}