/**
 * Black Swamp 管理後台路由配置
 * 定義所有管理功能的路由結構
 */

export interface RouteItem {
  path: string;
  title: string;
  description?: string;
  children?: RouteItem[];
}

export const routes: Record<string, RouteItem> = {
  // 根路由
  dashboard: {
    path: '/dashboard',
    title: '儀表板首頁',
    description: '管理控制台總覽'
  },

  // 經濟系統
  economy: {
    path: '/dashboard/economy',
    title: '經濟系統總覽',
    children: [
      {
        path: '/dashboard/economy/coins',
        title: '金幣管理',
        description: '設定金幣匯率、贈送規則'
      },
      {
        path: '/dashboard/economy/packages',
        title: '商品包管理',
        description: '配置金幣商品包定價'
      },
      {
        path: '/dashboard/economy/promotions',
        title: '促銷活動',
        description: '管理限時優惠和折扣'
      },
      {
        path: '/dashboard/economy/transactions',
        title: '交易紀錄',
        description: '查看所有金幣交易歷史'
      }
    ]
  },

  // 用戶管理
  users: {
    path: '/dashboard/users',
    title: '用戶列表',
    children: [
      {
        path: '/dashboard/users/:id',
        title: '用戶詳情',
        description: '查看個別用戶資訊'
      },
      {
        path: '/dashboard/users/banned',
        title: '封禁用戶',
        description: '管理被封禁的帳號'
      },
      {
        path: '/dashboard/users/reports',
        title: '用戶檢舉',
        description: '處理用戶檢舉案件'
      }
    ]
  },

  // 內容管理
  content: {
    path: '/dashboard/content',
    title: '內容總覽',
    children: [
      {
        path: '/dashboard/content/articles',
        title: '文章管理',
        description: '瀏覽和管理所有文章'
      },
      {
        path: '/dashboard/content/moderation',
        title: '內容審核',
        description: 'AI 標記的待審核內容'
      },
      {
        path: '/dashboard/content/reported',
        title: '被檢舉內容',
        description: '處理用戶檢舉的內容'
      }
    ]
  },

  // 數據分析
  analytics: {
    path: '/dashboard/analytics',
    title: '數據總覽',
    children: [
      {
        path: '/dashboard/analytics/users',
        title: '用戶分析',
        description: '用戶成長、活躍度分析'
      },
      {
        path: '/dashboard/analytics/engagement',
        title: '互動分析',
        description: '文章互動、反應統計'
      },
      {
        path: '/dashboard/analytics/revenue',
        title: '收入分析',
        description: '金幣銷售收入報表'
      }
    ]
  },

  // 邀請系統
  invites: {
    path: '/dashboard/invites',
    title: '邀請總覽',
    children: [
      {
        path: '/dashboard/invites/codes',
        title: '邀請碼管理',
        description: '生成和管理邀請碼'
      },
      {
        path: '/dashboard/invites/rewards',
        title: '獎勵配置',
        description: '設定邀請獎勵規則'
      },
      {
        path: '/dashboard/invites/statistics',
        title: '邀請統計',
        description: '查看邀請成效分析'
      }
    ]
  },

  // 系統監控
  monitoring: {
    path: '/dashboard/monitoring',
    title: '監控總覽',
    children: [
      {
        path: '/dashboard/monitoring/performance',
        title: '性能監控',
        description: 'API 回應時間、系統負載'
      },
      {
        path: '/dashboard/monitoring/errors',
        title: '錯誤日誌',
        description: '系統錯誤和異常紀錄'
      },
      {
        path: '/dashboard/monitoring/alerts',
        title: '警報設定',
        description: '配置監控警報規則'
      }
    ]
  },

  // AI 配置
  aiConfig: {
    path: '/dashboard/ai-config',
    title: 'AI 設定總覽',
    children: [
      {
        path: '/dashboard/ai-config/models',
        title: '模型管理',
        description: 'AI 模型版本和參數'
      },
      {
        path: '/dashboard/ai-config/rules',
        title: '審核規則',
        description: '內容審核規則配置'
      },
      {
        path: '/dashboard/ai-config/training',
        title: '訓練數據',
        description: '管理模型訓練數據集'
      }
    ]
  },

  // 系統設定
  settings: {
    path: '/dashboard/settings',
    title: '系統設定',
    children: [
      {
        path: '/dashboard/settings/general',
        title: '一般設定',
        description: '平台基本配置'
      },
      {
        path: '/dashboard/settings/security',
        title: '安全設定',
        description: '安全策略和權限管理'
      },
      {
        path: '/dashboard/settings/backup',
        title: '備份管理',
        description: '資料備份和還原'
      },
      {
        path: '/dashboard/settings/logs',
        title: '系統日誌',
        description: '查看系統操作日誌'
      }
    ]
  }
};

// 取得所有路由的平面列表
export function getAllRoutes(): RouteItem[] {
  const allRoutes: RouteItem[] = [];

  Object.values(routes).forEach(route => {
    allRoutes.push(route);
    if (route.children) {
      allRoutes.push(...route.children);
    }
  });

  return allRoutes;
}

// 根據路徑取得路由資訊
export function getRouteByPath(path: string): RouteItem | undefined {
  return getAllRoutes().find(route => route.path === path);
}

// 取得麵包屑導航
export function getBreadcrumbs(path: string): RouteItem[] {
  const breadcrumbs: RouteItem[] = [];
  const segments = path.split('/').filter(Boolean);

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const route = getRouteByPath(currentPath);
    if (route) {
      breadcrumbs.push(route);
    }
  });

  return breadcrumbs;
}