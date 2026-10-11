'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { SectionShell, SectionHeading } from '@/components/shared/section-shell';
import { Reveal } from '@/components/shared/reveal';
import { ScrollCta } from '@/components/shared/scroll-cta';
import { formatMoney, discountPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { SectionRendererProps } from '../types';

type Data = {
  title?: unknown;
  productId?: string;
  showVariants?: boolean;
  savingsLabel?: unknown;
  ctaText?: unknown;
  bullets?: { text?: unknown }[];
};

/**
 * Prices are read from the product catalogue passed down in ctx, never typed
 * into the section. In the reference, the price lived in JSX in four separate
 * files and drifted — a discount shown on the pricing card that the sticky bar
 * and the order summary disagreed with.
 */
export function PricingCard({ data, ctx }: SectionRendererProps<Data>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);

  const product =
    ctx.products.find((p) => p.id === data.productId) ?? ctx.products[0] ?? null;

  const [variantId, setVariantId] = useState<string | null>(
    product?.variants?.[0]?.id ?? null
  );

  if (!product) {
    // Nothing to price yet. In the editor say so; on a live page stay silent
    // rather than render an empty card.
    return ctx.mode === 'preview' ? (
      <SectionShell width="default">
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Add a product in Products, then pick it in this section.
        </p>
      </SectionShell>
    ) : null;
  }

  const variant = product.variants?.find((v) => v.id === variantId) ?? null;
  const list = variant ? variant.price : product.basePrice;
  const sale = variant ? (variant.offerPrice ?? variant.price) : (product.offerPrice ?? product.basePrice);
  const off = discountPercent(list, sale);
  const bullets = (data.bullets ?? []).map((b) => t(b.text)).filter(Boolean);
  const image = variant?.image?.url || product.image?.url;

  return (
    <SectionShell width="default" id="pricing">
      <SectionHeading title={t(data.title)} />
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-card shadow-lg">
          {off ? (
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">
              {off}% OFF
            </div>
          ) : null}

          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:gap-8">
            {image ? (
              <div className="relative mx-auto size-36 overflow-hidden rounded-2xl bg-muted md:size-44">
                <Image src={image} alt={product.name} fill sizes="176px" className="object-cover" />
              </div>
            ) : null}

            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-card-foreground sm:text-2xl">
                {product.name}
                {variant ? <span className="text-muted-foreground"> — {variant.name}</span> : null}
              </h3>

              {data.showVariants && (product.variants?.length ?? 0) > 1 ? (
                <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVariantId(v.id)}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
                        v.id === variantId
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                      )}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 flex items-end justify-center gap-3 md:justify-start">
                <span className="text-3xl font-extrabold leading-none text-primary sm:text-4xl">
                  {formatMoney(sale, ctx.currency, ctx.locale)}
                </span>
                {sale < list ? (
                  <span className="pb-1 text-lg text-muted-foreground line-through">
                    {formatMoney(list, ctx.currency, ctx.locale)}
                  </span>
                ) : null}
              </div>

              {sale < list && t(data.savingsLabel) ? (
                <p className="mt-1.5 text-sm font-semibold text-emerald-600">
                  {t(data.savingsLabel)} {formatMoney(list - sale, ctx.currency, ctx.locale)}
                </p>
              ) : null}

              {bullets.length > 0 ? (
                <ul className="mt-5 space-y-2 text-left">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      {b}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-6">
                <ScrollCta target="order" mode={ctx.mode} size="lg" className="w-full sm:w-auto">
                  {t(data.ctaText) || 'Order'}
                </ScrollCta>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
