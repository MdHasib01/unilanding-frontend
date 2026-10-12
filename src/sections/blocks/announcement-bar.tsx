'use client';

import { Timer } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { useCountdown, formatClock } from '@/components/landing/use-countdown';
import type { SectionRendererProps } from '../types';

type Data = {
  text?: unknown;
  showCountdown?: boolean;
  countdownTo?: string;
};

/**
 * The reference page's urgency bar: brand-coloured strip, offer text and a
 * live countdown pill.
 *
 * `sticky` rather than the reference's `fixed`: it pins identically while the
 * visitor scrolls, but keeps its place in the flow, so the hero needs no
 * hard-coded top padding guessing the bar's height (it wraps to two lines on a
 * small phone), and inside the editor preview it pins to the preview pane
 * instead of escaping to the top of the dashboard.
 */
export function AnnouncementBar({ data, ctx }: SectionRendererProps<Data>) {
  const text = tt(data.text, ctx.locale, ctx.fallbackLocale);
  const countdown = useCountdown(data.countdownTo);
  if (!text && !data.showCountdown) return null;

  return (
    <div className="sticky top-0 z-[60] flex w-full max-w-full items-center justify-center overflow-hidden bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-sm">
      <div className="flex max-w-full flex-row flex-wrap items-center justify-center gap-2 sm:gap-3">
        {text ? (
          <span className="text-center text-xs font-extrabold tracking-wide sm:text-sm">{text}</span>
        ) : null}
        {data.showCountdown && countdown ? (
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider shadow-sm sm:px-3 sm:text-xs">
            <Timer className="size-3.5 shrink-0" />
            <span>{formatClock(countdown)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
