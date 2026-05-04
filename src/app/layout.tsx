import type { Metadata } from 'next';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: '은퇴준비 체크리스트 | 숲파트너스',
  description:
    '8가지 질문으로 나의 은퇴준비 상태를 진단하고 맞춤형 솔루션을 제안받으세요. 연금, 생활비, 세금, 자산관리까지 종합 점검.',
  keywords: '은퇴준비, 은퇴설계, 자가진단, 연금, 노후준비, 자산관리, 상속세, 증여세, 숲파트너스',
  openGraph: {
    title: '은퇴준비 체크리스트 | 숲파트너스',
    description: '8가지 질문으로 나의 은퇴준비 상태를 확인해보세요.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '숲파트너스',
    url: 'https://www.soop-partners.com',
    images: [
      {
        url: 'https://retirement-checkup.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '은퇴준비 체크리스트 | 숲파트너스',
      },
    ],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://www.soop-partners.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-WWG0EBGY4D';
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const naverAdsId = process.env.NEXT_PUBLIC_NAVER_ADS_ID;
  const kakaoPixelId = process.env.NEXT_PUBLIC_KAKAO_PIXEL_ID;

  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body>
        {/* GTM noscript fallback */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}

        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
