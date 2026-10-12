'use client';


import { useEffect, useState } from 'react';
import { ChevronUp, Mail, MapPin, MessageCircle, Phone, ShoppingBag, Timer } from 'lucide-react';
import { SOCIAL_ICONS, type SocialPlatform } from '@/components/shared/social-icons';
import { BrandLogo } from '@/components/landing/brand-logo';
import { scrollToTarget } from '@/components/landing/cta-button';
import { useCountdown, formatClock } from '@/components/landing/use-countdown';
import { tt } from '@/lib/i18n-text';
import { cn } from '@/lib/utils';
import { resolveOffer } from './pricing-card';
import type { SectionRendererProps } from '../types';

type T = (v: unknown) => string;

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

/** A fixed element on the live page, an in-flow one inside the editor preview. */
const pinned = (mode: 'live' | 'preview', live: string, preview: string) => (mode === 'live' ? live : preview);

// ───────────────────────────── footer ─────────────────────────────

type FooterData = {
  text?: unknown;
  contactTitle?: unknown;
  phone?: string;
  email?: string;
  address?: unknown;
  links?: { label?: unknown; href?: string }[];
  socials?: { platform?: string; href?: string }[];
  rightsText?: unknown;
  showPoweredBy?: boolean;
};

/** The reference MilkReady footer: brand and socials, then contact details. */
export function Footer({ data, ctx }: SectionRendererProps<FooterData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const year = new Date().getFullYear();
  const links = (data.links ?? []).filter((l) => safeHref(l.href) && t(l.label));
  const socials = (data.socials ?? []).filter((s) => s.platform && safeHref(s.href));
  const phone = data.phone || ctx.tenant.contact?.phone || '';
  const email = data.email || ctx.tenant.contact?.email || '';
  const address = t(data.address) || ctx.tenant.contact?.address || '';
  const hasContact = Boolean(phone || email || address);

  return (
    <footer className="overflow-hidden border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div
          className={cn(
            'grid grid-cols-1 items-center gap-8 text-center sm:items-start sm:text-left',
            links.length > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
          )}
        >
          <div className="flex flex-col items-center sm:items-start">
            <BrandLogo brand={ctx.brand} className="mx-auto sm:mx-0" size="md" />
            {t(data.text) ? (
              <p className="mt-3 max-w-xs text-center text-sm text-muted-foreground sm:text-left">{t(data.text)}</p>
            ) : null}
            {socials.length > 0 ? (
              <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
                {socials.map((sc, i) => {
                  const Icon = SOCIAL_ICONS[sc.platform as SocialPlatform] ?? MessageCircle;
                  return (
                    <a
                      key={i}
                      href={safeHref(sc.href)!}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      aria-label={sc.platform}
                      className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground/70 transition-colors hover:bg-primary/15 hover:text-primary"
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          {links.length > 0 ? (
            <div className="flex flex-col items-center sm:items-start">
              <ul className="space-y-2 text-center sm:text-left">
                {links.map((l, i) => (
                  <li key={i}>
                    <a href={safeHref(l.href)!} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {t(l.label)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Contact is hidden on phones, as on the reference: the floating
              WhatsApp button covers it there. */}
          {hasContact ? (
            <div className="hidden flex-col items-center sm:flex sm:items-start">
              {t(data.contactTitle) ? (
                <h3 className="text-sm font-bold text-foreground">{t(data.contactTitle)}</h3>
              ) : null}
              <ul className="mt-3 flex flex-col items-center space-y-2.5 text-sm text-muted-foreground sm:items-start">
                {phone ? (
                  <li className="flex items-center justify-center gap-2 sm:justify-start">
                    <Phone className="size-4 shrink-0" />
                    <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:text-primary">{phone}</a>
                  </li>
                ) : null}
                {email ? (
                  <li className="flex items-center justify-center gap-2 sm:justify-start">
                    <Mail className="size-4 shrink-0" />
                    <a href={`mailto:${email}`} className="hover:text-primary">{email}</a>
                  </li>
                ) : null}
                {address ? (
                  <li className="flex items-start justify-center gap-2 sm:justify-start">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    <span className="whitespace-pre-line">{address}</span>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {year} {ctx.brand.name}™. {t(data.rightsText)}
          {/* White-label tenants pay to remove this. */}
          {data.showPoweredBy && !ctx.tenant.whiteLabel ? <span className="ml-1 opacity-70">· Powered by UniLanding</span> : null}
        </div>
      </div>
    </footer>
  );
}

// ───────────────────────────── sticky CTA ─────────────────────────────

type StickyData = {
  productId?: string;
  showPrice?: boolean;
  discountText?: string;
  showCountdown?: boolean;
  ctaText?: unknown;
  target?: string;
  showAfterPx?: number;
};

/** The reference's bottom bar: sale price, struck price, discount, timer, CTA. */
export function StickyCta({ data, ctx }: SectionRendererProps<StickyData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const threshold = data.showAfterPx ?? 150;
  const [scrolled, setScrolled] = useState(false);
  const countdown = useCountdown();
  const offer = data.showPrice ? resolveOffer(ctx, data.productId) : null;
  const discount = data.discountText?.trim() || (offer?.pct ? `${offer.num(offer.pct)}% ছাড়` : '');

  useEffect(() => {
    if (ctx.mode === 'preview') return;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, ctx.mode]);

  // Always visible in the preview, or a tenant editing it would never see it.
  const shown = ctx.mode === 'preview' || scrolled;

  return (
    <div
      className={cn(
        pinned(ctx.mode, 'fixed inset-x-0 bottom-0 z-50', 'relative'),
        'w-full max-w-full overflow-hidden border-t border-primary-tint bg-white/95 px-4 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-300',
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      )}
    >
      <div className="mx-auto flex w-full min-w-0 max-w-4xl items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
          {offer ? (
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="whitespace-nowrap text-base font-extrabold leading-none text-primary sm:text-xl">
                {offer.money(offer.sale)}
              </span>
              {offer.saving > 0 ? (
                <span className="whitespace-nowrap text-xs leading-none text-slate-400 line-through decoration-1 sm:text-sm">
                  {offer.money(offer.list)}
                </span>
              ) : null}
              {discount ? (
                <span className="whitespace-nowrap rounded-md bg-primary-tint px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary sm:text-xs">
                  {discount}
                </span>
              ) : null}
            </div>
          ) : null}
          {data.showCountdown && countdown ? (
            <div className="mt-0.5 inline-flex w-fit min-w-0 items-center gap-1 rounded border border-primary-tint bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium text-primary-dark sm:text-xs">
              <Timer className="size-3 shrink-0 animate-pulse text-primary" />
              <span className="font-mono text-[10px] font-bold tabular-nums sm:text-xs">{formatClock(countdown)}</span>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => scrollToTarget(data.target, ctx.mode)}
          className="cta-shine flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-cta px-4 text-xs font-extrabold text-brand-cta-foreground shadow-md transition-all hover:bg-brand-cta-dark sm:h-11 sm:px-6 sm:text-base"
        >
          <ShoppingBag className="size-4 shrink-0" strokeWidth={2.5} />
          <span>{t(data.ctaText)}</span>
        </button>
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

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.94 9.94 0 0 0 1.333 4.993L2 22l5.233-1.37a9.94 9.94 0 0 0 4.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.04-5.176-2.926-7.062A9.92 9.92 0 0 0 12.012 2zm5.71 13.627c-.244.688-1.42 1.316-1.954 1.376-.494.056-1.127.08-1.815-.14-.428-.137-.978-.318-1.684-.624-3.003-1.303-4.947-4.324-5.097-4.526-.149-.202-1.222-1.626-1.222-3.1 0-1.474.772-2.199 1.047-2.497.274-.298.6-.372.8-.372.2 0 .4 0 .573.008.184.009.43-.07.674.514.243.585.83 2.023.902 2.17.072.148.12.322.024.515-.096.192-.144.312-.288.481-.144.168-.303.376-.433.504-.144.145-.295.303-.127.592.169.288.75 1.238 1.61 2.006 1.107.987 2.04 1.294 2.328 1.438.288.144.456.12.624-.072.168-.192.72-.84.912-1.128.192-.288.384-.24.648-.144.264.096 1.68.792 1.968.936.288.144.48.216.552.336.072.12.072.696-.172 1.384z" />
    </svg>
  );
}

/** wa.me wants the full international number: 01XXXXXXXXX → 8801XXXXXXXXX. */
const toWhatsApp = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('01') ? `88${digits}` : digits;
};

/** The reference's floating WhatsApp button, with back-to-top above it. */
export function FloatingActions({ data, ctx }: SectionRendererProps<FloatData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    if (ctx.mode === 'preview') return;
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ctx.mode]);

  const wa = toWhatsApp(data.whatsappNumber || ctx.tenant.contact?.whatsapp || '');
  const call = (data.callNumber || '').replace(/[^\d+]/g, '');
  if (!wa && !call && !data.backToTop) return null;

  const topVisible = ctx.mode === 'preview' || showTop;

  return (
    <div
      className={cn(
        pinned(ctx.mode, 'pointer-events-none fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6', 'ml-auto w-fit p-4'),
        'flex flex-col items-center gap-3'
      )}
    >
      {data.backToTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="উপরে ফিরে যান"
          title="উপরে ফিরে যান"
          className={cn(
            'flex size-8 cursor-pointer items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary shadow-md shadow-primary/15 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95 sm:size-9',
            topVisible ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-75 opacity-0'
          )}
        >
          <ChevronUp className="size-4 stroke-[2.5] sm:size-5" />
        </button>
      ) : null}

      {call ? (
        <a
          href={`tel:${call}`}
          aria-label="Call"
          className="pointer-events-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <Phone className="size-5" />
        </a>
      ) : null}

      {wa ? (
        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent(t(data.whatsappMessage))}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp-এ যোগাযোগ করুন"
          className="group pointer-events-auto flex size-13 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-900/30 transition-all duration-300 hover:scale-110 hover:bg-[#20bd5a] active:scale-95 sm:size-14"
        >
          <WhatsAppIcon className="size-7 transition-transform group-hover:rotate-12 sm:size-8" />
        </a>
      ) : null}
    </div>
  );
}
