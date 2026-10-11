import Image from 'next/image';
import { Check, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { SectionShell, SectionHeading } from '@/components/shared/section-shell';
import { Reveal, RevealGroup, RevealItem } from '@/components/shared/reveal';
import { formatMoney } from '@/lib/format';
import type { SectionRendererProps } from '../types';

type Bullet = { text?: unknown };
type Img = { url?: string; alt?: string };
type T = (v: unknown) => string;

// ───────────────────────── before / after ─────────────────────────

type ImagineData = {
  badge?: unknown;
  title?: unknown;
  beforeTitle?: unknown;
  beforeItems?: Bullet[];
  afterTitle?: unknown;
  afterItems?: Bullet[];
  image?: Img;
};

export function Imagine({ data, ctx }: SectionRendererProps<ImagineData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);

  return (
    <SectionShell width="wide" tone="muted">
      <SectionHeading badge={t(data.badge)} title={t(data.title)} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal direction="right">
          <Column
            title={t(data.beforeTitle)}
            items={(data.beforeItems ?? []).map((b) => t(b.text)).filter(Boolean)}
            tone="negative"
          />
        </Reveal>
        <Reveal direction="left" delay={0.08}>
          <Column
            title={t(data.afterTitle)}
            items={(data.afterItems ?? []).map((b) => t(b.text)).filter(Boolean)}
            tone="positive"
          />
        </Reveal>
      </div>

      {data.image?.url ? (
        <Reveal delay={0.14}>
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-card">
            <Image
              src={data.image.url}
              alt={data.image.alt || t(data.title)}
              fill
              sizes="(max-width: 1024px) 92vw, 1024px"
              className="object-cover"
            />
          </div>
        </Reveal>
      ) : null}
    </SectionShell>
  );
}

function Column({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'positive' | 'negative';
}) {
  const positive = tone === 'positive';
  return (
    <div
      className={
        positive
          ? 'h-full rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-sm'
          : 'h-full rounded-2xl border border-border bg-card/60 p-6'
      }
    >
      {title ? (
        <h3
          className={
            positive
              ? 'text-lg font-bold text-primary'
              : 'text-lg font-bold text-muted-foreground'
          }
        >
          {title}
        </h3>
      ) : null}
      <ul className="mt-4 space-y-3">
        {items.map((text) => (
          <li key={text} className="flex items-start gap-2.5 text-sm sm:text-base">
            {positive ? (
              <Check className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            ) : (
              <X className="mt-0.5 size-5 shrink-0 text-rose-500" />
            )}
            <span className={positive ? 'text-card-foreground' : 'text-muted-foreground'}>
              {text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ───────────────────────── two-path comparison ─────────────────────────

type ComparisonData = {
  title?: unknown;
  leftLabel?: unknown;
  leftItems?: Bullet[];
  rightLabel?: unknown;
  rightItems?: Bullet[];
};

export function Comparison({ data, ctx }: SectionRendererProps<ComparisonData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);

  return (
    <SectionShell width="wide">
      <SectionHeading title={t(data.title)} />
      <div className="relative grid items-stretch gap-5 lg:grid-cols-[1fr_auto_1fr]">
        <Reveal direction="right">
          <Column
            title={t(data.leftLabel)}
            items={(data.leftItems ?? []).map((b) => t(b.text)).filter(Boolean)}
            tone="negative"
          />
        </Reveal>

        <div className="hidden items-center justify-center lg:flex" aria-hidden>
          <span className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
            <ArrowRight className="size-5" />
          </span>
        </div>

        <Reveal direction="left" delay={0.08}>
          <Column
            title={t(data.rightLabel)}
            items={(data.rightItems ?? []).map((b) => t(b.text)).filter(Boolean)}
            tone="positive"
          />
        </Reveal>
      </div>
    </SectionShell>
  );
}

// ───────────────────────── cost of inaction ─────────────────────────

type CostData = {
  title?: unknown;
  body?: unknown;
  costRows?: { label?: unknown; amount?: string }[];
  conclusion?: unknown;
  image?: Img;
};

export function EmotionalCost({ data, ctx }: SectionRendererProps<CostData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);
  const rows = data.costRows ?? [];

  return (
    <SectionShell width="wide" tone="muted">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <SectionHeading title={t(data.title)} align="left" />
          {t(data.body) ? (
            <p className="text-pretty text-base text-muted-foreground sm:text-lg">{t(data.body)}</p>
          ) : null}

          {rows.length > 0 ? (
            <RevealGroup className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {rows.map((row, i) => (
                <RevealItem key={i}>
                  <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <span className="text-sm text-muted-foreground sm:text-base">
                      {t(row.label)}
                    </span>
                    <span className="font-mono text-base font-bold tabular-nums text-card-foreground sm:text-lg">
                      {formatMoney(row.amount ?? '', ctx.currency, ctx.locale)}
                    </span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          ) : null}

          {t(data.conclusion) ? (
            <p className="mt-5 text-pretty text-base font-semibold text-primary sm:text-lg">
              {t(data.conclusion)}
            </p>
          ) : null}
        </div>

        {data.image?.url ? (
          <Reveal direction="left">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-card">
              <Image
                src={data.image.url}
                alt={data.image.alt || t(data.title)}
                fill
                sizes="(max-width: 1024px) 92vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </SectionShell>
  );
}

// ───────────────────────── guarantee ─────────────────────────

type GuaranteeData = {
  title?: unknown;
  text?: unknown;
  days?: number;
  badgeImage?: Img;
};

export function Guarantee({ data, ctx }: SectionRendererProps<GuaranteeData>) {
  const t: T = (v) => tt(v, ctx.locale, ctx.fallbackLocale);

  return (
    <SectionShell width="default">
      <Reveal>
        <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-primary/25 bg-card p-7 text-center shadow-sm sm:flex-row sm:p-9 sm:text-left">
          <div className="shrink-0">
            {data.badgeImage?.url ? (
              <div className="relative size-24 overflow-hidden rounded-full">
                <Image
                  src={data.badgeImage.url}
                  alt={data.badgeImage.alt || t(data.title)}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            ) : (
              <span className="flex size-24 flex-col items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="size-9" />
                {data.days ? (
                  <span className="mt-0.5 text-xs font-bold tabular-nums">{data.days}</span>
                ) : null}
              </span>
            )}
          </div>

          <div>
            {t(data.title) ? (
              <h2 className="text-xl font-bold text-card-foreground sm:text-2xl">{t(data.title)}</h2>
            ) : null}
            {t(data.text) ? (
              <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                {t(data.text)}
              </p>
            ) : null}
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
