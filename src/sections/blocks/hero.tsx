import Image from 'next/image';
import { Check } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { Highlighted, DotGrid } from '@/components/shared/section-shell';
import { Reveal, Float } from '@/components/shared/reveal';
import { ScrollCta } from '@/components/shared/scroll-cta';
import type { SectionRendererProps } from '../types';

type Img = { url?: string; alt?: string };
type Data = {
  badge?: unknown;
  title?: unknown;
  titleHighlight?: string;
  subtitle?: unknown;
  ctaText?: unknown;
  ctaTarget?: string;
  image?: Img;
  imageMobile?: Img;
  trustBadges?: { label?: unknown }[];
};

export function Hero({ data, ctx }: SectionRendererProps<Data>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);

  const badge = t(data.badge);
  const title = t(data.title);
  const subtitle = t(data.subtitle);
  const ctaText = t(data.ctaText);
  const hero = data.image?.url || '';
  const heroMobile = data.imageMobile?.url || hero;
  const badges = (data.trustBadges ?? []).map((b) => t(b.label)).filter(Boolean);

  return (
    <header className="relative overflow-hidden bg-background">
      <DotGrid className="text-primary" />
      {/* Soft brand wash behind the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-[22rem] rounded-full opacity-20 blur-3xl"
        style={{ background: 'var(--primary)' }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-14">
        <div className="text-center lg:text-left">
          {badge ? (
            <Reveal direction="down">
              <span className="inline-block rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary sm:text-sm">
                {badge}
              </span>
            </Reveal>
          ) : null}

          {title ? (
            <Reveal delay={0.05}>
              <h1 className="mt-4 text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl">
                <Highlighted text={title} phrase={data.titleHighlight} />
              </h1>
            </Reveal>
          ) : null}

          {subtitle ? (
            <Reveal delay={0.12}>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg lg:mx-0">
                {subtitle}
              </p>
            </Reveal>
          ) : null}

          {ctaText ? (
            <Reveal delay={0.18}>
              <div className="mt-7">
                <ScrollCta target={data.ctaTarget || 'order'} mode={ctx.mode} size="lg">
                  {ctaText}
                </ScrollCta>
              </div>
            </Reveal>
          ) : null}

          {badges.length > 0 ? (
            <Reveal delay={0.24}>
              <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
                {badges.map((label) => (
                  <li
                    key={label}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
                  >
                    <Check className="size-4 shrink-0 text-primary" />
                    {label}
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>

        {hero ? (
          <Reveal direction="left" delay={0.1}>
            <Float className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-muted">
                {/* Separate mobile art when supplied: a tall product shot often
                    crops badly from a landscape original. */}
                <Image
                  src={heroMobile}
                  alt={data.imageMobile?.alt || data.image?.alt || title || ctx.tenant.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 50vw"
                  className="object-cover lg:hidden"
                />
                <Image
                  src={hero}
                  alt={data.image?.alt || title || ctx.tenant.name}
                  fill
                  priority
                  sizes="50vw"
                  className="hidden object-cover lg:block"
                />
              </div>
            </Float>
          </Reveal>
        ) : null}
      </div>
    </header>
  );
}
