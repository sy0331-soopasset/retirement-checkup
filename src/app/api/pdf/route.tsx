import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { ResultDocument } from '@/lib/pdf/ResultDocument';
import type { AnalysisItem, Stage } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface RequestBody {
  totalScore: number;
  stage: Stage;
  analysisGroups: {
    excellent: AnalysisItem[];
    normal: AnalysisItem[];
    lacking: AnalysisItem[];
  };
  userName?: string;
}

const STAGES: Stage[] = ['seed', 'tree', 'forest'];

function isValidAnalysisItem(v: unknown): v is AnalysisItem {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.index === 'number' &&
    typeof o.name === 'string' &&
    typeof o.score === 'number' &&
    typeof o.feedback === 'string'
  );
}

function isValidBody(v: unknown): v is RequestBody {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (typeof o.totalScore !== 'number' || o.totalScore < 0 || o.totalScore > 16) return false;
  if (typeof o.stage !== 'string' || !STAGES.includes(o.stage as Stage)) return false;
  const g = o.analysisGroups as Record<string, unknown> | undefined;
  if (!g || typeof g !== 'object') return false;
  for (const key of ['excellent', 'normal', 'lacking']) {
    const arr = g[key];
    if (!Array.isArray(arr) || !arr.every(isValidAnalysisItem)) return false;
  }
  if (o.userName !== undefined && typeof o.userName !== 'string') return false;
  return true;
}

function sanitizeFilename(name: string): string {
  // eslint-disable-next-line no-control-regex
  return name.replace(/[\\/:*?"<>|\x00-\x1f]/g, '').trim().slice(0, 50);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const generatedAt = formatDate(new Date());

  const pdfBuffer = await renderToBuffer(
    <ResultDocument
      totalScore={body.totalScore}
      stage={body.stage}
      analysisGroups={body.analysisGroups}
      generatedAt={generatedAt}
    />,
  );
  const uint8Array = new Uint8Array(pdfBuffer);

  const safeUserName = sanitizeFilename(body.userName || '') || '신청자';
  const asciiName = `retirement-checkup-${generatedAt}.pdf`;
  const utf8Name = encodeURIComponent(`${safeUserName}님의 은퇴준비체크업 결과.pdf`);

  return new NextResponse(uint8Array, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${utf8Name}`,
      'Cache-Control': 'no-store',
    },
  });
}
