'use client';

/* eslint-disable @next/next/no-img-element -- reviewer photos are tenant uploads from any host */

import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { cn } from '@/lib/utils';
import { RichLine } from '@/components/shared/section-shell';
import { CtaButton } from '@/components/landing/cta-button';
import { useAutoCarousel } from '@/components/landing/use-auto-carousel';
import type { SectionRendererProps } from '../types';

type Review = {
  name?: string;
  location?: unknown;
  rating?: number;
  text?: unknown;
  image?: { url?: string; alt?: string };
  timeAgo?: unknown;
  verified?: boolean;
};

type Data = {
  title?: unknown;
  subtitle?: unknown;
  autoplayMs?: number;
  verifiedLabel?: unknown;
  items?: Review[];
  ctaText?: unknown;
  ctaTarget?: string;
};

const arrow =
  'absolute top-1/2 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-primary-tint bg-white text-primary shadow-lg transition-all hover:bg-primary hover:text-primary-foreground md:size-11';

/** The reference MilkReady "other mothers" review carousel. */
export function ReviewsCarousel({ data, ctx }: SectionRendererProps<Data>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const reduce = useReducedMotion();
  const items = data.items ?? [];
  const { ref, index, setIndex, next, prev, hoverProps } = useAutoCarousel({
    count: items.length,
    autoplayMs: data.autoplayMs ?? 5000,
    enabled: ctx.mode === 'live',
  });

  if (items.length === 0) return null;
  const ctaText = t(data.ctaText);

  return (
    <section className="overflow-hidden border-y border-slate-200/60 bg-slate-50 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 15 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center sm:mb-10"
        >
          {t(data.title) ? (
            <h2 className="mb-2 text-xl font-extrabold leading-snug text-slate-800 sm:text-2xl md:text-3xl">
              <RichLine text={t(data.title)} />
            </h2>
          ) : null}
          {t(data.subtitle) ? (
            <p className="text-sm font-medium text-slate-600 sm:text-base">{t(data.subtitle)}</p>
          ) : null}
        </motion.div>

        <div className="relative mx-auto mb-8 max-w-5xl px-1 sm:px-4" {...hoverProps}>
          {items.length > 1 ? (
            <>
              <button type="button" onClick={prev} aria-label="Previous review" className={cn(arrow, '-left-2 sm:-left-5 md:-left-6')}>
                <ChevronLeft className="size-5 md:size-6" />
              </button>
              <button type="button" onClick={next} aria-label="Next review" className={cn(arrow, '-right-2 sm:-right-5 md:-right-6')}>
                <ChevronRight className="size-5 md:size-6" />
              </button>
            </>
          ) : null}

          <div ref={ref} className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 pt-2 sm:mx-0 sm:gap-6 sm:px-0">
            {items.map((rev, idx) => {
              const rating = Math.max(0, Math.min(5, Math.round(Number(rev.rating) || 0)));
              return (
                <motion.div
                  key={idx}
                  initial={reduce ? undefined : { opacity: 0, scale: 0.95 }}
                  whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'relative flex min-w-[88vw] snap-center flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 sm:min-w-[340px] sm:rounded-3xl sm:p-7 md:min-w-[420px] lg:min-w-[460px]',
                    idx === index ? 'border-primary/40 shadow-md ring-2 ring-primary-tint' : 'border-slate-200/80'
                  )}
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-primary-tint bg-primary-soft shadow-xs sm:size-14">
                          {rev.image?.url ? (
                            <img src={rev.image.url} alt={rev.name || ''} loading="lazy" decoding="async" className="size-full object-cover" />
                          ) : (
                            <span className="flex size-full items-center justify-center text-base font-bold text-primary">
                              {(rev.name || '?').slice(0, 1)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold leading-tight text-slate-800 sm:text-base">{rev.name}</h4>
                          {t(rev.location) ? (
                            <p className="text-xs font-medium text-slate-500">{t(rev.location)}</p>
                          ) : null}
                        </div>
                      </div>

                      {rating > 0 ? (
                        <div className="flex shrink-0 items-center gap-0.5 text-amber-400" aria-label={`${rating} out of 5`}>
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="size-4 fill-amber-400" />
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="relative my-2 border-l-2 border-primary-tint pl-3 sm:pl-4">
                      <Quote className="absolute -left-1 -top-1.5 size-5 rotate-180 text-primary-tint opacity-50" />
                      <p className="relative z-10 text-xs italic leading-relaxed text-slate-700 sm:text-sm">
                        &ldquo;{t(rev.text)}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500 sm:text-xs">
                    {rev.verified !== false && t(data.verifiedLabel) ? (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <CheckCircle2 className="size-3.5" /> {t(data.verifiedLabel)}
                      </span>
                    ) : (
                      <span />
                    )}
                    {t(rev.timeAgo) ? (
                      <span className="rounded-full border border-slate-200/60 bg-slate-50 px-2 py-0.5 font-medium">
                        {t(rev.timeAgo)}
                      </span>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {items.length > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setIndex(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  className={cn(
                    'h-2.5 cursor-pointer rounded-full transition-all duration-300',
                    idx === index ? 'w-8 bg-primary' : 'w-2.5 bg-primary-tint hover:bg-primary/40'
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        {ctaText ? (
          <div className="flex w-full justify-center text-center">
            <CtaButton mode={ctx.mode} target={data.ctaTarget}>
              {ctaText}
            </CtaButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
