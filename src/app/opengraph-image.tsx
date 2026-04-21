import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const alt = '은퇴준비 체크리스트 | 숲파트너스';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  const logoPath = path.join(process.cwd(), 'public', 'logo_transparent.png');
  const logoBase64 = fs.readFileSync(logoPath).toString('base64');
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #053c3c 0%, #0a5555 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
        }}
      >
        <img
          src={logoSrc}
          style={{ width: '420px', height: 'auto' }}
        />
        <p
          style={{
            color: '#c8dede',
            fontSize: '28px',
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          5060의 선택, 마음 편한 투자
        </p>
      </div>
    ),
    { ...size },
  );
}
