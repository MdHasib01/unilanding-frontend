'use client';

import { useEffect, useState } from 'react';

export type Remaining = { hours: number; minutes: number; seconds: number; done: boolean };

/** Next local midnight: the reference's rolling "offer ends today" deadline. */
function midnight() {
  const t = new Date();
  t.setHours(24, 0, 0, 0);
  return t.getTime();
}

/**
 * Ticks down to `endsAt` (an ISO date the tenant picked) or, when that is
 * empty or already past, to tonight's midnight — the reference page's
 * evergreen urgency timer, which restarts every day.
 *
 * Returns null until mounted so the server render and the first client render
 * agree (the server cannot know the visitor's clock).
 *
 * The reference copied this hook into three components; it lives once here.
 */
export function useCountdown(endsAt?: string): Remaining | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  if (now === null) return null;

  const fixed = endsAt ? Date.parse(endsAt) : NaN;
  const target = Number.isFinite(fixed) && fixed > now ? fixed : midnight();
  const total = Math.max(0, Math.floor((target - now) / 1000));

  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: total === 0,
  };
}

export const pad2 = (n: number) => n.toString().padStart(2, '0');

export const formatClock = (r: Remaining) => `${pad2(r.hours)}:${pad2(r.minutes)}:${pad2(r.seconds)}`;
