# Black Swamp 管理後台設計系統

## 設計原則

### 1. 視覺舒適性
- **護眼配色**：避免純黑背景，使用柔和的灰色調 (#F7F8FA)
- **適當對比**：文字與背景保持良好對比度，符合 WCAG 2.1 AA 標準
- **漸進式深色模式**：深色模式使用深藍灰 (#1A1F2E) 而非純黑

### 2. 層次結構
- **三層視覺層次**：
  - 背景層 (Background): #F7F8FA
  - 表面層 (Surface): #FFFFFF
  - 懸浮層 (Elevated): 使用陰影提升

### 3. 一致性
- **統一的間距系統**：4px 基準網格
- **一致的圓角**：卡片 12px，按鈕 8px，輸入框 6px
- **標準化的動畫**：300ms ease 轉場

## 色彩系統

### 基礎色板

| 用途 | 淺色模式 | 深色模式 | 使用場景 |
|-----|---------|---------|---------|
| 背景 | #F7F8FA | #1A1F2E | 頁面背景 |
| 表面 | #FFFFFF | #243041 | 卡片、模態框 |
| 邊框 | #E5E7EB | #374151 | 分隔線、邊框 |
| 主文字 | #1F2937 | #F3F4F6 | 標題、重要內容 |
| 次要文字 | #6B7280 | #D1D5DB | 描述、輔助資訊 |

### 功能色彩

| 功能 | 色彩 | 使用場景 |
|-----|------|---------|
| 經濟系統 | #F59E0B | 金幣、交易相關 |
| 用戶管理 | #3B82F6 | 用戶、帳號相關 |
| 內容管理 | #10B981 | 文章、內容相關 |
| 數據分析 | #8B5CF6 | 統計、圖表相關 |
| 邀請系統 | #EC4899 | 邀請碼、推薦相關 |
| 系統監控 | #EF4444 | 警報、監控相關 |
| AI 配置 | #6366F1 | AI、自動化相關 |
| 系統設定 | #6B7280 | 設定、配置相關 |

## 排版系統

### 字型
- 主要字型：Geist Sans (系統優先)
- 等寬字型：Geist Mono (程式碼、數據)
- 後備字型：system-ui, -apple-system, 'Segoe UI', Roboto

### 字級規範

| 層級 | 大小 | 行高 | 權重 | 使用場景 |
|-----|-----|-----|-----|---------|
| h1 | 30px | 1.2 | 700 | 頁面標題 |
| h2 | 20px | 1.3 | 600 | 區塊標題 |
| h3 | 18px | 1.4 | 600 | 卡片標題 |
| body | 14px | 1.5 | 400 | 正文內容 |
| small | 12px | 1.5 | 400 | 輔助文字 |

## 間距系統

基於 4px 網格系統：
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

## 組件規範

### 卡片 (Card)
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
```

### 按鈕 (Button)
```css
.button {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button-primary {
  background: var(--brand-primary);
  color: white;
}

.button-primary:hover {
  background: var(--brand-secondary);
}
```

### 輸入框 (Input)
```css
.input {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  transition: border-color 0.2s ease;
}

.input:focus {
  border-color: var(--brand-primary);
  outline: none;
}
```

## 動畫系統

### 標準動畫
- **淡入**: fadeIn 0.3s ease-out
- **滑入**: slideIn 0.3s ease-out
- **縮放**: scale 0.2s ease
- **旋轉載入**: spin 1s linear infinite

### 動畫時長
- 快速: 150ms (懸停效果)
- 標準: 300ms (頁面轉場)
- 慢速: 500ms (複雜動畫)

## 響應式斷點

| 斷點 | 尺寸 | 設備 |
|-----|-----|-----|
| sm | 640px | 手機橫屏 |
| md | 768px | 平板豎屏 |
| lg | 1024px | 平板橫屏/小筆電 |
| xl | 1280px | 桌面顯示器 |
| 2xl | 1536px | 大螢幕顯示器 |

## 無障礙設計

### 顏色對比
- 正常文字: 最小 4.5:1
- 大文字: 最小 3:1
- 互動元素: 最小 3:1

### 鍵盤導航
- Tab 順序邏輯清晰
- Focus 狀態明顯可見
- 支援 Esc 關閉模態框

### 螢幕閱讀器
- 語義化 HTML 標籤
- ARIA 標籤適當使用
- 圖片包含 alt 文字

## 互動模式

### 回饋機制
1. **即時回饋**: 懸停、點擊立即響應
2. **載入狀態**: 明確的載入指示器
3. **成功/錯誤**: 清晰的狀態提示

### 微互動
- 數字變化動畫
- 卡片懸停提升
- 按鈕點擊波紋
- 平滑滾動

## 實施指南

### CSS 變數使用
```css
/* 使用 CSS 變數確保一致性 */
.component {
  background: var(--surface);
  color: var(--foreground);
  border: 1px solid var(--border);
}
```

### Tailwind 配置
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        // ...其他顏色
      }
    }
  }
}
```

### 組件開發流程
1. 參考設計系統規範
2. 使用預定義的顏色變數
3. 遵循間距系統
4. 實現標準動畫
5. 測試無障礙性