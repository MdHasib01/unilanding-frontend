import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The outer shell every landing section shares: vertical rhythm, a max width,
 * and a consistent side gutter that never collapses on a phone.
 */
export function SectionShell({
  children,
  id,
  className,
  width = 'default',
  tone = 'transparent',
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  width?: 'default' | 'narrow' | 'wide' | 'full';
  tone?: 'transparent' | 'card' | 'muted' | 'primary';
}) {
  const widths = {
    narrow: 'max-w-2xl',
    default: 'max-w-5xl',
    wide: 'max-w-6xl',
    full: 'max-w-none',
  } as const;

  const tones = {
    transparent: '',
    card: 'bg-card',
    muted: 'bg-muted',
    primary: 'bg-primary text-primary-foreground',
  } as const;

  return (
    <section id={id} className={cn('w-full px-4 py-14 sm:px-6 sm:py-16', tones[tone], className)}>
      <div className={cn('mx-auto w-full', widths[width])}>{children}</div>
    </section>
  );
}

/** Eyebrow + headline + optional subheadline, centred. */
export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'center',
  highlight,
}: {
  badge?: string;
  title?: string;
  subtitle?: string;
  align?: 'center' | 'left';
  highlight?: string;
}) {
  if (!title && !badge && !subtitle) return null;

  return (
    <div className={cn('mb-10', align === 'center' ? 'text-center' : 'text-left')}>
      {badge ? (
        <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          {badge}
        </span>
      ) : null}
      {title ? (
        <h2 className="text-balance text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">
          <Highlighted text={title} phrase={highlight} />
        </h2>
      ) : null}
      {subtitle ? (
        <p
          className={cn(
            'mt-3 text-pretty text-base text-muted-foreground sm:text-lg',
            align === 'center' && 'mx-auto max-w-2xl'
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Emphasises one phrase inside a headline by splitting on it.
 *
 * This is the reference's `titleHighlight` trick, and it is deliberate: it gives
 * tenants expressive headlines with NO rich-text input and no
 * dangerouslySetInnerHTML anywhere in the section blocks, so tenant-authored
 * copy is structurally incapable of injecting markup.
 */
export function Highlighted({ text, phrase }: { text: string; phrase?: string }) {
  if (!phrase || !text.includes(phrase)) return <>{text}</>;
  const [before, ...rest] = text.split(phrase);
  return (
    <>
      {before}
      <span className="text-primary">{phrase}</span>
      {rest.join(phrase)}
    </>
  );
}

/** Dotted background, ported from the reference's grid-pattern. */
export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 opacity-[0.07]', className)}
      style={{
        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}
    />
  );
}
