'use client';

/* eslint-disable @next/next/no-img-element -- badges and doctor photos are tenant uploads from any host */

import { motion, useReducedMotion } from 'framer-motion';
import {
  Award, BadgeCheck, ChevronLeft, ChevronRight, FlaskConical, Heart, Leaf, Quote,
  ShieldCheck, Sprout, Star, type LucideIcon,
} from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { cn } from '@/lib/utils';
import { CtaButton } from '@/components/landing/cta-button';
import { useAutoCarousel } from '@/components/landing/use-auto-carousel';
import type { SectionRendererProps } from '../types';

const ICONS: Record<string, LucideIcon> = {
  award: Award,
  badgeCheck: BadgeCheck,
  sprout: Sprout,
  shieldCheck: ShieldCheck,
  flask: FlaskConical,
  leaf: Leaf,
  heart: Heart,
  star: Star,
};

type Img = { url?: string; alt?: string };

type Data = {
  title?: unknown;
  subtitle?: unknown;
  items?: { label?: unknown; icon?: string; image?: Img }[];
  doctors?: { name?: unknown; degree?: string; description?: unknown; image?: Img }[];
  doctorBadge?: unknown;
  doctorTag?: string;
  autoplayMs?: number;
  ctaText?: unknown;
  ctaTarget?: string;
};

const arrow =
  'absolute top-1/2 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-primary/15 bg-white text-primary shadow-lg transition-all hover:bg-primary hover:text-primary-foreground md:size-12';

/**
 * The reference MilkReady "reasons to trust" section: a row of certification
 * badges, then a carousel of doctors recommending the product.
 */
export function Certifications({ data, ctx }: SectionRendererProps<Data>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const reduce = useReducedMotion();
  const certs = data.items ?? [];
  const doctors = data.doctors ?? [];
  const { ref, index, setIndex, next, prev, hoverProps } = useAutoCarousel({
    count: doctors.length,
    autoplayMs: data.autoplayMs ?? 5000,
    enabled: ctx.mode === 'live',
    align: 'start',
  });
  const ctaText = t(data.ctaText);

  return (
    <section className="relative overflow-hidden bg-background py-8 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-center md:mb-12">
          {t(data.title) ? (
            <h2 className="text-2xl font-extrabold leading-tight text-primary sm:text-3xl md:text-4xl lg:text-5xl">
              {t(data.title)}
            </h2>
          ) : null}
          {t(data.subtitle) ? (
            <p className="mt-2 text-sm font-medium text-[#1A1A1A]/70 sm:text-base">{t(data.subtitle)}</p>
          ) : null}
        </div>

        {certs.length > 0 ? (
          <div className="mb-6 md:mb-16">
            <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-2 gap-y-5 sm:gap-6 md:gap-8">
              {certs.map((cert, i) => {
                const Icon = ICONS[cert.icon || ''] ?? Award;
                return (
                  <div key={i} className="flex w-[30%] flex-col items-center gap-2 text-center sm:w-auto sm:flex-1">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/10 bg-white text-primary shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-transform hover:scale-105 md:size-14">
                      {cert.image?.url ? (
                        <img src={cert.image.url} alt={t(cert.label)} className="size-8 object-contain md:size-9" loading="lazy" decoding="async" />
                      ) : (
                        <Icon className="size-6 md:size-7" />
                      )}
                    </div>
                    <h4 className="px-1 text-[11px] font-bold leading-tight text-[#1A1A1A] sm:text-xs md:text-sm">
                      {t(cert.label)}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {doctors.length > 0 ? (
          <div className="relative mx-auto max-w-5xl px-1 sm:px-4" {...hoverProps}>
            {doctors.length > 1 ? (
              <>
                <button type="button" onClick={prev} aria-label="Previous doctor" className={cn(arrow, '-left-2 sm:-left-6 md:-left-12')}>
                  <ChevronLeft className="size-5 md:size-6" />
                </button>
                <button type="button" onClick={next} aria-label="Next doctor" className={cn(arrow, '-right-2 sm:-right-6 md:-right-12')}>
                  <ChevronRight className="size-5 md:size-6" />
                </button>
              </>
            ) : null}

            <div ref={ref} className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-4 pt-2 sm:mx-0 sm:gap-6 sm:px-0">
              {doctors.map((doc, idx) => (
                <motion.div
                  key={idx}
                  initial={reduce ? undefined : { opacity: 0, scale: 0.95 }}
                  whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'flex min-w-[92vw] snap-center flex-col justify-between rounded-2xl border bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 sm:min-w-[360px] sm:rounded-3xl sm:p-8 md:min-w-[420px] lg:min-w-[460px]',
                    idx === index ? 'border-primary/40 ring-2 ring-primary/10' : 'border-primary/10'
                  )}
                >
                  <div>
                    <div className="mb-3 flex items-center gap-3 sm:mb-5">
                      <div className="size-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-background shadow-sm sm:size-16">
                        {doc.image?.url ? (
                          <img src={doc.image.url} alt={t(doc.name)} loading="lazy" decoding="async" className="size-full object-cover object-top" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-extrabold leading-snug text-[#1A1A1A] sm:text-lg">{t(doc.name)}</h3>
                        {doc.degree ? (
                          <p className="truncate text-[11px] font-semibold text-[#1A1A1A]/60 sm:text-sm">{doc.degree}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mb-2 flex items-center gap-1 text-amber-400 sm:mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-amber-400 sm:size-4" />
                      ))}
                    </div>

                    <div className="relative">
                      <Quote className="absolute -left-1 -top-1 size-6 rotate-180 text-primary/10 sm:size-8" />
                      <p className="relative z-10 border-l-2 border-primary/30 pl-3 text-xs font-medium italic leading-snug text-[#1A1A1A]/85 sm:pl-4 sm:text-base sm:leading-relaxed">
                        {t(doc.description)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-primary/10 pt-2.5 sm:mt-6 sm:pt-4">
                    {t(data.doctorBadge) ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary sm:text-xs">
                        <ShieldCheck className="size-3.5 sm:size-4" />
                        {t(data.doctorBadge)}
                      </span>
                    ) : (
                      <span />
                    )}
                    {data.doctorTag ? (
                      <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold text-[#1A1A1A]/50 sm:px-2.5 sm:py-1 sm:text-[11px]">
                        {data.doctorTag}
                      </span>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>

            {doctors.length > 1 ? (
              <div className="mt-6 flex items-center justify-center gap-2">
                {doctors.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIndex(idx)}
                    aria-label={`Go to doctor ${idx + 1}`}
                    className={cn(
                      'h-2.5 rounded-full transition-all duration-300',
                      idx === index ? 'w-8 bg-primary' : 'w-2.5 bg-primary/20 hover:bg-primary/40'
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {ctaText ? (
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 15 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex w-full justify-center md:mt-14"
          >
            <CtaButton mode={ctx.mode} target={data.ctaTarget} weight="black">
              {ctaText}
            </CtaButton>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
