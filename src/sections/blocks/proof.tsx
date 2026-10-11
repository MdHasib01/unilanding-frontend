'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Star, BadgeCheck, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { SectionShell, SectionHeading } from '@/components/shared/section-shell';
import { RevealGroup, RevealItem } from '@/components/shared/reveal';
import { cn } from '@/lib/utils';
import type { SectionRendererProps } from '../types';

type Img = { url?: string; alt?: string };
type T = (v: unknown) => string;

/**
 * Scroll-snap carousel rather than a JS slider library.
 *
 * It is keyboard and touch accessible for free, works with no JS at all, and
 * avoids shipping a carousel dependency to every tenant's landing page — where
 * bundle size is conversion.
 */
function useCarousel(count: number, autoplayMs: number, paused: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    const el = ref.current;
    if (!el) return;
    const next = ((i % count) + count) % count;
    const child = el.children[next] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    setIndex(next);
  }, [count]);

  useEffect(() => {
    if (paused || !autoplayMs || count < 2) return;
    const id = setInterval(() => goTo(index + 1), autoplayMs);
    return () => clearInterval(id);
  }, [autoplayMs, count, goTo, index, paused]);

  // Keep the dots in step when the visitor swipes manually.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const children = Array.from(el.children) as HTMLElement[];
        const mid = el.scrollLeft + el.clientWidth / 2;
        const nearest = children.reduce(
          (best, child, i) => {
            const c = child.offsetLeft - el.offsetLeft + child.clientWidth / 2;
            const d = Math.abs(c - mid);
            return d < best.d ? { d, i } : best;
          },
          { d: Infinity, i: 0 }
        );
        setIndex(nearest.i);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, index, goTo };
}

function CarouselControls({
  count,
  index,
  goTo,
}: {
  count: number;
  index: number;
  goTo: (i: number) => void;
}) {
  if (count < 2) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Previous"
        className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to ${i + 1}`}
            aria-current={i === index}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === index ? 'w-5 bg-primary' : 'w-1.5 bg-border'
            )}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Next"
        className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

const track =
  'flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

// ───────────────────────────── reviews ─────────────────────────────

type ReviewsData = {
  title?: unknown;
  autoplayMs?: number;
  items?: {
    name?: string;
    location?: unknown;
    rating?: number;
    text?: unknown;
    image?: Img;
    verified?: boolean;
  }[];
};

export function ReviewsCarousel({ data, ctx }: SectionRendererProps<ReviewsData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const items = data.items ?? [];
  // Autoplay would fight the editor: the preview must hold still while typing.
  const { ref, index, goTo } = useCarousel(items.length, data.autoplayMs ?? 0, ctx.mode === 'preview');

  if (items.length === 0) return null;

  return (
    <SectionShell width="wide" tone="muted">
      <SectionHeading title={t(data.title)} />
      <div ref={ref} className={track}>
        {items.map((r, i) => (
          <article
            key={i}
            className="w-[86%] shrink-0 snap-center rounded-2xl border border-border bg-card p-5 shadow-sm sm:w-[46%] lg:w-[31.5%]"
          >
            <div className="flex items-center gap-3">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
                {r.image?.url ? (
                  <Image src={r.image.url} alt={r.name || ''} fill sizes="44px" className="object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-sm font-bold text-muted-foreground">
                    {(r.name || '?').slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate text-sm font-bold text-card-foreground">
                  {r.name}
                  {r.verified ? <BadgeCheck className="size-4 shrink-0 text-primary" /> : null}
                </p>
                {t(r.location) ? (
                  <p className="truncate text-xs text-muted-foreground">{t(r.location)}</p>
                ) : null}
              </div>
            </div>

            {r.rating ? (
              <div className="mt-3 flex gap-0.5" aria-label={`${r.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={cn(
                      'size-4',
                      s < (r.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-border'
                    )}
                  />
                ))}
              </div>
            ) : null}

            {t(r.text) ? (
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                {t(r.text)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <CarouselControls count={items.length} index={index} goTo={goTo} />
    </SectionShell>
  );
}

// ───────────────────────────── certifications ─────────────────────────────

type CertData = {
  title?: unknown;
  items?: { label?: unknown; image?: Img; note?: unknown }[];
};

export function Certifications({ data, ctx }: SectionRendererProps<CertData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const items = data.items ?? [];
  if (items.length === 0) return null;

  return (
    <SectionShell width="wide">
      <SectionHeading title={t(data.title)} />
      <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((c, i) => (
          <RevealItem key={i}>
            <div className="flex h-full flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center">
              {c.image?.url ? (
                <div className="relative size-14">
                  <Image src={c.image.url} alt={t(c.label)} fill sizes="56px" className="object-contain" />
                </div>
              ) : (
                <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Award className="size-6" />
                </span>
              )}
              {t(c.label) ? (
                <p className="text-sm font-semibold text-card-foreground">{t(c.label)}</p>
              ) : null}
              {t(c.note) ? <p className="text-xs text-muted-foreground">{t(c.note)}</p> : null}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
}

// ───────────────────────────── experts ─────────────────────────────

type DoctorsData = {
  title?: unknown;
  items?: {
    name?: unknown;
    degree?: string;
    subtitle?: unknown;
    description?: unknown;
    image?: Img;
  }[];
};

export function DoctorsCarousel({ data, ctx }: SectionRendererProps<DoctorsData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const items = data.items ?? [];
  const { ref, index, goTo } = useCarousel(items.length, 0, ctx.mode === 'preview');
  if (items.length === 0) return null;

  return (
    <SectionShell width="wide">
      <SectionHeading title={t(data.title)} />
      <div ref={ref} className={track}>
        {items.map((d, i) => (
          <article
            key={i}
            className="w-[88%] shrink-0 snap-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:w-[48%] lg:w-[48%]"
          >
            <div className="flex gap-4 p-5">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
                {d.image?.url ? (
                  <Image src={d.image.url} alt={t(d.name)} fill sizes="80px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-card-foreground">{t(d.name)}</h3>
                {d.degree ? (
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">{d.degree}</p>
                ) : null}
                {t(d.subtitle) ? (
                  <p className="mt-1 text-sm text-muted-foreground">{t(d.subtitle)}</p>
                ) : null}
              </div>
            </div>
            {t(d.description) ? (
              <p className="border-t border-border px-5 py-4 text-pretty text-sm leading-relaxed text-muted-foreground">
                {t(d.description)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <CarouselControls count={items.length} index={index} goTo={goTo} />
    </SectionShell>
  );
}

// ───────────────────────────── logo cloud ─────────────────────────────

type LogoData = { title?: unknown; items?: { label?: string; image?: Img }[] };

export function LogoCloud({ data, ctx }: SectionRendererProps<LogoData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const items = (data.items ?? []).filter((i) => i.image?.url || i.label);
  if (items.length === 0) return null;

  return (
    <SectionShell width="wide">
      <SectionHeading title={t(data.title)} />
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-80">
        {items.map((l, i) =>
          l.image?.url ? (
            <div key={i} className="relative h-10 w-28">
              <Image src={l.image.url} alt={l.label || ''} fill sizes="112px" className="object-contain" />
            </div>
          ) : (
            <span key={i} className="text-sm font-semibold text-muted-foreground">
              {l.label}
            </span>
          )
        )}
      </div>
    </SectionShell>
  );
}
