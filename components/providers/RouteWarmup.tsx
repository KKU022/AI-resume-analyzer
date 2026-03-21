'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const WARMUP_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/dashboard',
  '/dashboard/upload',
  '/dashboard/analysis',
  '/dashboard/history',
  '/dashboard/jobs',
];

export default function RouteWarmup() {
  const router = useRouter();

  useEffect(() => {
    const prefetchAll = () => {
      WARMUP_ROUTES.forEach((route) => {
        router.prefetch(route);
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: IdleRequestCallback) => number })
        .requestIdleCallback(prefetchAll);
      return;
    }

    const timeout = globalThis.setTimeout(prefetchAll, 120);
    return () => globalThis.clearTimeout(timeout);
  }, [router]);

  return null;
}
