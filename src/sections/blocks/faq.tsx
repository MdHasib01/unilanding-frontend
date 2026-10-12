'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { RichLine } from '@/components/shared/section-shell';
import { CtaButton } from '@/components/landing/cta-button';
import type { SectionRendererProps } from '../types';

type Data = {
  title?: unknown;
  items?: { q?: unknown; a?: unknown }[];
  /** 1-based; 0 opens none. */
  defaultOpen?: number;
  initialVisible?: number;
  showMoreText?: unknown;
  showLessText?: unknown;
  ctaText?: unknown;
  ctaTarget?: string;
};

/**
 * The reference MilkReady FAQ: white cards with a +/− toggle, the first few
 * questions visible and the rest behind "আরও প্রশ্ন দেখুন".
 */
export function Faq({ data, ctx }: SectionRendererProps<Data>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const items = (data.items ?? []).filter((i) => t(i.q));
  const initial = Math.max(1, Number(data.initialVisible) || items.length);
  const [showAll, setShowAll] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(
    Number(data.defaultOpen) > 0 ? Number(data.defaultOpen) - 1 : null
  );

  if (items.length === 0) return null;

  const visible = showAll ? items : items.slice(0, initial);
  const hasMore = items.length > initial;
  const ctaText = t(data.ctaText);

  return (
    <section className="border-y border-slate-200/60 bg-slate-50 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-3xl">
        {t(data.title) ? (
          <div className="mb-8 text-center">
            <h2 className="text-xl font-extrabold leading-snug text-slate-800 sm:text-2xl md:text-3xl">
              <RichLine text={t(data.title)} />
            </h2>
          </div>
        ) : null}

        <div className="mb-6 space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-bold text-slate-800 transition-colors hover:text-primary sm:px-5 sm:py-4 sm:text-base"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <span>{t(faq.q)}</span>
                    <span className="ml-3 shrink-0 text-xl font-semibold text-primary">{isOpen ? '−' : '+'}</span>
                  </button>

                  <AnimatePresence>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 px-4 pb-4 pt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                          {t(faq.a)}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-4">
          {hasMore ? (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-primary-soft hover:text-primary sm:text-sm"
            >
              {showAll ? (
                <>
                  {t(data.showLessText) || 'কমিয়ে দেখুন'} <ChevronUp className="size-4" />
                </>
              ) : (
                <>
                  {t(data.showMoreText) || 'আরও প্রশ্ন দেখুন'} <ChevronDown className="size-4" />
                </>
              )}
            </button>
          ) : null}

          {ctaText ? (
            <CtaButton mode={ctx.mode} target={data.ctaTarget}>
              {ctaText}
            </CtaButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
