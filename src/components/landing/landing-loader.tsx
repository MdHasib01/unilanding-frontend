'use client';

/* eslint-disable @next/next/no-img-element -- the product shot is a tenant upload from any host */

import { useEffect, useState } from 'react';
import type { ResolvedBrand } from '@/lib/brand';
import { GridPattern } from './grid-pattern';
import { BrandLogo } from './brand-logo';
import { loaderSeenKey } from './loader-seen';

const MIN_MS = 300;
const MAX_MS = 3000;
const FADE_MS = 500;

/**
 * The reference's branded reveal screen: product shot, logo and a badge with
 * a pinging dot, over the brand-tinted grid.
 *
 * Unlike the reference, nothing waits on a client fetch — the page and its
 * customisation are already server-rendered underneath, in the right colours.
 * The overlay stays until the page's images have loaded (window `load`), never
 * shorter than 300 ms so it does not flicker and never longer than 3 s so a
 * slow image cannot hold a visitor hostage, then fades out. Once per session.
 */
export function LandingLoader({ brand, slug }: { brand: ResolvedBrand; slug: string }) {
  const [phase, setPhase] = useState<'shown' | 'fading' | 'gone'>('shown');

  useEffect(() => {
    let seen = false;
    try {
      seen = Boolean(sessionStorage.getItem(loaderSeenKey(slug)));
    } catch {
      // Storage blocked (private mode): just show it each time.
    }
    // Already hidden by the data-ul-loaded rule; nothing to animate.
    if (seen) return;

    const started = performance.now();
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let goneTimer: ReturnType<typeof setTimeout> | undefined;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      fadeTimer = setTimeout(() => {
        setPhase('fading');
        root.style.overflow = prevOverflow;
        try {
          sessionStorage.setItem(loaderSeenKey(slug), '1');
        } catch {
          /* ignore */
        }
        goneTimer = setTimeout(() => setPhase('gone'), FADE_MS);
      }, wait);
    };

    const cap = setTimeout(finish, MAX_MS);
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });

    return () => {
      clearTimeout(cap);
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
      window.removeEventListener('load', finish);
      root.style.overflow = prevOverflow;
    };
  }, [slug]);

  if (phase === 'gone') return null;

  return (
    <div
      aria-label={brand.name}
      aria-busy={phase === 'shown'}
      className="ul-loader fixed inset-0 z-[9999] isolate flex select-none flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary-soft via-white to-primary-soft px-4 transition-opacity ease-out"
      style={{ minHeight: '100vh', opacity: phase === 'fading' ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
    >
      <GridPattern size={32} className="opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 -z-10 h-[32rem]"
        style={{ background: 'radial-gradient(60% 60% at 50% 0%, color-mix(in oklab, var(--primary) 13%, transparent), transparent)' }}
      />

      <div className="relative z-10 mx-auto flex max-w-sm flex-col items-center justify-center text-center">
        <div className="absolute -z-10 size-64 animate-pulse rounded-full bg-primary opacity-20 blur-3xl" />

        <div className="relative mb-6 flex items-center justify-center">
          <div className="relative size-48">
            <img
              src={brand.productImageUrl}
              alt={brand.name}
              fetchPriority="high"
              className="size-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="mb-3 flex flex-col items-center">
          <BrandLogo brand={brand} size="lg" />
        </div>

        {brand.loaderBadge ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
            <span className="size-2 animate-ping rounded-full bg-primary" />
            <span>{brand.loaderBadge}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
