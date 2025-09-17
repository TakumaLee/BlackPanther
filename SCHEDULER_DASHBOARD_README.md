# Scheduler Dashboard

## 概述

Scheduler Dashboard 是一個用於監控和管理 Black Swamp 分散式定時任務系統的 Web 介面。

## 功能特性

### 📊 即時監控
- **Leader Election 狀態**: 顯示當前 Leader 實例和所有 Scheduler 實例狀態
- **任務執行狀態**: 即時查看任務執行進度和結果
- **WebSocket 連接**: 自動接收任務狀態更新

### 📈 統計分析
- **成功率圖表**: 視覺化各任務的執行成功率
- **執行數量統計**: 查看成功/失敗執行數量
- **執行時間分析**: 平均、最小、最大執行時間

### 🎮 任務控制
- **手動觸發**: 立即執行特定任務
- **暫停/恢復**: 控制任務的執行狀態
- **排程修改**: 更新任務的 Cron 表達式

### 📝 執行歷史
- **詳細記錄**: 查看每次執行的詳細信息
- **錯誤追蹤**: 檢查失敗任務的錯誤信息
- **時間軸視圖**: 按時間順序瀏覽執行記錄

## 安裝與設定

### 1. 安裝依賴

```bash
cd frontend/dashboard
npm install
```

### 2. 環境設定

複製環境變數範本：
```bash
cp .env.local.example .env.local
```

編輯 `.env.local` 設定 API URL：
```env
NEXT_PUBLIC_API_URL=https://black-alligator-646040465533.asia-east1.run.app
NEXT_PUBLIC_AUTH_TOKEN=your_admin_token_here
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

訪問 http://localhost:3000/scheduler

## 頁面結構

```
/scheduler
├── Overview Tab     # 總覽頁面
│   ├── Leader Status
│   ├── Success Rate Chart
│   └── Execution Count Chart
│
├── Tasks Tab        # 任務管理
│   └── Task Cards (可觸發/暫停/恢復)
│
├── History Tab      # 執行歷史
│   └── Execution Table (可展開查看詳情)
│
└── Monitoring Tab   # 系統監控
    ├── Duration Chart
    └── System Metrics
```

## API 端點

Dashboard 使用以下 Admin API 端點：

### 查詢端點
- `GET /api/v1/admin/scheduler/dashboard` - 獲取 Dashboard 總覽資料
- `GET /api/v1/admin/scheduler/jobs` - 獲取所有任務列表
- `GET /api/v1/admin/scheduler/task-executions` - 獲取執行歷史
- `GET /api/v1/admin/scheduler/leader-election` - 獲取 Leader 狀態
- `GET /api/v1/admin/scheduler/statistics` - 獲取統計資料

### 控制端點
- `POST /api/v1/admin/scheduler/tasks/{taskName}/trigger` - 手動觸發任務
- `POST /api/v1/admin/scheduler/tasks/{taskName}/pause` - 暫停任務
- `POST /api/v1/admin/scheduler/tasks/{taskName}/resume` - 恢復任務
- `PUT /api/v1/admin/scheduler/tasks/{taskName}/schedule` - 更新排程

### WebSocket
- `WS /api/v1/admin/scheduler/stream` - 即時事件流

## 資料更新策略

1. **自動更新**
   - WebSocket 連接自動推送即時更新
   - 每 30 秒自動刷新資料

2. **手動更新**
   - 點擊 "Refresh" 按鈕立即更新
   - 任務操作後自動更新相關資料

## 權限要求

- 需要管理員權限才能訪問
- 使用 JWT Token (RS256) 進行身份驗證
- Token 可從環境變數或 localStorage 讀取

## 技術架構

### 前端技術
- **框架**: Next.js 15.5 with TypeScript
- **狀態管理**: TanStack Query (React Query)
- **即時通訊**: Socket.io Client
- **圖表**: Recharts
- **樣式**: Tailwind CSS
- **UI 元件**: Radix UI

### 資料流
```
User Action → API Call → Backend → Database
     ↑                         ↓
WebSocket ← Real-time Events ←
```

## 開發指南

### 新增任務類型

1. 更新 `types/scheduler.ts` 加入新的任務類型
2. 在 `TaskCard.tsx` 中處理新任務的顯示邏輯
3. 更新 API client 支援新的端點

### 自定義圖表

修改 `StatisticsChart.tsx` 來新增圖表類型：
```typescript
type ChartType = 'success-rate' | 'execution-count' | 'duration' | 'your-new-type';
```

### WebSocket 事件

在 `scheduler-socket.ts` 中新增事件處理：
```typescript
socket.on('your_event', (data) => {
  this.handleMessage({ type: 'your_event', payload: data, timestamp: new Date().toISOString() });
});
```

## 故障排除

### WebSocket 連接失敗
- 檢查 API URL 是否正確
- 確認防火牆允許 WebSocket 連接
- 查看瀏覽器控制台錯誤信息

### API 認證失敗
- 確認 AUTH_TOKEN 有效
- 檢查 Token 是否有管理員權限
- 確認 Token 未過期

### 資料未更新
- 檢查網路連接
- 確認 WebSocket 連接狀態
- 手動點擊 Refresh 按鈕

## 部署

### Production Build

```bash
npm run build
npm run start
```

### Docker 部署

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 相關文件

- [SCHEDULER_DASHBOARD_CONTEXT.md](../../black-alligator/SCHEDULER_DASHBOARD_CONTEXT.md) - 系統背景說明
- [distributed_scheduler.py](../../black-alligator/app/core/distributed_scheduler.py) - 後端調度器實作
- [admin_scheduler.py](../../black-alligator/app/api/v1/admin_scheduler.py) - Admin API 實作

## 聯絡與支援

如有問題或需要協助，請聯繫開發團隊。