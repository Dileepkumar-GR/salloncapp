'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason: unknown = event.reason;
      const msg =
        typeof reason === 'string'
          ? reason
          : typeof reason === 'object' && reason !== null && 'message' in reason
          ? String((reason as { message?: string }).message)
          : undefined;
      if (msg && String(msg).includes('net::ERR_ABORTED')) {
        event.preventDefault();
        return;
      }
      if (typeof reason === 'object' && reason !== null) {
        const name = 'name' in reason ? String((reason as { name?: string }).name) : '';
        if (name === 'AbortError' || String(reason).includes('AbortError')) {
          event.preventDefault();
        }
      }
    };
    window.addEventListener('unhandledrejection', handler);
    return () => {
      window.removeEventListener('unhandledrejection', handler);
    };
  }, []);
  return <SessionProvider>{children}</SessionProvider>;
}
