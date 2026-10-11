import { NextResponse, type NextRequest } from 'next/server';
import { RESERVED_SLUGS, TENANT_HEADERS, type HostMode } from '@/lib/constants';

/**
 * Tenant resolution.
 *
 * In Next.js 16 this file is `proxy.ts`, not `middleware.ts` — and it runs on
 * the NODE runtime, which the edge-based multi-tenant designs cannot assume.
 * Two consequences this file depends on:
 *
 *   1. The module-scope Map below genuinely persists across requests in a
 *      long-lived server process, so a custom-domain lookup is one call per
 *      host per minute rather than one per request.
 *   2. No 1 MB edge bundle limit and no per-region cold start.
 *
 * The docs are explicit that proxy "is not intended for slow data fetching",
 * so this file does cheap host arithmetic and at most one tiny internal call.
 * Authoritative tenant data is fetched in the tenant layout (a cached server
 * component) instead.
 *
 * Note on /ul: that segment deliberately has NO leading underscore. A folder
 * named _ul or __ul is a PRIVATE folder in the App Router and is excluded from
 * routing entirely, so rewrites into it 404 silently. "ul" is in
 * RESERVED_SLUGS so no tenant can claim it.
 *
 * Three routing modes converge on one route tree, app/(tenant)/[tenantSlug]:
 *
 *   unilanding.com/milkready        -> no rewrite, falls through to [tenantSlug]
 *   milkready.unilanding.com/       -> rewrite to /milkready       (no lookup)
 *   milkready.com/                  -> rewrite to /milkready       (cached lookup)
 */

export const config = {
  /**
   * Excluded, each for a reason:
   *   api/       — API calls are rewritten straight to Express, which does
   *                its own tenant resolution. Without this exclusion the
   *                proxy rewrites /api/* to the unknown-domain PAGE, and
   *                every fetch from a tenant site silently receives HTML
   *                instead of JSON.
   *   ul/        — internal handlers (session handoff, revalidate, the
   *                unknown-domain and suspended screens). Re-resolving them
   *                would loop for an unresolvable host.
   *   _next/*    — build output and the image optimiser.
   *   *.ext      — static files in public/.
   */
  matcher: ['/((?!api/|ul/|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)'],
};

const PLATFORM_HOST = (process.env.PLATFORM_HOST || 'unilanding.local:3000')
  .split(':')[0]
  .toLowerCase();
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://127.0.0.1:5000';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || '';

/**
 * Whether to believe X-Forwarded-Host.
 *
 * On Vercel, request.headers.get('host') is already the real public host, so
 * this stays off. Behind nginx/HAProxy with proxy_pass, Host can be rewritten
 * to the upstream and the original only survives in X-Forwarded-Host — those
 * deployments must set TRUST_PROXY_HOST=true.
 *
 * It is opt-in because trusting it unconditionally would let any client pick
 * which tenant's PUBLIC page renders by setting a header, which is a cache
 * poisoning vector in front of a CDN. (It could not bypass auth: session
 * cookies are host-only and the API cross-checks the JWT's tenant id.)
 */
const TRUST_PROXY_HOST = process.env.TRUST_PROXY_HOST === 'true';

type Resolved = {
  slug: string;
  tenantId: string;
  primaryHost: string;
  status: 'active' | 'suspended';
  defaultLocale: string;
  redirectTo: string;
} | null;

type Entry = { value: Resolved; hard: number; soft: number };

const POSITIVE_TTL = 60_000;
// Shorter, so a newly mapped domain starts working quickly even without a bust.
const NEGATIVE_TTL = 30_000;
const SOFT_TTL = 20_000;
const MAX_ENTRIES = 2000;

const cache = new Map<string, Entry>();
const inFlight = new Map<string, Promise<Resolved>>();

/** The host this request is for. See TRUST_PROXY_HOST above. */
function effectiveHost(request: NextRequest): string {
  if (TRUST_PROXY_HOST) {
    const fwd = request.headers.get('x-forwarded-host');
    // A comma-separated chain means several proxies appended to it; the first
    // entry is the original client-facing host.
    if (fwd) return normalizeHost(fwd.split(',')[0]);
  }
  return normalizeHost(request.headers.get('host'));
}

/** Strip port and trailing dot; lowercase. Dev hosts carry :3000. */
function normalizeHost(raw: string | null): string {
  if (!raw) return '';
  let h = raw.trim().toLowerCase();
  if (h.startsWith('[')) {
    const close = h.indexOf(']');
    if (close !== -1) return h.slice(1, close);
  }
  const colon = h.lastIndexOf(':');
  if (colon !== -1 && /^\d+$/.test(h.slice(colon + 1))) h = h.slice(0, colon);
  if (h.endsWith('.')) h = h.slice(0, -1);
  return h;
}

async function fetchHost(host: string): Promise<Resolved> {
  try {
    const res = await fetch(
      `${INTERNAL_API_URL}/api/internal/resolve-host?host=${encodeURIComponent(host)}`,
      {
        headers: { 'x-internal-key': INTERNAL_API_KEY },
        // fetch cache options are inert in proxy; the Map above is the cache.
        cache: 'no-store',
        signal: AbortSignal.timeout(2500),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const d = json?.data;
    if (!d?.found) return null;
    return {
      slug: d.slug,
      tenantId: d.tenantId,
      primaryHost: d.primaryHost,
      status: d.status,
      defaultLocale: d.defaultLocale || 'bn',
      redirectTo: d.redirectTo || '',
    };
  } catch {
    // A lookup failure must never take a live storefront down; the caller
    // falls back to any stale value it has.
    return null;
  }
}

/**
 * Cached lookup with stale-while-revalidate and single-flight.
 *
 * Negative results are cached too: without that, traffic to an unmapped host
 * would turn the proxy into a lookup amplifier against our own API.
 */
async function resolveHost(host: string): Promise<Resolved> {
  const now = Date.now();
  const hit = cache.get(host);

  if (hit && hit.hard > now) {
    if (hit.soft < now && !inFlight.has(host)) {
      // Serve stale immediately, refresh in the background.
      const p = fetchHost(host)
        .then((value) => {
          store(host, value);
          return value;
        })
        .finally(() => inFlight.delete(host));
      inFlight.set(host, p);
    }
    return hit.value;
  }

  const pending = inFlight.get(host);
  if (pending) return pending;

  const p = fetchHost(host)
    .then((value) => {
      store(host, value);
      return value;
    })
    .catch(() => (hit ? hit.value : null))
    .finally(() => inFlight.delete(host));

  inFlight.set(host, p);
  return p;
}

function store(host: string, value: Resolved) {
  if (cache.size > MAX_ENTRIES) cache.clear();
  const ttl = value ? POSITIVE_TTL : NEGATIVE_TTL;
  cache.set(host, { value, hard: Date.now() + ttl, soft: Date.now() + SOFT_TTL });
}

/** Exposed so /ul/revalidate can make a domain change take effect at once. */
export function bustHostCache(host?: string) {
  if (host) cache.delete(normalizeHost(host));
  else cache.clear();
}

function withTenantHeaders(
  request: NextRequest,
  ctx: {
    slug: string;
    basePath: string;
    mode: HostMode;
    host: string;
    tenantId?: string;
    primaryHost?: string;
    locale?: string;
  },
  rewriteTo?: URL
) {
  // Build the forwarded headers from the incoming set, then OVERWRITE every
  // x-ul-* key. A client that sends its own x-ul-tenant-slug must not be able
  // to influence which tenant renders.
  const headers = new Headers(request.headers);
  headers.set(TENANT_HEADERS.slug, ctx.slug);
  headers.set(TENANT_HEADERS.basePath, ctx.basePath);
  headers.set(TENANT_HEADERS.hostMode, ctx.mode);
  headers.set(TENANT_HEADERS.requestHost, ctx.host);
  headers.set(TENANT_HEADERS.id, ctx.tenantId ?? '');
  headers.set(TENANT_HEADERS.primaryHost, ctx.primaryHost ?? ctx.host);
  headers.set(TENANT_HEADERS.locale, ctx.locale ?? '');

  return rewriteTo
    ? NextResponse.rewrite(rewriteTo, { request: { headers } })
    : NextResponse.next({ request: { headers } });
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const host = effectiveHost(request);
  const firstSegment = url.pathname.split('/')[1] ?? '';

  // ── 1. The platform host. No lookup, no rewrite. ──
  if (host === PLATFORM_HOST || host === `www.${PLATFORM_HOST}`) {
    // /admin is tenant-only; on the platform host it means the platform dashboard.
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      return NextResponse.redirect(new URL('/platform', url));
    }

    // A non-reserved first segment is a path-mode tenant: unilanding.com/milkready.
    // It falls through to [tenantSlug] with no rewrite — one less hop, and the
    // public URL is exactly the one the product promises.
    if (firstSegment && !RESERVED_SLUGS.has(firstSegment)) {
      return withTenantHeaders(request, {
        slug: firstSegment,
        basePath: `/${firstSegment}`,
        mode: 'path',
        host,
      });
    }
    return NextResponse.next();
  }

  // ── 2. A platform subdomain. The label IS the slug, so still no lookup. ──
  if (host.endsWith(`.${PLATFORM_HOST}`)) {
    const label = host.slice(0, -(PLATFORM_HOST.length + 1));
    if (!label || label.includes('.') || RESERVED_SLUGS.has(label)) {
      return NextResponse.next();
    }
    return withTenantHeaders(
      request,
      { slug: label, basePath: '', mode: 'subdomain', host, primaryHost: host },
      new URL(`/${label}${url.pathname}${url.search}`, url)
    );
  }

  // ── 3. A custom domain. The only branch that costs a lookup. ──
  const tenant = await resolveHost(host);

  if (!tenant) {
    return NextResponse.rewrite(new URL('/ul/unknown-domain', url));
  }

  // www -> apex, or any configured redirect.
  if (tenant.redirectTo) {
    const scheme = request.headers.get('x-forwarded-proto') || 'https';
    return NextResponse.redirect(
      `${scheme}://${tenant.redirectTo}${url.pathname}${url.search}`,
      301
    );
  }

  if (tenant.status === 'suspended') {
    return NextResponse.rewrite(new URL('/ul/suspended', url));
  }

  return withTenantHeaders(
    request,
    {
      slug: tenant.slug,
      basePath: '',
      mode: 'custom',
      host,
      tenantId: tenant.tenantId,
      primaryHost: tenant.primaryHost,
      locale: tenant.defaultLocale,
    },
    new URL(`/${tenant.slug}${url.pathname}${url.search}`, url)
  );
}

export default proxy;
