import { NextRequest, NextResponse } from 'next/server';
import { config, logger } from '@/config/environment';

// Server-side needs full URL - use env var directly or fallback to QA
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://black-alligator-qa-646040465533.asia-east1.run.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const loginUrl = `${API_BASE_URL}/api/v1/admin/auth/login`;

    logger.debug('Processing login request:', { url: loginUrl });

    // Forward the login request to the backend
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.warn('Login failed:', { status: response.status, error: data.detail });
      return NextResponse.json(
        { error: data.detail || 'Login failed' },
        { status: response.status }
      );
    }

    logger.info('Login successful for user:', data.user?.email || 'unknown');

    // Return the token and user info
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}