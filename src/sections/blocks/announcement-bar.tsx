'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import type { SectionRendererProps } from '../types';

type Data = {
  text?: unknown;
  countdownTo?: string;
  dismissible?: boolean;
};

const pad = (n: number) => String(n).padStart(2, '0');

export function AnnouncementBar({ data, ctx }: SectionRendererProps<Data>) {
  const [dismissed, setDismissed] = useState(false);
  const [left, setLeft] = useState<number | null>(null);

  const target = data.countdownTo ? new Date(data.countdownTo).getTime() : null;

  useEffect(() => {
    if (!target) return;
    // In the editor preview the clock is frozen, so a countdown does not cause
    // a re-render on every tick while someone is typing.
    if (ctx.mode === 'preview') {
      setLeft(Math.max(0, target - Date.now()));
      return;
    }
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, ctx.mode]);

  const text = tt(data.text, ctx.locale, ctx.fallbackLocale);
  if (dismissed || (!text && !target)) return null;

  const expired = left !== null && left <= 0;
  const h = left !== null ? Math.floor(left / 3_600_000) : 0;
  const m = left !== null ? Math.floor((left % 3_600_000) / 60_000) : 0;
  const s = left !== null ? Math.floor((left % 60_000) / 1000) : 0;

  return (
    <div className="relative z-30 w-full bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-sm font-medium sm:px-6">
        {text ? <span className="text-pretty">{text}</span> : null}

        {target && !expired ? (
          <span className="inline-flex items-center gap-1 font-mono text-sm tabular-nums">
            <Unit value={h} />
            <span aria-hidden>:</span>
            <Unit value={m} />
            <span aria-hidden>:</span>
            <Unit value={s} />
          </span>
        ) : null}

        {data.dismissible ? (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 opacity-70 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

const Unit = ({ value }: { value: number }) => (
  <span className="rounded bg-black/15 px-1.5 py-0.5">{pad(value)}</span>
);
