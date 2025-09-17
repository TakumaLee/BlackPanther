# Black Swamp Admin Dashboard

## 概述

Black Swamp 管理儀表板是一個基於 Next.js 的後台管理系統，專門用於管理邀請審核系統。管理員可以通過這個儀表板審核用戶邀請、管理封鎖用戶、查看統計數據等。

## 功能特性

- **身份驗證**: 使用 Supabase Auth 進行管理員身份驗證
- **邀請審核**: 查看、批准或拒絕用戶邀請
- **風險評估**: 顯示詐騙風險評分和相關指標
- **用戶管理**: 查看和管理平台用戶
- **封鎖管理**: 管理被封鎖的用戶和 IP 地址
- **統計儀表板**: 顯示平台關鍵指標和統計數據
- **響應式設計**: 支持桌面和移動設備

## 技術棧

- **Frontend**: Next.js 15, React, TypeScript
- **樣式**: Tailwind CSS
- **身份驗證**: Supabase Auth
- **圖標**: Lucide React
- **日期處理**: date-fns
- **圖表**: Recharts

## 配置設定

### 環境變數

1. 複製範例環境設定檔：
   ```bash
   cp .env.example .env.local
   ```

2. 更新 `.env.local` 中的值：
   - `NEXT_PUBLIC_SUPABASE_URL`: 您的 Supabase 專案 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key（管理員操作需要）
   - `NEXT_PUBLIC_API_URL`: 後端 API URL
     - 正式環境：`https://black-alligator-646040465533.asia-east1.run.app`
     - 本地開發：`http://localhost:8000`

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境配置

複製 `.env.local` 並填入正確的環境變數：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 管理員權限設置

在 Supabase 中創建 `admin_users` 表：

```sql
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 添加管理員
INSERT INTO admin_users (user_id) VALUES ('your-user-id');
```

### 4. 運行開發服務器

```bash
npm run dev
```

訪問 http://localhost:3000 進入管理後台。

## 目錄結構

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # 儀表板頁面
│   │   ├── reviews/        # 審核管理
│   │   ├── blocks/         # 封鎖管理
│   │   └── layout.tsx      # 儀表板佈局
│   ├── page.tsx            # 登入頁面
│   └── layout.tsx          # 根佈局
├── components/             # React 組件
│   ├── layout/             # 佈局組件
│   └── reviews/            # 審核相關組件
├── lib/                    # 工具庫
│   ├── supabase/           # Supabase 配置
│   └── api/                # API 客戶端
└── types/                  # TypeScript 類型定義
```

## 主要功能

### 身份驗證
- Google OAuth 登入
- 管理員權限檢查
- 自動登出非管理員用戶

### 審核管理
- 查看待審核邀請列表
- 詳細的風險評估信息
- 批准/拒絕操作
- 批量處理功能

### 統計儀表板
- 關鍵指標展示
- 實時數據更新
- 快速操作入口

### 封鎖管理
- 用戶封鎖列表
- 添加新封鎖
- 解除封鎖操作

## API 整合

與後端 API 的主要端點：

- `GET /api/v1/admin/stats` - 統計數據
- `GET /api/v1/admin/reviews` - 審核列表  
- `POST /api/v1/admin/reviews/{id}/approve` - 批准審核
- `POST /api/v1/admin/reviews/{id}/reject` - 拒絕審核

## 部署

### Vercel 部署
1. 推送到 Git 倉庫
2. 連接 Vercel 項目
3. 設置環境變數
4. 自動部署

### 本地構建
```bash
npm run build
npm start
```

## 開發指南

### 代碼規範
- 使用 TypeScript 進行類型安全
- 遵循 ESLint 規則
- 使用 Prettier 格式化代碼

### 組件開發
- 優先使用函數式組件和 Hooks
- 保持組件單一職責
- 適當的錯誤邊界處理

## 故障排除

### 常見問題
1. **登入失敗** - 檢查 Supabase 配置和管理員權限
2. **API 錯誤** - 確認後端服務運行狀態
3. **樣式問題** - 檢查 Tailwind CSS 配置

## 版本信息
- Next.js 15
- React 18  
- TypeScript 5
- Tailwind CSS 3
