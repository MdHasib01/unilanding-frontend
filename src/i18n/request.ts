import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from '@/lib/constants';

/**
 * next-intl WITHOUT i18n routing — no [locale] URL segment, no proxy involvement.
 *
 * Why not localePrefix: 'never'? Because that still rewrites a locale prefix in
 * internally, which forces an app/[locale]/ segment nested inside
 * [tenantSlug] — and it would put /bn/ in front of every tenant's own domain.
 * A tenant selling on milkready.com wants milkready.com/, not milkready.com/bn.
 *
 * Resolution order:
 *   1. UL_LOCALE cookie   — an explicit choice by this visitor or dashboard user
 *   2. x-ul-locale header — the tenant's defaultLocale, set by the proxy, so the
 *                           very first byte is already in the right language
 *   3. bn                 — the platform default
 */
export default getRequestConfig(async () => {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);

  const candidates = [
    cookieStore.get(LOCALE_COOKIE)?.value,
    headerList.get('x-ul-locale') || undefined,
  ];

  const locale =
    (candidates.find((c): c is Locale => Boolean(c) && LOCALES.includes(c as Locale)) as Locale) ??
    DEFAULT_LOCALE;

  return {
    // Required in next-intl v4: getRequestConfig must return the locale.
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Dhaka',
    now: new Date(),
  };
});
