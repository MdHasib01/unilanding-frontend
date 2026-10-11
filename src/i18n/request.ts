import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  SURFACE_NAMESPACES,
  TENANT_HEADERS,
  type Locale,
  type Surface,
} from '@/lib/constants';

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

  const all = (await import(`../../messages/${locale}.json`)).default as Record<
    string,
    unknown
  >;

  /*
   * Ship only the namespaces this surface uses.
   *
   * next-intl serialises whatever is returned here into the page payload, so
   * returning everything put every dashboard label into every public landing
   * page. The storefront needs two namespaces out of five.
   */
  const surface = (headerList.get(TENANT_HEADERS.surface) as Surface) || 'tenant-public';
  const wanted = SURFACE_NAMESPACES[surface] ?? SURFACE_NAMESPACES['tenant-public'];
  const messages = Object.fromEntries(
    wanted.filter((ns) => ns in all).map((ns) => [ns, all[ns]])
  );

  return {
    // Required in next-intl v4: getRequestConfig must return the locale.
    locale,
    messages,
    timeZone: 'Asia/Dhaka',
    now: new Date(),
  };
});
