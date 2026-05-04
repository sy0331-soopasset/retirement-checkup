'use client';

import { useEffect } from 'react';

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  useEffect(() => {
    if (!gaId) return;

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    (window as { gtag?: (...args: unknown[]) => void }).gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId);
  }, [gaId]);

  return null;
}
