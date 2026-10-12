'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { tt } from '@/lib/i18n-text';
import { RichLine } from '@/components/shared/section-shell';
import { GridPattern } from '@/components/landing/grid-pattern';
import { CtaButton } from '@/components/landing/cta-button';
import type { SectionRendererProps } from '../types';

type Data = {
  title?: unknown;
  titleHighlight?: unknown;
  subtitle?: unknown;
  ctaText?: unknown;
  ctaTarget?: string;
  showMessenger?: boolean;
  messengerText?: unknown;
  messengerUrl?: string;
};

function MessengerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.51 3.734 7.214V22l3.425-1.881c.905.251 1.864.387 2.841.387 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.09 12.441l-2.55-2.72-4.976 2.72 5.474-5.81 2.597 2.72 4.929-2.72-5.474 5.81z" />
    </svg>
  );
}

/** Only http(s) links leave the page; anything else is dropped. */
const safeUrl = (href?: string) => (href && /^https?:\/\//i.test(href.trim()) ? href.trim() : '');

/**
 * The reference MilkReady hero: centred two-line headline (second line in the
 * brand colour), a pill of supporting copy, and the yellow order CTA beside an
 * outlined Messenger button. Sits under the sticky announcement bar.
 */
export function Hero({ data, ctx }: SectionRendererProps<Data>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const reduce = useReducedMotion();

  const title = t(data.title);
  const second = t(data.titleHighlight);
  const subtitle = t(data.subtitle);
  const ctaText = t(data.ctaText);
  const messengerText = t(data.messengerText);
  const messengerUrl = safeUrl(data.messengerUrl);

  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay } };

  return (
    <section className="relative isolate flex w-full max-w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary-soft via-background to-white pb-5 pt-7 md:pb-8 md:pt-10">
      <GridPattern size={32} className="opacity-20" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 -z-10 h-[32rem] max-w-full overflow-hidden"
        style={{ background: 'radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--accent-strong) 22%, transparent), transparent)' }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <motion.div {...rise(0.1)} className="mx-auto mb-3 w-full max-w-3xl md:mb-4">
          {title ? (
            <h1 className="mb-2 max-w-full break-words text-center text-2xl font-black leading-[1.2] tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              {title}
            </h1>
          ) : null}
          {second ? (
            <h2 className="max-w-full break-words text-center text-xl font-extrabold leading-tight text-primary sm:text-3xl md:text-4xl">
              {second}
            </h2>
          ) : null}
        </motion.div>

        {subtitle ? (
          <motion.div {...rise(0.2)} className="mx-auto mb-4 w-full max-w-2xl px-2 sm:mb-5">
            <div className="relative overflow-hidden rounded-full border border-primary-tint bg-gradient-to-r from-primary-soft via-white to-primary-soft px-4 py-3 shadow-sm sm:px-6 sm:py-3.5">
              <p className="text-center text-xs font-semibold leading-relaxed text-slate-700 sm:text-base">
                <RichLine text={subtitle} brandClassName="font-extrabold text-slate-950" />
              </p>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          {...rise(0.3)}
          className="flex w-full max-w-full flex-col items-center justify-center gap-3.5 px-2 sm:flex-row sm:px-0"
        >
          {ctaText ? (
            <CtaButton mode={ctx.mode} target={data.ctaTarget} size="md" className="w-full sm:w-auto sm:whitespace-nowrap">
              {ctaText}
            </CtaButton>
          ) : null}

          {data.showMessenger && messengerText && messengerUrl ? (
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border-2 border-primary bg-transparent px-6 py-3 text-center text-sm font-bold text-primary transition-all hover:bg-primary-soft active:scale-95 sm:h-12 sm:w-auto sm:px-8 sm:py-0 sm:text-base"
            >
              <MessengerIcon className="size-5 shrink-0" />
              <span>{messengerText}</span>
            </a>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
