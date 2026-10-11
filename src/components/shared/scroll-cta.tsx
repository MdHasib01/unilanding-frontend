'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The CTA every section uses. Scrolls to a section id rather than navigating,
 * because a single-page landing's whole job is to get the visitor to the order
 * form without a page load.
 *
 * In the editor preview it is inert: clicking a CTA while arranging sections
 * should not yank the preview pane around.
 */
export function ScrollCta({
  children,
  target = 'order',
  mode = 'live',
  size = 'md',
  variant = 'cta',
  className,
  shine = true,
}: {
  children: ReactNode;
  target?: string;
  mode?: 'live' | 'preview';
  size?: 'md' | 'lg';
  variant?: 'cta' | 'primary' | 'outline';
  className?: string;
  shine?: boolean;
}) {
  const scroll = () => {
    if (mode === 'preview') return;
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    // A CTA pointing at a section the tenant has since hidden should still do
    // something sensible rather than nothing at all.
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sizes = {
    md: 'px-5 py-2.5 text-sm sm:text-base',
    lg: 'px-7 py-3.5 text-base sm:text-lg',
  } as const;

  const variants = {
    cta: 'bg-[var(--cta)] text-[var(--cta-foreground)] hover:brightness-95',
    primary: 'bg-primary text-primary-foreground hover:brightness-110',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5',
  } as const;

  return (
    <button
      type="button"
      onClick={scroll}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-bold shadow-sm transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'active:scale-[0.98]',
        sizes[size],
        variants[variant],
        shine && variant === 'cta' && 'cta-shine',
        className
      )}
    >
      {children}
    </button>
  );
}
