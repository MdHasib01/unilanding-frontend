/* eslint-disable @next/next/no-img-element -- the logo is a tenant upload from any host */

import type { ResolvedBrand } from '@/lib/brand';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: { img: 'h-8 max-w-32', text: 'text-xl' },
  md: { img: 'h-12 max-h-16 sm:h-14 max-w-48', text: 'text-2xl sm:text-3xl' },
  lg: { img: 'h-12 max-w-44', text: 'text-3xl' },
} as const;

/**
 * The page's logo: the uploaded image, or the reference's two-tone wordmark
 * ("Milk" in the brand colour, "Ready™" in ink).
 */
export function BrandLogo({
  brand,
  size = 'md',
  className,
}: {
  brand: ResolvedBrand;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];

  if (brand.logoType === 'image' && brand.logoUrl) {
    return (
      <img
        src={brand.logoUrl}
        alt={brand.name}
        className={cn('w-auto object-contain', s.img, className)}
      />
    );
  }

  return (
    <span className={cn('font-extrabold tracking-tight text-slate-900', s.text, className)}>
      {brand.logoTextAccent ? <span className="text-primary">{brand.logoTextAccent}</span> : null}
      {brand.logoText}
    </span>
  );
}
