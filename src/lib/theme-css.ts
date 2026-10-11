import type { CSSProperties } from 'react';

export type PageTheme = {
  primary?: string;
  accent?: string;
  cta?: string;
  ctaForeground?: string;
  background?: string;
  foreground?: string;
  radius?: string;
  fontHeading?: string;
  fontBody?: string;
};

/** Only hex colours get through, so a theme value can never inject CSS. */
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const LENGTH = /^[0-9]*\.?[0-9]+(rem|px|em)$/;

const safeColor = (v: string | undefined, fallback: string) =>
  v && HEX.test(v) ? v : fallback;
const safeLength = (v: string | undefined, fallback: string) =>
  v && LENGTH.test(v) ? v : fallback;

/** Readable foreground for a brand colour, by relative luminance. */
export function contrastOn(hex: string): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.45 ? '#111827' : '#ffffff';
}

const resolve = (theme: PageTheme = {}) => {
  const primary = safeColor(theme.primary, '#bd0052');
  const accent = safeColor(theme.accent, '#e37a69');
  const cta = safeColor(theme.cta, '#ffd666');
  const background = safeColor(theme.background, '#fff9f6');
  const foreground = safeColor(theme.foreground, '#111827');
  return {
    primary,
    accent,
    cta,
    ctaForeground: safeColor(theme.ctaForeground, contrastOn(cta)),
    primaryForeground: contrastOn(primary),
    background,
    foreground,
    radius: safeLength(theme.radius, '1rem'),
  };
};

/**
 * Emits the tenant palette as a CSS rule, scoped to one attribute selector.
 *
 * Rendered server-side in the tenant layout so the FIRST BYTE already carries
 * the right colours. The reference did this in a client useEffect after a
 * fetch, which meant every page painted in the previous product's crimson and
 * then flipped — visible on a slow connection, and the kind of thing a paying
 * tenant notices immediately.
 */
export function themeToCss(theme: PageTheme | undefined, scope: string): string {
  const t = resolve(theme);
  return `[data-ul-tenant="${scope}"]{` +
    `--background:${t.background};` +
    `--foreground:${t.foreground};` +
    `--primary:${t.primary};` +
    `--primary-foreground:${t.primaryForeground};` +
    `--secondary:${t.accent};` +
    `--secondary-foreground:${contrastOn(t.accent)};` +
    `--accent-strong:${t.accent};` +
    `--cta:${t.cta};` +
    `--cta-foreground:${t.ctaForeground};` +
    `--ring:${t.accent};` +
    `--border:color-mix(in oklab, ${t.foreground} 12%, ${t.background});` +
    `--input:color-mix(in oklab, ${t.foreground} 14%, ${t.background});` +
    `--muted:color-mix(in oklab, ${t.primary} 7%, ${t.background});` +
    `--muted-foreground:color-mix(in oklab, ${t.foreground} 62%, ${t.background});` +
    `--card:#ffffff;` +
    `--card-foreground:${t.foreground};` +
    `--radius:${t.radius};` +
    `}`;
}

/**
 * The same palette as an inline style object, for the live preview in the
 * editor — where the theme changes on every keystroke and re-emitting a style
 * tag would be wasteful.
 */
export function themeToStyle(theme: PageTheme | undefined): CSSProperties {
  const t = resolve(theme);
  return {
    '--background': t.background,
    '--foreground': t.foreground,
    '--primary': t.primary,
    '--primary-foreground': t.primaryForeground,
    '--secondary': t.accent,
    '--secondary-foreground': contrastOn(t.accent),
    '--accent-strong': t.accent,
    '--cta': t.cta,
    '--cta-foreground': t.ctaForeground,
    '--ring': t.accent,
    '--card': '#ffffff',
    '--card-foreground': t.foreground,
    '--radius': t.radius,
  } as CSSProperties;
}

export { resolve as resolveTheme };
