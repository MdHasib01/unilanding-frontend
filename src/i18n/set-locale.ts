'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { LOCALES, LOCALE_COOKIE, type Locale } from '@/lib/constants';

/**
 * Switching language is a cookie write plus a re-render. Because the locale is
 * not in the URL, there is nothing to navigate to — which is exactly why this
 * setup survives multi-tenancy and custom domains cleanly.
 *
 * Note: a Server Function is a POST to the route it is used on, so proxy
 * matcher changes can silently remove coverage. This action therefore does not
 * rely on the proxy for anything; it only writes a cookie.
 */
export async function setLocale(locale: Locale, pathname = '/') {
  if (!LOCALES.includes(locale)) return { ok: false as const };

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    // No Domain attribute: a visitor's language choice on one tenant's site is
    // theirs alone and must not leak across tenant domains.
  });

  revalidatePath(pathname);
  return { ok: true as const, locale };
}
