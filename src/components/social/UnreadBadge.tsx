'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const LS_KEY = 'social_last_seen';
const POLL_MS = 20_000; // poll every 20s

export default function UnreadBadge() {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  // When user visits /social/*, mark as seen now
  useEffect(() => {
    if (pathname.startsWith('/social')) {
      localStorage.setItem(LS_KEY, new Date().toISOString());
      setCount(0);
    }
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const since = localStorage.getItem(LS_KEY) ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      try {
        const res = await fetch(`/api/social/unread?since=${encodeURIComponent(since)}`);
        if (!res.ok || cancelled) return;
        const { count } = await res.json();
        if (!cancelled) setCount(count);
      } catch { /* offline */ }
    }

    check();
    const id = setInterval(check, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (count === 0) return null;

  return (
    <span
      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full text-[10px] font-black text-white flex items-center justify-center"
      style={{ background: 'var(--mod-social)', boxShadow: '0 0 0 2px white' }}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}
