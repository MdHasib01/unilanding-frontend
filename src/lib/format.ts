import type { Locale } from './constants';

/**
 * Locale-aware number and currency formatting.
 *
 * Generalises the reference's formatBengaliNumber, which existed as a helper
 * AND as inline digit maps copy-pasted into several components. One
 * implementation here, driven by Intl, so Bengali numerals come from the
 * platform rather than a hand-written lookup table.
 */

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** Converts ASCII digits in an arbitrary string to Bengali numerals. */
export const toBengaliDigits = (input: string | number): string =>
  String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

export const toAsciiDigits = (input: string): string =>
  input.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

const CURRENCY_SYMBOL: Record<string, string> = { BDT: '৳', USD: '$' };

/**
 * Formats a number as money. Accepts a pre-formatted string too, because
 * tenant-authored "cost breakdown" rows are free text — someone may well type
 * "৮–১০ লাখ" and that should pass through untouched rather than become NaN.
 */
export function formatMoney(
  value: number | string,
  currency = 'BDT',
  locale: Locale = 'bn'
): string {
  if (typeof value === 'string') {
    const cleaned = toAsciiDigits(value).replace(/[,\s]/g, '');
    if (cleaned === '' || Number.isNaN(Number(cleaned))) return value;
    value = Number(cleaned);
  }

  const symbol = CURRENCY_SYMBOL[currency] ?? '';
  const grouped = new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US', {
    maximumFractionDigits: 0,
  }).format(value);

  return `${symbol}${grouped}`;
}

export function formatNumber(value: number, locale: Locale = 'bn'): string {
  return new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US').format(value);
}

export function formatDate(
  value: string | Date,
  locale: Locale = 'bn',
  opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
    timeZone: 'Asia/Dhaka',
    ...opts,
  }).format(d);
}

export const formatDateTime = (value: string | Date, locale: Locale = 'bn') =>
  formatDate(value, locale, { dateStyle: 'medium', timeStyle: 'short' });

/** "12%" discount between a list price and a sale price. */
export function discountPercent(list: number, sale: number): number | null {
  if (!list || !sale || sale >= list) return null;
  return Math.round(((list - sale) / list) * 100);
}
