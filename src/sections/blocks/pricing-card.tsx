'use client';

/* eslint-disable @next/next/no-img-element -- product shots are tenant uploads from any host */

import { motion, useReducedMotion } from 'framer-motion';
import { Timer } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { formatMoney, discountPercent, toBengaliDigits } from '@/lib/format';
import { RichLine } from '@/components/shared/section-shell';
import { CtaButton } from '@/components/landing/cta-button';
import { useCountdown, formatClock } from '@/components/landing/use-countdown';
import type { SectionCtx, SectionRendererProps } from '../types';

type Data = {
  title?: unknown;
  productId?: string;
  productTitle?: unknown;
  image?: { url?: string; alt?: string };
  ribbonText?: string;
  savingsText?: unknown;
  showTimer?: boolean;
  timerLabel?: unknown;
  ctaText?: unknown;
  ctaTarget?: string;
};

/**
 * The product a commerce section shows, and its real prices. Prices are never
 * typed into copy: they come from the catalogue, so the page and the order
 * the server prices can never disagree.
 */
export function resolveOffer(ctx: SectionCtx, productId?: string) {
  const product = ctx.products.find((p) => p.id === productId) ?? ctx.products[0] ?? null;
  if (!product) return null;
  const list = product.basePrice;
  const sale = Math.min(product.offerPrice ?? product.basePrice, product.basePrice);
  const pct = discountPercent(list, sale);
  const num = (n: number) => (ctx.locale === 'bn' ? toBengaliDigits(n) : String(n));
  return {
    product,
    list,
    sale,
    saving: list - sale,
    pct,
    money: (n: number) => formatMoney(n, ctx.currency, ctx.locale),
    num,
  };
}

/** The reference MilkReady price card: ribbon, product jar, struck price, timer. */
export function PricingCard({ data, ctx }: SectionRendererProps<Data>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const reduce = useReducedMotion();
  const offer = resolveOffer(ctx, data.productId);
  const countdown = useCountdown();

  const image =
    data.image?.url?.trim() || offer?.product.image?.url?.trim() || ctx.brand.productImageUrl;
  const productTitle = t(data.productTitle) || offer?.product.name || ctx.brand.name;
  const ribbon = data.ribbonText?.trim() || (offer?.pct ? `${offer.pct}% OFF` : '');
  const savings =
    offer && offer.saving > 0
      ? (t(data.savingsText) || '{amount}')
          .replace('{amount}', offer.money(offer.saving))
          .replace('{percent}', offer.num(offer.pct ?? 0))
      : '';
  const ctaText = t(data.ctaText);

  const enter = (from: Record<string, number>) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, ...from },
          whileInView: { opacity: 1, y: 0, scale: 1 },
          viewport: { once: true },
          transition: { duration: 0.5 },
        };

  return (
    <section className="border-t border-slate-200/60 bg-slate-50 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-md text-center">
        {t(data.title) ? (
          <motion.div {...enter({ y: 15 })} className="mb-6">
            <h2 className="text-xl font-extrabold leading-snug text-slate-800 sm:text-2xl">
              <RichLine text={t(data.title)} />
            </h2>
          </motion.div>
        ) : null}

        <motion.div
          {...enter({ scale: 0.95 })}
          className="relative overflow-hidden rounded-3xl border-2 border-primary-tint bg-white p-6 shadow-md"
        >
          {ribbon ? (
            <div className="absolute -right-[34px] top-4 rotate-45 bg-primary px-10 py-1 text-[10px] font-black uppercase tracking-wider text-primary-foreground shadow-sm sm:text-xs">
              {ribbon}
            </div>
          ) : null}

          <div className="relative mx-auto mb-4 flex size-32 items-center justify-center sm:size-40">
            <img src={image} alt={productTitle} loading="lazy" decoding="async" className="size-full object-contain drop-shadow-xl" />
          </div>

          <h3 className="mb-3 text-lg font-extrabold text-slate-900">{productTitle}</h3>

          {offer ? (
            <div className="mb-4 flex flex-col items-center gap-1">
              <div className="flex items-baseline justify-center gap-3">
                {offer.saving > 0 ? (
                  <span className="text-base font-bold text-slate-400 line-through sm:text-lg">{offer.money(offer.list)}</span>
                ) : null}
                <span className="text-3xl font-black tracking-tight text-primary sm:text-4xl">{offer.money(offer.sale)}</span>
              </div>
              {savings ? (
                <div className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {savings}
                </div>
              ) : null}
            </div>
          ) : null}

          {data.showTimer && countdown ? (
            <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-primary-tint bg-primary-soft px-3 py-2 text-xs font-medium text-slate-700">
              <Timer className="size-4 shrink-0 text-primary" />
              {t(data.timerLabel) ? <span>{t(data.timerLabel)}</span> : null}
              <span className="font-mono text-sm font-bold text-primary">{formatClock(countdown)}</span>
            </div>
          ) : null}

          {ctaText ? (
            <CtaButton mode={ctx.mode} target={data.ctaTarget} weight="black" className="w-full sm:w-full">
              {ctaText}
            </CtaButton>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
