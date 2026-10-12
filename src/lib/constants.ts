/**
 * Slugs reserved for the platform itself.
 *
 * app/(platform) static segments and the app/(tenant)/[tenantSlug] dynamic
 * segment share one URL space. Next gives static segments precedence, so
 * /platform resolves correctly even though /[tenantSlug] exists — but only
 * because no tenant can claim the slug "platform". This list is enforced at
 * tenant creation (422) and asserted against the real route tree in a test.
 *
 * Keep in sync with server/src/utils/slug.js RESERVED_SLUGS.
 */
export const RESERVED_SLUGS = new Set([
  'platform', 'admin', 'login', 'logout', 'signup', 'register', 'dashboard',
  'api', 'internal', '_next', 'ul', 'assets', 'static', 'public', 'uploads',
  'pricing', 'docs', 'help', 'support', 'about', 'legal', 'terms', 'privacy',
  'blog', 'status', 'www', 'mail', 'email', 'cdn', 'img', 'images', 'media',
  'app', 'auth', 'account', 'billing', 'settings', 'onboarding', 'demo', 'test', 'templates',
]);

export const LOCALES = ['bn', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'bn';
export const LOCALE_COOKIE = 'UL_LOCALE';

export const LOCALE_LABELS: Record<Locale, string> = {
  bn: 'বাংলা',
  en: 'English',
};

export const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'returned', 'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Tailwind classes per status, used by the orders table and the drawer. */
export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  confirmed: 'bg-blue-100 text-blue-900',
  processing: 'bg-indigo-100 text-indigo-900',
  shipped: 'bg-violet-100 text-violet-900',
  delivered: 'bg-emerald-100 text-emerald-900',
  returned: 'bg-orange-100 text-orange-900',
  cancelled: 'bg-rose-100 text-rose-900',
};

export const PAYMENT_METHODS = [
  'cod', 'manual_bkash', 'manual_nagad', 'manual_rocket', 'bank_transfer',
] as const;

export const TENANT_ROLES = ['tenant_owner', 'tenant_admin', 'tenant_staff'] as const;
export const PLATFORM_ROLES = ['platform_owner', 'platform_admin', 'platform_support'] as const;

/** Headers the proxy sets. Always overwritten there, never trusted from a client. */
export const TENANT_HEADERS = {
  slug: 'x-ul-tenant-slug',
  id: 'x-ul-tenant-id',
  basePath: 'x-ul-base-path',
  hostMode: 'x-ul-host-mode',
  requestHost: 'x-ul-request-host',
  primaryHost: 'x-ul-primary-host',
  locale: 'x-ul-locale',
  surface: 'x-ul-surface',
} as const;

export type HostMode = 'platform' | 'path' | 'subdomain' | 'custom';

/**
 * Which part of the product a request is for. Set by the proxy and used to
 * ship only the message namespaces that surface actually needs.
 */
export type Surface = 'platform' | 'tenant-public' | 'tenant-admin';

/**
 * next-intl serialises whatever getRequestConfig returns into the page
 * payload. Returning the whole catalogue puts every dashboard label into every
 * public landing page — measured at all 6 dashboard-only strings present, for
 * roughly 10 KB of Bangla JSON a visitor can never see. A storefront needs two
 * namespaces.
 *
 * The admin keeps `storefront` because its live preview renders the real
 * landing-page blocks.
 */
export const SURFACE_NAMESPACES: Record<Surface, string[]> = {
  platform: ['common', 'auth', 'platform'],
  'tenant-public': ['common', 'storefront'],
  'tenant-admin': ['common', 'auth', 'admin', 'storefront'],
};
