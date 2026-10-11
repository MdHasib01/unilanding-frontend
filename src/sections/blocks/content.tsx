'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { SectionShell, SectionHeading } from '@/components/shared/section-shell';
import { Reveal } from '@/components/shared/reveal';
import { ScrollCta } from '@/components/shared/scroll-cta';
import { cn } from '@/lib/utils';
import type { SectionRendererProps } from '../types';

type Img = { url?: string; alt?: string };
type T = (v: unknown) => string;

// ───────────────────────────── FAQ ─────────────────────────────

type FaqData = {
  title?: unknown;
  defaultOpen?: number;
  items?: { q?: unknown; a?: unknown }[];
};

export function Faq({ data, ctx }: SectionRendererProps<FaqData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const items = (data.items ?? []).filter((i) => t(i.q));
  const [open, setOpen] = useState<number | null>(data.defaultOpen ?? 0);
  if (items.length === 0) return null;

  return (
    <SectionShell width="default" tone="muted">
      <SectionHeading title={t(data.title)} />
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/40"
                >
                  <span className="text-sm font-semibold text-card-foreground sm:text-base">
                    {t(item.q)}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-5 shrink-0 text-muted-foreground transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
              </h3>
              {/* Grid-rows trick animates to the content's natural height
                  without measuring it in JS. */}
              <div
                className={cn(
                  'grid transition-all duration-300 ease-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {t(item.a)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ───────────────────────────── countdown ─────────────────────────────

type CountdownData = { title?: unknown; endsAt?: string; expiredText?: unknown };

export function Countdown({ data, ctx }: SectionRendererProps<CountdownData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const target = data.endsAt ? new Date(data.endsAt).getTime() : null;
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    if (ctx.mode === 'preview') {
      setLeft(Math.max(0, target - Date.now()));
      return;
    }
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, ctx.mode]);

  if (!target) return null;
  const expired = left !== null && left <= 0;

  const d = left ? Math.floor(left / 86_400_000) : 0;
  const h = left ? Math.floor((left % 86_400_000) / 3_600_000) : 0;
  const m = left ? Math.floor((left % 3_600_000) / 60_000) : 0;
  const s = left ? Math.floor((left % 60_000) / 1000) : 0;

  return (
    <SectionShell width="default">
      <Reveal>
        <div className="rounded-3xl border-2 border-primary/25 bg-card p-7 text-center shadow-sm">
          {t(data.title) ? (
            <h2 className="text-lg font-bold text-card-foreground sm:text-xl">{t(data.title)}</h2>
          ) : null}

          {expired ? (
            <p className="mt-3 text-base font-semibold text-muted-foreground">
              {t(data.expiredText)}
            </p>
          ) : (
            <div className="mt-5 flex items-center justify-center gap-2.5 sm:gap-4">
              {[
                { v: d, k: 'd' },
                { v: h, k: 'h' },
                { v: m, k: 'm' },
                { v: s, k: 's' },
              ].map(({ v, k }) => (
                <div key={k} className="min-w-16 rounded-xl bg-primary px-3 py-2.5 text-primary-foreground">
                  <div className="font-mono text-2xl font-bold tabular-nums sm:text-3xl">
                    {String(v).padStart(2, '0')}
                  </div>
                  <div className="text-[0.65rem] uppercase tracking-wider opacity-80">{k}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </SectionShell>
  );
}

// ───────────────────────────── video ─────────────────────────────

type VideoData = {
  title?: unknown;
  provider?: 'youtube' | 'vimeo';
  videoId?: string;
  poster?: Img;
};

export function VideoEmbed({ data, ctx }: SectionRendererProps<VideoData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const [playing, setPlaying] = useState(false);
  const id = (data.videoId || '').trim();
  if (!id) return null;

  // Only a bare id is accepted, so a tenant cannot paste an arbitrary URL and
  // have it embedded as an iframe src.
  if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) return null;

  const src =
    data.provider === 'vimeo'
      ? `https://player.vimeo.com/video/${id}?autoplay=1`
      : `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

  return (
    <SectionShell width="default">
      <SectionHeading title={t(data.title)} />
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
        {/* Click-to-play: an eager iframe costs ~700 KB and a third-party
            connection on every page load, for a video most visitors never start. */}
        {playing && ctx.mode === 'live' ? (
          <iframe
            src={src}
            title={t(data.title) || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative size-full"
            aria-label="Play video"
          >
            {data.poster?.url ? (
              <Image
                src={data.poster.url}
                alt={t(data.title) || ''}
                fill
                sizes="(max-width: 768px) 92vw, 768px"
                className="object-cover"
              />
            ) : (
              <span className="absolute inset-0 bg-neutral-900" />
            )}
            <span className="absolute inset-0 grid place-items-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="ml-0.5 size-7 fill-neutral-900">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    </SectionShell>
  );
}

// ───────────────────────────── image + text ─────────────────────────────

type ImageTextData = {
  title?: unknown;
  body?: unknown;
  image?: Img;
  imageSide?: 'left' | 'right';
  ctaText?: unknown;
  ctaTarget?: string;
};

export function ImageText({ data, ctx }: SectionRendererProps<ImageTextData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const right = data.imageSide === 'right';

  return (
    <SectionShell width="wide">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className={cn(right && 'lg:order-1')}>
          {data.image?.url ? (
            <Reveal direction={right ? 'left' : 'right'}>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={data.image.url}
                  alt={data.image.alt || t(data.title)}
                  fill
                  sizes="(max-width: 1024px) 92vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ) : null}
        </div>
        <div className={cn(right && 'lg:order-0')}>
          <SectionHeading title={t(data.title)} align="left" />
          {t(data.body) ? (
            <p className="whitespace-pre-line text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t(data.body)}
            </p>
          ) : null}
          {t(data.ctaText) ? (
            <div className="mt-6">
              <ScrollCta target={data.ctaTarget || 'order'} mode={ctx.mode}>
                {t(data.ctaText)}
              </ScrollCta>
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}

// ───────────────────────────── rich text ─────────────────────────────

type RichTextData = { title?: unknown; body?: unknown; align?: 'left' | 'center' };

export function RichText({ data, ctx }: SectionRendererProps<RichTextData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const body = t(data.body);
  if (!body && !t(data.title)) return null;

  return (
    <SectionShell width="narrow">
      <div className={data.align === 'center' ? 'text-center' : 'text-left'}>
        {t(data.title) ? (
          <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">{t(data.title)}</h2>
        ) : null}
        {/*
          whitespace-pre-line, never dangerouslySetInnerHTML. Tenants get
          paragraph breaks; they cannot inject markup or script into a page we
          serve on their own domain.
        */}
        <p className="whitespace-pre-line text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {body}
        </p>
      </div>
    </SectionShell>
  );
}
