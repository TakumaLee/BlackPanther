# Black Swamp Dashboard - 缺少的 API Endpoints

這個文件記錄了前端管理後台所需但目前在 black-alligator 後端中缺少的 API endpoints。

## 1. 內容管理 API (Content Management)

### 文章管理相關
- `DELETE /api/v1/admin/articles/{articleId}` - 管理員刪除文章
- `POST /api/v1/admin/articles/{articleId}/moderate` - 文章審核 (approve/reject)
- `GET /api/v1/admin/articles?page={page}&limit={limit}&sort={sort}&filter={filter}&search={search}` - 管理員專用的文章列表（包含額外的管理信息）
- `POST /api/v1/admin/articles/{articleId}/reports` - 獲取文章檢舉報告
- `GET /api/v1/admin/content-analysis` - 內容分析統計（情感分析分布、熱門話題等）

## 2. 系統設定 API (System Settings)

### 一般設定
- `GET /api/v1/admin/settings` - 獲取系統設定
- `PUT /api/v1/admin/settings` - 更新系統設定
- `POST /api/v1/admin/settings/reset` - 重設為預設值
- `POST /api/v1/admin/settings/export` - 匯出設定
- `POST /api/v1/admin/settings/import` - 匯入設定

### 通知設定
- `POST /api/v1/admin/notifications/test-email` - 發送測試郵件
- `GET /api/v1/admin/notifications/history` - 通知歷史記錄

## 3. 封鎖管理 API (Block Management)

### 用戶封鎖
- `GET /api/v1/admin/blocks/users` - 獲取封鎖用戶列表
- `POST /api/v1/admin/blocks/users` - 封鎖用戶
- `DELETE /api/v1/admin/blocks/users/{userId}` - 解除用戶封鎖

### IP 封鎖
- `GET /api/v1/admin/blocks/ips` - 獲取封鎖 IP 列表
- `POST /api/v1/admin/blocks/ips` - 封鎖 IP
- `DELETE /api/v1/admin/blocks/ips/{ipId}` - 解除 IP 封鎖

## 4. 邀請系統 API (Invite System)

### 邀請碼管理
- `GET /api/v1/admin/invites` - 獲取邀請碼列表
- `POST /api/v1/admin/invites` - 生成邀請碼
- `DELETE /api/v1/admin/invites/{inviteId}` - 刪除邀請碼
- `GET /api/v1/admin/invites/{inviteId}/usage` - 邀請碼使用統計

## 5. 系統監控 API (System Monitoring)

### 系統狀態
- `GET /api/v1/admin/monitoring/system-status` - 系統狀態
- `GET /api/v1/admin/monitoring/performance` - 性能指標
- `GET /api/v1/admin/monitoring/logs` - 系統日誌
- `GET /api/v1/admin/monitoring/errors` - 錯誤日誌

### 資料庫監控
- `GET /api/v1/admin/monitoring/database` - 資料庫狀態
- `POST /api/v1/admin/monitoring/database/backup` - 執行資料庫備份
- `GET /api/v1/admin/monitoring/database/backups` - 備份列表

## 6. AI 配置 API (AI Configuration)

### AI 模型管理
- `GET /api/v1/admin/ai-config` - 獲取 AI 配置
- `PUT /api/v1/admin/ai-config` - 更新 AI 配置
- `POST /api/v1/admin/ai-config/test` - 測試 AI 模型連接
- `GET /api/v1/admin/ai-config/usage-stats` - AI 使用統計

## 7. 統計報告 API (Statistics)

### 自定義報告
- `GET /api/v1/admin/stats/custom` - 自定義統計報告
- `POST /api/v1/admin/stats/generate` - 生成報告
- `GET /api/v1/admin/stats/export` - 匯出統計數據

## 8. 詳細分析 API (Detailed Analytics)

### 進階分析
- `GET /api/v1/admin/analytics/user-demographics` - 用戶人口統計（需要真實數據而非估算）
- `GET /api/v1/admin/analytics/sentiment-analysis` - 真實的情感分析數據
- `GET /api/v1/admin/analytics/topic-analysis` - 話題分析（基於真實的內容分析）
- `GET /api/v1/admin/analytics/engagement-metrics` - 詳細的互動指標

## 9. 安全與審計 API (Security & Audit)

### 安全事件
- `GET /api/v1/admin/security/events` - 安全事件日誌
- `POST /api/v1/admin/security/events/{eventId}/investigate` - 調查安全事件

### 審計日誌
- `GET /api/v1/admin/audit/logs` - 管理操作審計日誌
- `GET /api/v1/admin/audit/user-actions` - 用戶操作記錄

## 10. 批量操作 API (Batch Operations)

### 批量管理
- `POST /api/v1/admin/batch/users/action` - 批量用戶操作（批量封鎖、解封等）
- `POST /api/v1/admin/batch/articles/moderate` - 批量文章審核
- `POST /api/v1/admin/batch/cleanup` - 批量清理過期數據

## 實作優先級

### 高優先級（立即需要）
1. 內容管理相關的 admin API
2. 系統設定 API 基礎功能
3. 詳細的統計分析 API

### 中優先級（短期內實作）
1. 封鎖管理 API
2. 邀請系統 API
3. 系統監控基礎功能

### 低優先級（長期規劃）
1. AI 配置進階功能
2. 安全與審計完整功能
3. 批量操作 API

## 注意事項

1. **權限控制**: 所有 admin API 都需要適當的權限驗證
2. **操作記錄**: 重要的管理操作需要記錄到審計日誌
3. **輸入驗證**: 所有輸入都需要嚴格的驗證和清理
4. **錯誤處理**: 提供清晰的錯誤信息和狀態碼
5. **性能考量**: 大數據量的 API 需要分頁和優化查詢

## 當前狀態

- ✅ 用戶管理 API - 已實作並正常運作
- ✅ 經濟系統配置 API - 已實作並正常運作
- ✅ Dashboard 統計 API - 已實作並正常運作
- ⚠️ 內容管理 API - 部分實作（缺少 admin 專用功能）
- ❌ 其他模組 - 大部分未實作

最後更新：2024-01-15