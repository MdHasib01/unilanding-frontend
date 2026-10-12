'use client';

import type { ReactNode } from 'react';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Scrolls to the order form. Inert in the editor preview. */
export function scrollToTarget(target: string | undefined, mode: 'live' | 'preview') {
  if (mode === 'preview') return;
  const el = document.getElementById(target || 'order') ?? document.getElementById('order');
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * The reference page's yellow pill CTA, exactly: shimmer sweep, bag icon, a
 * lift on hover, full width on a phone. Every MilkReady section ends in one.
 */
export function CtaButton({
  children,
  mode,
  target,
  weight = 'bold',
  size = 'lg',
  className,
}: {
  children: ReactNode;
  mode: 'live' | 'preview';
  target?: string;
  weight?: 'bold' | 'black';
  size?: 'lg' | 'md';
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => scrollToTarget(target, mode)}
      className={cn(
        'cta-shine inline-flex h-auto cursor-pointer select-none items-center justify-center gap-2.5 rounded-full bg-brand-cta text-center text-brand-cta-foreground shadow-lg shadow-brand-cta/40 transition-all hover:-translate-y-0.5 hover:bg-brand-cta-dark active:translate-y-0',
        size === 'lg'
          ? 'min-h-[54px] w-full px-8 py-4 text-lg sm:min-h-[58px] sm:w-auto md:px-10 md:text-xl'
          : 'min-h-[54px] px-6 py-4 text-base sm:min-h-[58px] sm:px-8 sm:text-lg',
        weight === 'black' ? 'font-black' : 'font-bold',
        className
      )}
    >
      <ShoppingBag className="size-5 shrink-0 sm:size-6" strokeWidth={2.5} />
      <span>{children}</span>
    </button>
  );
}
