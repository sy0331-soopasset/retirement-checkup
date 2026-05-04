import type { Metadata } from 'next';
import Script from 'next/script';
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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
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

        {/* Google Tag Manager */}
        {gtmId && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}

        {/* Google Analytics (GTM 미사용 시 직접 로드) */}
        {gaId && !gtmId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
              }}
            />
          </>
        )}

        {/* Meta (Facebook) Pixel */}
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${metaPixelId}');fbq('track','PageView');`}
          </Script>
        )}

        {/* Naver 광고 전환 추적 */}
        {naverAdsId && (
          <Script id="naver-ads" strategy="afterInteractive">
            {`if(!wcs_add)var wcs_add={};wcs_add["wa"]="${naverAdsId}";
            if(!_nasa)var _nasa={};if(window.wcs){wcs.inflow();wcs_do(_nasa);}`}
          </Script>
        )}

        {/* Kakao Pixel */}
        {kakaoPixelId && (
          <Script id="kakao-pixel" strategy="afterInteractive">
            {`!function(e,a){if(!a.__kakaoPixel){a.__kakaoPixel=!0;var t=a.document,
            n=t.createElement("script");n.async=!0,n.type="text/javascript",
            n.src="//t1.daumcdn.net/kas/static/kp.js",
            t.head.appendChild(n)}}(window.kakaoPixel||(window.kakaoPixel=function(e){
            var a={};return a.participation=function(){},a}),window);
            kakaoPixel('${kakaoPixelId}').pageView();`}
          </Script>
        )}
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
      </body>
    </html>
  );
}
