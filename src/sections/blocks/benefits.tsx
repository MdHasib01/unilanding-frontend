import Image from 'next/image';
import * as Icons from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { SectionShell, SectionHeading } from '@/components/shared/section-shell';
import { RevealGroup, RevealItem, Float } from '@/components/shared/reveal';
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

type OrbitData = {
  badge?: unknown;
  title?: unknown;
  subtitle?: unknown;
  centerImage?: { url?: string; alt?: string };
  items?: BenefitItem[];
};

/**
 * The reference's signature benefits layout: the product in the middle with
 * benefits arranged around it. On narrow screens the ring is meaningless, so it
 * collapses to a plain list rather than being squeezed.
 */
export function BenefitsOrbit({ data, ctx }: SectionRendererProps<OrbitData>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const items = (data.items ?? []).slice(0, 8);
  const image = data.centerImage?.url;

  return (
    <SectionShell width="wide" className="relative">
      <SectionHeading badge={t(data.badge)} title={t(data.title)} subtitle={t(data.subtitle)} />

      {/* Mobile and tablet: a straightforward list. */}
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {items.map((item, i) => (
          <RevealItem key={i}>
            <BenefitCard item={item} t={t} />
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Desktop: the ring. */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-3xl lg:block">
        {image ? (
          <Float className="absolute left-1/2 top-1/2 z-10 size-[42%] -translate-x-1/2 -translate-y-1/2">
            <div className="relative size-full overflow-hidden rounded-full bg-card shadow-xl ring-8 ring-primary/10">
              <Image
                src={image}
                alt={data.centerImage?.alt || ctx.tenant.productName || ctx.tenant.name}
                fill
                sizes="400px"
                className="object-cover"
              />
            </div>
          </Float>
        ) : null}

        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary/20"
        />

        {items.map((item, i) => {
          // Start at the top and distribute evenly around the circle.
          const angle = (i / Math.max(1, items.length)) * 2 * Math.PI - Math.PI / 2;
          const radius = 42;
          const left = 50 + Math.cos(angle) * radius;
          const top = 50 + Math.sin(angle) * radius;
          return (
            <div
              key={i}
              className="absolute w-52 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <BenefitCard item={item} t={t} compact />
            </div>
          );
        })}
      </div>
    </SectionShell>
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
