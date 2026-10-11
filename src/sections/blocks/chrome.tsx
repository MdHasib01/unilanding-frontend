'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Phone, ArrowUp, MessageCircle } from 'lucide-react';
import { SOCIAL_ICONS, type SocialPlatform } from '@/components/shared/social-icons';
import { tt } from '@/lib/i18n-text';
import { ScrollCta } from '@/components/shared/scroll-cta';
import { cn } from '@/lib/utils';
import type { SectionRendererProps } from '../types';

type T = (v: unknown) => string;

// ───────────────────────────── footer ─────────────────────────────

type FooterData = {
  text?: unknown;
  phone?: string;
  email?: string;
  address?: unknown;
  links?: { label?: unknown; href?: string }[];
  socials?: { platform?: string; href?: string }[];
  showPoweredBy?: boolean;
};

/** Only http(s) links are rendered, so a tenant cannot inject a javascript: URL. */
const safeHref = (href?: string): string | null => {
  if (!href) return null;
  try {
    const u = new URL(href, 'https://example.com');
    return u.protocol === 'http:' || u.protocol === 'https:' ? href : null;
  } catch {
    return null;
  }
};

export function Footer({ data, ctx }: SectionRendererProps<FooterData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const year = new Date().getFullYear();
  const links = (data.links ?? []).filter((l) => safeHref(l.href) && t(l.label));
  const socials = (data.socials ?? []).filter((s) => safeHref(s.href) && s.platform);

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-11 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            {ctx.tenant.logo?.url ? (
              <div className="relative h-9 w-9 overflow-hidden rounded-lg">
                <Image src={ctx.tenant.logo.url} alt={ctx.tenant.name} fill sizes="36px" className="object-contain" />
              </div>
            ) : null}
            <span className="text-lg font-bold text-card-foreground">{ctx.tenant.name}</span>
          </div>
          {t(data.text) ? (
            <p className="mt-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
              {t(data.text)}
            </p>
          ) : null}

          {socials.length > 0 ? (
            <div className="mt-4 flex gap-2">
              {socials.map((sc, i) => {
                const Icon = SOCIAL_ICONS[sc.platform as SocialPlatform] ?? MessageCircle;
                return (
                  <a
                    key={i}
                    href={safeHref(sc.href)!}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label={sc.platform}
                    className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-card-foreground">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {(data.phone || ctx.tenant.contact?.phone) ? (
              <li>
                <a href={`tel:${data.phone || ctx.tenant.contact?.phone}`} className="hover:text-primary">
                  {data.phone || ctx.tenant.contact?.phone}
                </a>
              </li>
            ) : null}
            {(data.email || ctx.tenant.contact?.email) ? (
              <li>
                <a href={`mailto:${data.email || ctx.tenant.contact?.email}`} className="hover:text-primary">
                  {data.email || ctx.tenant.contact?.email}
                </a>
              </li>
            ) : null}
            {t(data.address) || ctx.tenant.contact?.address ? (
              <li className="whitespace-pre-line">{t(data.address) || ctx.tenant.contact?.address}</li>
            ) : null}
          </ul>
        </div>

        {links.length > 0 ? (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-card-foreground">Links</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {links.map((l, i) => (
                <li key={i}>
                  <a href={safeHref(l.href)!} className="hover:text-primary">{t(l.label)}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} {ctx.tenant.name}</p>
          {/* White-label tenants pay to remove this. */}
          {data.showPoweredBy !== false && !ctx.tenant.whiteLabel ? (
            <p>Powered by UniLanding</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

// ───────────────────────────── sticky CTA ─────────────────────────────

type StickyData = {
  text?: unknown;
  ctaText?: unknown;
  target?: string;
  showAfterPx?: number;
  mobileOnly?: boolean;
};

export function StickyCta({ data, ctx }: SectionRendererProps<StickyData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const threshold = data.showAfterPx ?? 600;
  // Always visible in the preview, otherwise a tenant editing this section
  // would never see what they are editing.
  const [shown, setShown] = useState(ctx.mode === 'preview');

  useEffect(() => {
    if (ctx.mode === 'preview') return;
    const onScroll = () => setShown(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, ctx.mode]);

  if (!shown) return null;

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur',
        'supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        data.mobileOnly && 'sm:hidden'
      )}
    >
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3">
        {t(data.text) ? (
          <p className="min-w-0 truncate text-sm font-semibold text-card-foreground">{t(data.text)}</p>
        ) : (
          <span />
        )}
        <ScrollCta target={data.target || 'order'} mode={ctx.mode} className="shrink-0">
          {t(data.ctaText) || 'Order'}
        </ScrollCta>
      </div>
    </div>
  );
}

// ───────────────────────── floating actions ─────────────────────────

type FloatData = {
  whatsappNumber?: string;
  whatsappMessage?: unknown;
  callNumber?: string;
  backToTop?: boolean;
};

export function FloatingActions({ data, ctx }: SectionRendererProps<FloatData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    if (ctx.mode === 'preview') return;
    const onScroll = () => setShowTop(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ctx.mode]);

  const wa = (data.whatsappNumber || ctx.tenant.contact?.whatsapp || '').replace(/\D/g, '');
  const call = data.callNumber || ctx.tenant.contact?.phone || '';

  if (!wa && !call && !data.backToTop) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 right-3 z-40 flex flex-col gap-2 sm:bottom-6 sm:right-5',
        'supports-[padding:max(0px)]:mb-[env(safe-area-inset-bottom)]'
      )}
    >
      {wa ? (
        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent(t(data.whatsappMessage))}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
        >
          <MessageCircle className="size-6" />
        </a>
      ) : null}

      {call ? (
        <a
          href={`tel:${call}`}
          aria-label="Call"
          className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
        >
          <Phone className="size-5" />
        </a>
      ) : null}

      {data.backToTop && showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="flex size-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition hover:text-foreground"
        >
          <ArrowUp className="size-5" />
        </button>
      ) : null}
    </div>
  );
}
