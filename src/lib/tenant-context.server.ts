import { headers } from 'next/headers';
import { TENANT_HEADERS, type HostMode, type Locale, LOCALES, DEFAULT_LOCALE } from './constants';

export type TenantContext = {
  slug: string;
  tenantId: string;
  /**
   * '' on a tenant's own host, '/<slug>' in path mode.
   *
   * Every link inside app/(tenant) must go through this. A bare
   * <Link href="/thank-you"> works on milkready.com and 404s on
   * unilanding.com/milkready — and it would be the order-success redirect that
   * breaks, silently, only for path-mode tenants.
   */
  basePath: string;
  hostMode: HostMode;
  requestHost: string;
  /** Canonical host, so the three routing modes don't create duplicate content. */
  primaryHost: string;
  locale: Locale;
};

/**
 * Reads the context the proxy stamped onto the request.
 *
 * These headers are overwritten unconditionally in proxy.ts, so a client cannot
 * spoof them. The slug param is the fallback for direct path-mode hits, which
 * the proxy passes through without a rewrite.
 */
export async function getTenantContext(slugFromParams?: string): Promise<TenantContext> {
  const h = await headers();

  const slug = h.get(TENANT_HEADERS.slug) || slugFromParams || '';
  const hostMode = (h.get(TENANT_HEADERS.hostMode) as HostMode) || 'path';
  const requestHost = h.get(TENANT_HEADERS.requestHost) || '';
  const headerLocale = h.get(TENANT_HEADERS.locale);

  // In path mode the slug is part of the URL, so links need it prefixed.
  const basePath =
    h.get(TENANT_HEADERS.basePath) ?? (hostMode === 'path' ? `/${slug}` : '');

  return {
    slug,
    tenantId: h.get(TENANT_HEADERS.id) || '',
    basePath,
    hostMode,
    requestHost,
    primaryHost: h.get(TENANT_HEADERS.primaryHost) || requestHost,
    locale:
      headerLocale && LOCALES.includes(headerLocale as Locale)
        ? (headerLocale as Locale)
        : DEFAULT_LOCALE,
  };
}

/** Absolute URL on the tenant's canonical host, for metadata and OG tags. */
export function canonicalUrl(ctx: TenantContext, path = '/'): string {
  const scheme = ctx.requestHost.includes('.local') ? 'http' : 'https';
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${scheme}://${ctx.primaryHost}${clean}`;
}
