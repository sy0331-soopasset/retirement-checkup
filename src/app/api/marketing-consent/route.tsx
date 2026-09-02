import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { ResultDocument } from '@/lib/pdf/ResultDocument';
import type { AnalysisItem, Stage } from '@/lib/types';

export const runtime = 'nodejs';

// 결과 화면에서 뒤늦게 마케팅 수신에 동의한 경우,
// 시트의 동의 값을 갱신하고 전체 리포트 PDF + 전자책을 발송하기 위한 엔드포인트.

function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim()
    .slice(0, 500);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
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

const stageNameMap: Record<string, string> = {
  seed: '씨앗 단계',
  tree: '나무 단계',
  forest: '숲 단계',
};

export async function POST(request: NextRequest) {
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
    const { name, phone, email, score, stage, totalScoreNum, analysisGroups } = body;

    const cleanName = sanitizeString(String(name || ''));
    const cleanPhone = sanitizeString(String(phone || ''));
    const cleanEmail = sanitizeString(String(email || ''));

    if (!cleanName || !/^01[0-9]-?\d{3,4}-?\d{4}$/.test(cleanPhone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { result: 'error', error: '신청 정보를 확인할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 전체 리포트 PDF 생성
    let pdfBase64: string | undefined;
    if (stage && analysisGroups) {
      try {
        const pdfBuffer = await renderToBuffer(
          <ResultDocument
            totalScore={typeof totalScoreNum === 'number' ? totalScoreNum : 0}
            stage={stage as Stage}
            analysisGroups={
              analysisGroups as {
                excellent: AnalysisItem[];
                normal: AnalysisItem[];
                lacking: AnalysisItem[];
              }
            }
            generatedAt={formatDate(new Date())}
          />
        );
        pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
      } catch (err) {
        console.error('PDF generation failed:', err);
      }
    }

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
      body: JSON.stringify({
        action: 'marketingConsent',
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        score: typeof score === 'string' ? sanitizeString(score) : '',
        privacyAgreed: true,
        marketingAgreed: true,
        stage,
        stageName: stageNameMap[String(stage)] || '',
        totalScoreNum,
        reportType: 'full',
        sendEbook: true,
        ...(pdfBase64 ? { pdfBase64 } : {}),
      }),
    });

    const data = await response.json().catch(() => ({ result: 'success' }));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Marketing consent API error:', error);
    return NextResponse.json(
      { result: 'error', error: '서버 통신 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
