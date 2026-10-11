import type { Locale } from './constants';

/**
 * Tenant-authored text is a locale map, not a string.
 *
 * Section STRUCTURE (order, visibility) is shared across locales so a tenant
 * arranges the page once; only the copy is per-language. A tenant with a single
 * enabled locale just has a one-key map, and the editor shows a plain input
 * with no language tabs — so bilingual support costs them nothing.
 */
export type I18nText = Partial<Record<Locale, string>>;
/**
 * Section data comes out of Mongo as an untyped blob, so call sites hold
 * `unknown`. tt() does the narrowing itself rather than forcing a cast at
 * every one of the ~25 places a section renders a string.
 */
export type MaybeI18nText = I18nText | string | null | undefined | unknown;

/**
 * Resolves a localised value with a fallback chain, so a half-translated page
 * renders the other language rather than an empty element.
 *
 * Accepts a plain string too: content authored before a tenant enabled a second
 * locale, and section defaults, are stored that way.
 */
export function tt(value: MaybeI18nText, locale: Locale, fallback: Locale = 'bn'): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object' || Array.isArray(value)) return '';

  const map = value as I18nText;
  const exact = map[locale];
  if (exact !== undefined && exact !== '') return exact;

  const fb = map[fallback];
  if (fb !== undefined && fb !== '') return fb;

  // Last resort: any non-empty translation beats showing nothing.
  for (const v of Object.values(map)) {
    if (v) return v;
  }
  return '';
}

/** Writes one locale of a map without disturbing the others. */
export function setTt(value: MaybeI18nText, locale: Locale, next: string): I18nText {
  const base: I18nText =
    typeof value === 'string'
      ? { bn: value }
      : { ...((value ?? {}) as I18nText) };
  base[locale] = next;
  return base;
}

export const isI18nText = (v: unknown): v is I18nText =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/** True when at least one locale has content; used to hide empty sections. */
export const hasTt = (v: MaybeI18nText): boolean => {
  if (!v) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v !== 'object') return false;
  return Object.values(v as I18nText).some((s) => s && s.trim().length > 0);
};
