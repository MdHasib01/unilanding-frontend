import * as Icons from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { SectionShell, SectionHeading } from '@/components/shared/section-shell';
import { Reveal, RevealGroup, RevealItem, Float } from '@/components/shared/reveal';
import { RotatingOrbit } from '@/components/landing/rotating-orbit';
import { toBengaliDigits } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { SectionRendererProps } from '../types';

/**
 * Tenants pick an icon by name. Resolving through the lucide namespace keeps
 * that an open set without shipping a hand-maintained map — and an unknown or
 * mistyped name degrades to a neutral dot instead of crashing the section.
 */
function Icon({ name, className }: { name?: string; className?: string }) {
  const Cmp = name ? (Icons as unknown as Record<string, Icons.LucideIcon>)[name] : undefined;
  if (!Cmp) return <Icons.Circle className={className} />;
  return <Cmp className={className} />;
}

type BenefitItem = { title?: unknown; body?: unknown; icon?: string };

// ───────────────────────────── orbit layout ─────────────────────────────

type OrbitItem = { accent?: unknown; rest?: unknown; title?: unknown; body?: unknown };

type OrbitData = {
  title?: unknown;
  centerImage?: { url?: string; alt?: string };
  items?: OrbitItem[];
};

const RADIUS_X = 42;
const RADIUS_Y = 36;

/** Evenly around an ellipse, starting at twelve o'clock. */
function polarPosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    left: `${50 + RADIUS_X * Math.cos(angle)}%`,
    top: `${50 + RADIUS_Y * Math.sin(angle)}%`,
  };
}

/**
 * The reference MilkReady benefits: the product floating in the middle of
 * three slowly turning dashed rings, with numbered benefit cards (Bengali
 * numerals) placed around it. The same ring on every screen size, as on the
 * reference — the cards simply shrink.
 */
export function BenefitsOrbit({ data, ctx }: SectionRendererProps<OrbitData>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const items = (data.items ?? []).slice(0, 8);
  const image = data.centerImage?.url?.trim() || ctx.brand.productImageUrl;
  const title = t(data.title);

  return (
    <section className="relative mb-0 overflow-hidden bg-white pb-0 pt-2 md:pb-0 md:pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {title ? (
          <div className="mb-4 text-center md:mb-6">
            <h2 className="text-3xl font-bold leading-tight text-primary sm:text-4xl md:text-5xl">{title}</h2>
          </div>
        ) : null}

        <div className="relative mx-auto mt-2 aspect-square w-full max-w-[420px] sm:mt-4 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
          <RotatingOrbit />
          <div className="absolute inset-0 flex items-center justify-center">
            <Float distance={8} duration={3.5}>
              {/* eslint-disable-next-line @next/next/no-img-element -- tenant upload, any host */}
              <img
                src={image}
                alt={data.centerImage?.alt || ctx.brand.name}
                className="h-28 w-auto object-contain drop-shadow-2xl sm:h-44 md:h-[228px] lg:h-64 xl:h-[300px]"
              />
            </Float>
          </div>

          {items.map((item, index) => {
            const accent = t(item.accent ?? item.title);
            const rest = t(item.rest ?? item.body);
            return (
              <div
                key={index}
                style={polarPosition(index, items.length)}
                className="absolute w-24 -translate-x-1/2 -translate-y-1/2 sm:w-40 md:w-44 lg:w-48 xl:w-56"
              >
                <Reveal delay={0.1 * index}>
                  <div className="flex flex-col items-center gap-1 rounded-xl border border-primary/20 bg-white p-2 text-center shadow-md transition-colors hover:border-primary/40 sm:gap-2 sm:rounded-2xl sm:p-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm sm:size-9 sm:text-sm md:size-10 md:text-base">
                      {ctx.locale === 'bn' ? toBengaliDigits(index + 1) : index + 1}
                    </span>
                    <p className="text-[11px] leading-tight sm:text-sm sm:leading-snug md:text-base lg:text-lg">
                      {accent ? <span className="font-bold text-primary">{accent}</span> : null}{' '}
                      {rest ? <span className="font-normal text-[#1A1A1A]">{rest}</span> : null}
                    </p>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({
  item,
  t,
  compact,
}: {
  item: BenefitItem;
  t: (v: unknown) => string;
  compact?: boolean;
}) {
  const title = t(item.title);
  const body = t(item.body);
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card shadow-sm',
        compact ? 'p-3.5 text-center' : 'p-5'
      )}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-xl bg-primary/10 text-primary',
          compact ? 'size-9' : 'size-11'
        )}
      >
        <Icon name={item.icon} className={compact ? 'size-4.5' : 'size-5'} />
      </span>
      {title ? (
        <h3 className={cn('mt-2.5 font-bold text-card-foreground', compact ? 'text-sm' : 'text-base')}>
          {title}
        </h3>
      ) : null}
      {body ? (
        <p className={cn('mt-1 text-pretty text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
          {body}
        </p>
      ) : null}
    </div>
  );
}

// ───────────────────────────── grid layout ─────────────────────────────

type GridData = {
  title?: unknown;
  subtitle?: unknown;
  columns?: '2' | '3' | '4';
  items?: BenefitItem[];
};

export function BenefitsGrid({ data, ctx }: SectionRendererProps<GridData>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const cols = {
    '2': 'sm:grid-cols-2',
    '3': 'sm:grid-cols-2 lg:grid-cols-3',
    '4': 'sm:grid-cols-2 lg:grid-cols-4',
  }[data.columns ?? '3'];

  return (
    <SectionShell width="wide">
      <SectionHeading title={t(data.title)} subtitle={t(data.subtitle)} />
      <RevealGroup className={cn('grid gap-4', cols)}>
        {(data.items ?? []).map((item, i) => (
          <RevealItem key={i}>
            <BenefitCard item={item} t={t} />
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
}
