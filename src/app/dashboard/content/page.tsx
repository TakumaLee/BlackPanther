'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { user: currentUser } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
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
  const [hasNext, setHasNext] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moderateReason, setModerateReason] = useState('');

  // 載入文章數據
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  const fetchArticles = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const response = await adminApi.getArticles({
        page: currentPage,
        limit: 10,
        sort: 'latest',
        filter: (filters.status || 'all') as 'active' | 'all',
        search: filters.search || undefined
      });

      // 將 API 回應轉換為頁面需要的格式
      const transformedArticles: Article[] = response.articles.map((article: Record<string, unknown>) => ({
        id: article.id as string,
        title: (article.title as string) || '無標題',
        content: (article.content as string) || '',
        author_id: article.user_id as string,
        author_name: `匿名用戶#${(article.user_id as string)?.slice(-4) || '0000'}`,
        created_at: article.created_at as string,
        updated_at: (article.updated_at as string) || (article.created_at as string),
        status: article.is_active === false ? 'deleted' :
                article.expires_at && new Date(article.expires_at as string) < new Date() ? 'expired' : 'active',
        reactions_count: (article.reactions_count as number) || 0,
        comments_count: 0, // Comments are deprecated
        reports_count: 0, // TODO: Add reports count when available
        ai_analysis: article.analysis ? {
          sentiment: (((article.analysis as Record<string, unknown>).sentiment_category as string) || 'neutral') as 'positive' | 'negative' | 'neutral',
          risk_score: parseFloat(((article.analysis as Record<string, unknown>).confidence_score as string) || '0') || 0,
          keywords: (article.analysis as Record<string, unknown>).detected_emotions ?
            ((article.analysis as Record<string, unknown>).detected_emotions as string).split(',').map((e: string) => e.trim()) : []
        } : undefined
      }));

      setArticles(transformedArticles);
      setTotal(response.total);
      setHasNext(response.has_next);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError(err instanceof Error ? err.message : '載入文章失敗');
      setArticles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSearchChange = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ContentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteArticle = async (articleId: string, reason?: string) => {
    const deleteReason = reason || prompt('請輸入刪除原因：');
    if (!deleteReason || !deleteReason.trim()) {
      alert('請輸入刪除原因');
      return;
    }

    if (!confirm('確定要刪除這篇文章嗎？此操作無法復原！')) {
      return;
    }

    setDeleting(true);
    try {
      await adminApi.deleteArticleAsAdmin(articleId, deleteReason);
      alert('文章已成功刪除');
      setSelectedArticle(null);
      fetchArticles(); // 重新載入數據
    } catch (err) {
      console.error('Delete failed:', err);
      alert('刪除失敗：' + (err instanceof Error ? err.message : '未知錯誤'));
    } finally {
      setDeleting(false);
    }
  };

  const handleModerateArticle = async (articleId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !moderateReason.trim()) {
      alert('請輸入拒絕原因');
      return;
    }

    if (!confirm(`確定要${action === 'approve' ? '批准' : '拒絕'}這篇文章嗎？`)) {
      return;
    }

    setModerating(true);
    try {
      await adminApi.moderateArticle(articleId, action, moderateReason || undefined);
      alert(`文章已${action === 'approve' ? '批准' : '拒絕'}`);
      setSelectedArticle(null);
      setModerateReason('');
      fetchArticles(); // 重新載入數據
    } catch (err) {
      console.error('Moderate failed:', err);
      alert(`審核失敗：${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setModerating(false);
    }
  };

  const handleApproveArticle = async (articleId: string) => {
    try {
      await adminApi.moderateArticle(articleId, 'approve', '管理員通過審核');
      fetchArticles(); // 重新載入數據
    } catch (err) {
      console.error('Approve failed:', err);
      alert('審核通過失敗：' + (err instanceof Error ? err.message : '未知錯誤'));
    }
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
            共 {total.toLocaleString()} 篇文章
          </div>
          {error && (
            <div className="text-sm text-red-600">
              API 連接異常
            </div>
          )}
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
                <p className="text-2xl font-bold text-green-600">
                  {articles.filter(a => {
                    const today = new Date();
                    const articleDate = new Date(a.created_at);
                    return articleDate.toDateString() === today.toDateString();
                  }).length}
                </p>
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
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                onChange={(e) => handleFilterChange('status', e.target.value)}
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
                onChange={(e) => handleFilterChange('risk_level', e.target.value)}
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
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="date_to">結束日期</Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
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
                    disabled={deleting}
                    className="text-red-600 border-red-600 hover:bg-red-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deleting ? '處理中...' : '刪除'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 分頁 */}
      {total > 10 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-secondary)]">
            顯示第 {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, total)} 項，共 {total.toLocaleString()} 項
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext || loading}
            >
              下一頁
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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

                {/* 審核區域 */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3 text-[var(--foreground)]">文章審核</h4>

                  {/* 拒絕原因輸入框 */}
                  <div className="mb-4">
                    <Label htmlFor="moderateReason">拒絕原因（拒絕時必填）</Label>
                    <textarea
                      id="moderateReason"
                      className="mt-1 w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--surface)] text-[var(--foreground)] min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      value={moderateReason}
                      onChange={(e) => setModerateReason(e.target.value)}
                      placeholder="請輸入拒絕原因..."
                      disabled={moderating}
                    />
                  </div>

                  {/* 審核和刪除按鈕 */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleModerateArticle(selectedArticle.id, 'approve')}
                      disabled={moderating || deleting}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {moderating ? '處理中...' : '批准文章'}
                    </Button>
                    <Button
                      onClick={() => handleModerateArticle(selectedArticle.id, 'reject')}
                      disabled={moderating || deleting}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {moderating ? '處理中...' : '拒絕文章'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteArticle(selectedArticle.id)}
                      disabled={moderating || deleting}
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {deleting ? '刪除中...' : '刪除文章'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}