'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The reference page's review and doctor carousels: a native scroll-snap row
 * whose active card advances every few seconds, pauses on hover, and scrolls
 * the active card into place (centred for reviews, left-aligned for doctors).
 *
 * In the editor preview autoplay is off — the preview must hold still while
 * the tenant types.
 */
export function useAutoCarousel({
  count,
  autoplayMs,
  enabled,
  align = 'center',
}: {
  count: number;
  autoplayMs: number;
  enabled: boolean;
  align?: 'center' | 'start';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!enabled || paused || !autoplayMs || count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), autoplayMs);
    return () => clearInterval(id);
  }, [autoplayMs, count, enabled, paused]);

  useEffect(() => {
    // Skip the first run: scrolling on mount would yank a phone visitor's
    // viewport sideways before they have touched anything.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const el = ref.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    const left =
      align === 'center'
        ? card.offsetLeft - el.offsetLeft - (el.clientWidth - card.clientWidth) / 2
        : card.offsetLeft - el.offsetLeft;
    el.scrollTo({ left, behavior: 'smooth' });
  }, [index, align]);

  const next = () => setIndex((i) => (i + 1) % Math.max(1, count));
  const prev = () => setIndex((i) => (i - 1 + Math.max(1, count)) % Math.max(1, count));

  return {
    ref,
    index: Math.min(index, Math.max(0, count - 1)),
    setIndex,
    next,
    prev,
    hoverProps: { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) },
  };
}
