import { NextRequest, NextResponse } from 'next/server';

// 受保護的路由
const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 由於中間件在伺服器端運行，無法直接存取 localStorage
  // 我們將在客戶端組件中處理認證檢查
  // 這裡只做基本的路由保護
  
  // 對於受保護的路由，讓客戶端組件處理認證檢查
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // 允許通過，讓組件層級處理認證
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配除了以下路徑之外的所有路徑:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};