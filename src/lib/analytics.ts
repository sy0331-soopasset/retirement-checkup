'use client';

// UTM 파라미터 캡처 (광고 유입 추적)
export function captureUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  keys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utm[key] = value;
      // 세션 스토리지에 저장 (페이지 이동 시에도 유지)
      sessionStorage.setItem(key, value);
    } else {
      const stored = sessionStorage.getItem(key);
      if (stored) utm[key] = stored;
    }
  });

  // gclid (Google Ads 클릭 ID)
  const gclid = params.get('gclid');
  if (gclid) {
    utm.gclid = gclid;
    sessionStorage.setItem('gclid', gclid);
  } else {
    const stored = sessionStorage.getItem('gclid');
    if (stored) utm.gclid = stored;
  }

  return utm;
}

// GA4 이벤트 전송
export function sendGAEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

// Google Ads 전환 추적
export function sendGoogleAdsConversion() {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

  if (adsId && label && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: `${adsId}/${label}`,
    });
  }
}

// Meta Pixel 이벤트
export function sendMetaEvent(eventName: string) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName);
  }
}

// Naver 광고 전환 추적
export function sendNaverConversion(type: string) {
  if (typeof window !== 'undefined' && typeof window.wcs === 'object') {
    window.wcs.trans({ type });
  }
}

// Kakao Pixel 이벤트
export function sendKakaoEvent(eventName: string) {
  if (typeof window !== 'undefined' && typeof window.kakaoPixel === 'function') {
    const pixelId = process.env.NEXT_PUBLIC_KAKAO_PIXEL_ID;
    if (pixelId) {
      window.kakaoPixel(pixelId).participation();
    }
  }
}

// 전환 이벤트 통합 발송 (상담 신청 완료 시)
export function trackConversion() {
  sendGAEvent('consultation_submit', { event_category: 'engagement' });
  sendGoogleAdsConversion();
  sendMetaEvent('Lead');
  sendNaverConversion('lead');
  sendKakaoEvent('participation');
}

// GA4 + gtag 타입 선언
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    fbq: (...args: unknown[]) => void;
    wcs: { trans: (params: { type: string }) => void };
    kakaoPixel: (id: string) => { participation: () => void };
  }
}
