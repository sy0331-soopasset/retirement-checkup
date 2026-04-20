import { NextRequest, NextResponse } from 'next/server';

// 서버 사이드 입력 검증
function validateInput(data: Record<string, unknown>): string | null {
  const name = String(data.name || '').trim();
  const phone = String(data.phone || '').trim();
  const email = String(data.email || '').trim();

  if (!name || name.length > 50) return '이름이 올바르지 않습니다.';
  if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g, '')))
    return '연락처가 올바르지 않습니다.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return '이메일이 올바르지 않습니다.';

  return null;
}

// 간단한 서버 사이드 sanitization
function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim()
    .slice(0, 500);
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Rate limiting (in-memory, 프로세스 단위)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // 분당 최대 요청 수
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { result: 'error', error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // 서버 사이드 입력 검증
    const validationError = validateInput(body);
    if (validationError) {
      return NextResponse.json(
        { result: 'error', error: validationError },
        { status: 400 }
      );
    }

    // 입력 데이터 sanitize
    const sanitizedData = sanitizeObject(body);

    // Google Apps Script로 전송 (URL은 서버 환경변수에서만 접근)
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      console.error('GOOGLE_SCRIPT_URL is not configured');
      return NextResponse.json(
        { result: 'error', error: '서버 설정 오류입니다.' },
        { status: 500 }
      );
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedData),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Consultation API error:', error);
    return NextResponse.json(
      { result: 'error', error: '서버 통신 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
