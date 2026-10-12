'use client';

/* eslint-disable @next/next/no-img-element --
   Tenant images come from anywhere (Cloudinary, local uploads, pasted URLs);
   a plain <img> renders them all, exactly as the reference page did. */

import { motion, useReducedMotion } from 'framer-motion';
import { Check, ShieldCheck, X } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { RichLine, plainRich } from '@/components/shared/section-shell';
import { CtaButton } from '@/components/landing/cta-button';
import type { SectionRendererProps } from '../types';

type Img = { url?: string; alt?: string };
type Point = { text?: unknown };

/** whileInView fade/rise, the reference's per-section entrance. */
function useInView() {
  const reduce = useReducedMotion();
  return (from: Record<string, number>, delay = 0, duration = 0.5) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, ...from },
          whileInView: { opacity: 1, x: 0, y: 0, scale: 1 },
          viewport: { once: true },
          transition: { duration, delay },
        };
}

// ───────────────────────────── imagine (before / after) ─────────────────────────────

type ImagineData = {
  title?: unknown;
  image?: Img;
  closingLine?: unknown;
  ctaText?: unknown;
  ctaTarget?: string;
};

export function Imagine({ data, ctx }: SectionRendererProps<ImagineData>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const enter = useInView();
  const title = t(data.title);
  const closing = t(data.closingLine);
  const ctaText = t(data.ctaText);
  const src = data.image?.url?.trim();

  return (
    <section className="overflow-hidden border-y border-slate-200/60 bg-slate-50 pb-8 pt-6 md:pb-12 md:pt-8">
      {title ? (
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2
            {...enter({ y: 15 })}
            className="mb-6 px-2 text-lg font-bold leading-snug text-slate-800 sm:text-2xl md:text-3xl"
          >
            <RichLine text={title} brandClassName="font-black text-primary" />
          </motion.h2>
        </div>
      ) : null}

      {src ? (
        <motion.div {...enter({ scale: 0.99 }, 0, 0.6)} className="mx-auto w-full max-w-4xl px-0 sm:px-4 md:px-6">
          <div className="overflow-hidden rounded-none sm:rounded-2xl sm:border sm:border-slate-200/80 sm:shadow-lg md:rounded-3xl">
            <img
              src={src}
              alt={data.image?.alt || plainRich(title)}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full rounded-none object-contain sm:rounded-2xl md:rounded-3xl"
            />
          </div>
        </motion.div>
      ) : null}

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {closing ? (
          <p className="mb-5 mt-6 text-base font-bold text-slate-800 sm:text-lg">
            <RichLine text={closing} />
          </p>
        ) : null}
        {ctaText ? (
          <div className="flex w-full justify-center">
            <CtaButton mode={ctx.mode} target={data.ctaTarget}>
              {ctaText}
            </CtaButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ───────────────────────────── comparison (two paths) ─────────────────────────────

type ComparisonData = {
  eyebrow?: unknown;
  circledText?: unknown;
  title?: unknown;
  subtitle?: unknown;
  leftLabel?: unknown;
  leftTag?: unknown;
  leftItems?: Point[];
  rightBadge?: unknown;
  rightLabel?: unknown;
  rightItems?: Point[];
  closingLine?: unknown;
  closingHighlight?: unknown;
  closingQuestion?: unknown;
  ctaText?: unknown;
  ctaTarget?: string;
};

export function Comparison({ data, ctx }: SectionRendererProps<ComparisonData>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const enter = useInView();
  const reduce = useReducedMotion();

  const circled = t(data.circledText);
  const left = (data.leftItems ?? []).map((p) => t(p.text)).filter(Boolean);
  const right = (data.rightItems ?? []).map((p) => t(p.text)).filter(Boolean);
  const ctaText = t(data.ctaText);

  return (
    <section className="relative overflow-hidden bg-[#0f172a] px-4 py-12 text-white md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{ background: 'color-mix(in oklab, var(--accent-strong) 12%, transparent)' }}
      />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-8 text-center sm:mb-12">
          {t(data.eyebrow) ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-accent sm:text-sm">
              {t(data.eyebrow)}
            </p>
          ) : null}
          <motion.h2
            {...enter({ y: 15 }, 0, 0.6)}
            className="mb-3 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl"
          >
            {circled ? (
              <span className="relative inline-block px-2 text-brand-accent">
                {circled}
                <motion.svg
                  initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
                  whileInView={reduce ? undefined : { pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[120%] -translate-x-1/2 -translate-y-1/2 text-brand-accent"
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path
                    d="M15,32 C5,25 5,10 25,5 C60,-5 95,5 95,20 C95,35 60,40 30,38 C15,37 10,32 10,25"
                    vectorEffect="non-scaling-stroke"
                  />
                </motion.svg>
              </span>
            ) : null}{' '}
            {t(data.title)}
          </motion.h2>
          {t(data.subtitle) ? (
            <p className="text-base font-medium text-slate-400 sm:text-lg">{t(data.subtitle)}</p>
          ) : null}
        </div>

        <div className="mb-10 grid gap-5 sm:gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-rose-500/20 bg-slate-900/80 p-5 backdrop-blur-sm sm:p-7">
            <h3 className="mb-4 flex items-center justify-between border-b border-rose-500/20 pb-3 text-sm font-bold uppercase tracking-wider text-rose-400 sm:text-base">
              <span>{t(data.leftLabel)}</span>
              {t(data.leftTag) ? (
                <span className="text-xs font-normal text-rose-400/70">{t(data.leftTag)}</span>
              ) : null}
            </h3>
            <ul className="space-y-3">
              {left.map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  <X className="mt-0.5 size-4.5 shrink-0 text-rose-400" strokeWidth={2.5} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl border-2 bg-slate-900 p-5 shadow-xl backdrop-blur-sm sm:p-7"
            style={{
              borderColor: 'color-mix(in oklab, var(--accent-strong) 50%, transparent)',
              backgroundImage:
                'linear-gradient(to bottom right, color-mix(in oklab, var(--primary) 30%, #0f172a), #0f172a, #0f172a)',
            }}
          >
            {t(data.rightBadge) ? (
              <div className="absolute right-0 top-0 rounded-bl-xl bg-brand-accent px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 sm:text-xs">
                {t(data.rightBadge)}
              </div>
            ) : null}
            <h3
              className="mb-4 flex items-center justify-between border-b pb-3 text-sm font-bold uppercase tracking-wider text-brand-accent sm:text-base"
              style={{ borderColor: 'color-mix(in oklab, var(--accent-strong) 30%, transparent)' }}
            >
              <span>{t(data.rightLabel)}</span>
            </h3>
            <ul className="space-y-3">
              {right.map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-xs font-medium leading-relaxed text-slate-100 sm:text-sm">
                  <Check className="mt-0.5 size-4.5 shrink-0 text-brand-accent" strokeWidth={3} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3 text-center">
          {t(data.closingLine) ? (
            <p className="text-base font-semibold text-slate-300 sm:text-lg">{t(data.closingLine)}</p>
          ) : null}
          {t(data.closingHighlight) ? (
            <p className="text-lg font-extrabold text-brand-accent sm:text-xl">{t(data.closingHighlight)}</p>
          ) : null}
          {t(data.closingQuestion) ? (
            <p className="mb-4 text-xs text-slate-400 sm:text-sm">{t(data.closingQuestion)}</p>
          ) : null}
          {ctaText ? (
            <div className="flex w-full justify-center">
              <CtaButton mode={ctx.mode} target={data.ctaTarget}>
                {ctaText}
              </CtaButton>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────── emotional cost ─────────────────────────────

type CostData = {
  image?: Img;
  title?: unknown;
  highlight?: unknown;
  body?: unknown;
  aside?: unknown;
  conclusion?: unknown;
  emoji?: string;
};

export function EmotionalCost({ data, ctx }: SectionRendererProps<CostData>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const enter = useInView();
  const title = t(data.title);
  const src = data.image?.url?.trim();

  return (
    <section className="overflow-hidden border-b border-slate-200/60 bg-white py-8 md:py-16">
      {src ? (
        <motion.div {...enter({ scale: 0.99 }, 0, 0.6)} className="mx-auto mb-6 w-full max-w-4xl px-0 sm:px-4 md:mb-8 md:px-6">
          <div className="overflow-hidden rounded-none sm:rounded-2xl sm:border sm:border-slate-200/80 sm:shadow-lg md:rounded-3xl">
            <img
              src={src}
              alt={data.image?.alt || plainRich(title)}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full rounded-none object-contain sm:rounded-2xl md:rounded-3xl"
            />
          </div>
        </motion.div>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        {title ? (
          <motion.h2
            {...enter({ y: 15 })}
            className="mb-5 text-xl font-extrabold leading-snug text-slate-800 sm:text-2xl md:text-3xl"
          >
            <RichLine text={title} />
          </motion.h2>
        ) : null}

        <div className="mx-auto flex max-w-xl flex-col gap-3 text-xs leading-relaxed text-slate-700 sm:text-sm md:text-base">
          {t(data.highlight) ? (
            <div className="rounded-xl border border-rose-200/60 bg-rose-50 p-3.5 font-medium text-rose-900">
              <RichLine text={t(data.highlight)} brandClassName="font-extrabold text-rose-950" />
            </div>
          ) : null}
          {t(data.body) ? <p className="mt-1">{t(data.body)}</p> : null}
          {t(data.aside) ? <p className="italic text-slate-600">{t(data.aside)}</p> : null}
          {t(data.conclusion) ? (
            <p className="mt-2 text-sm font-bold text-slate-900 sm:text-base">{t(data.conclusion)}</p>
          ) : null}
          {data.emoji ? <div className="mt-2 select-none text-4xl">{data.emoji}</div> : null}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────────── guarantee ─────────────────────────────

type GuaranteeData = {
  title?: unknown;
  subtitle?: unknown;
  cardTitle?: unknown;
  text?: unknown;
  badgeImage?: Img;
};

export function Guarantee({ data, ctx }: SectionRendererProps<GuaranteeData>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const enter = useInView();
  const badge = data.badgeImage?.url?.trim();

  return (
    <section className="bg-white px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <motion.div {...enter({ y: 15 })}>
          {t(data.title) ? (
            <h2 className="mb-2 text-xl font-extrabold text-slate-800 sm:text-2xl">
              <RichLine text={t(data.title)} />
            </h2>
          ) : null}
          {t(data.subtitle) ? (
            <p className="mb-6 text-xs font-medium text-slate-600 sm:text-sm md:text-base">{t(data.subtitle)}</p>
          ) : null}
        </motion.div>

        <motion.div
          {...enter({ scale: 0.96 }, 0.1)}
          className="mx-auto max-w-lg rounded-2xl border-2 border-primary-tint bg-gradient-to-b from-primary-soft to-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-3 flex justify-center">
            {badge ? (
              <img src={badge} alt="" className="size-14 object-contain" loading="lazy" decoding="async" />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full bg-primary-tint text-primary">
                <ShieldCheck className="size-7" />
              </div>
            )}
          </div>
          {t(data.cardTitle) ? (
            <h3 className="mb-2 text-base font-extrabold text-slate-900 sm:text-lg">{t(data.cardTitle)}</h3>
          ) : null}
          {t(data.text) ? (
            <p className="text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">{t(data.text)}</p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
