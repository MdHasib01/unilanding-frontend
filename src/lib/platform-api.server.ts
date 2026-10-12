import { cookies, headers } from 'next/headers';
import { serverEnv } from '@/env';

/**
 * Server-side reads for the platform dashboard.
 *
 * Forwards the caller's own session cookie, so the API authorises the real user
 * rather than this tier holding any privileged key. A support-role user
 * therefore sees exactly what the API lets them see, with no second
 * authorisation model to keep in sync.
 *
 * Never cached: a dashboard showing a stale tenant list is worse than a
 * slightly slower one.
 */

export type TenantSummary = {
  _id: string;
  slug: string;
  name: string;
  status: 'pending' | 'active' | 'suspended' | 'archived';
  plan?: { code: string; name: string; price: number; limits: Record<string, number | null> };
  defaultLocale: 'bn' | 'en';
  enabledLocales: ('bn' | 'en')[];
  expiresAt: string | null;
  usage?: Record<string, number | string>;
  logo?: { url?: string };
  productName?: string;
  contact?: { email?: string; phone?: string };
  createdAt: string;
};

export type Overview = {
  tenants: {
    total: number;
    byStatus: Record<string, number>;
    byPlan: Record<string, number>;
  };
  orders: { today: number; last7Days: number };
  mrr: number;
  recentTenants: TenantSummary[];
};

export type DomainRow = {
  _id: string;
  host: string;
  type: 'platform_subdomain' | 'custom_apex' | 'custom_subdomain';
  isPrimary: boolean;
  status: 'pending' | 'verifying' | 'active' | 'error' | 'disabled';
  verification?: {
    method?: string;
    recordName?: string;
    recordValue?: string;
    lastError?: string;
    verifiedAt?: string | null;
  };
  ssl?: { status?: string; provider?: string };
  redirectTo?: string;
};

export type TenantDetail = {
  tenant: TenantSummary & {
    flags?: Record<string, boolean>;
    onboarding?: { step: string };
    notes?: string;
    timezone?: string;
    currency?: string;
  };
  domains: DomainRow[];
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    mustChangePassword: boolean;
    lastLoginAt: string | null;
  }[];
  pages: {
    _id: string;
    name: string;
    slug: string;
    isHome: boolean;
    status: 'draft' | 'published';
    revision: number;
    publishedAt: string | null;
  }[];
  counts: { products: number; orders: number };
  usage: Record<string, number | string>;
  primaryHost: string;
};

export type PlanRow = {
  _id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  limits: Record<string, number | null>;
  features: string[];
  active: boolean;
  public?: boolean;
  sortOrder?: number;
  /** How many tenants currently hold this plan's snapshot. */
  tenantCount?: number;
};

export type Pagination = { total: number; page: number; limit: number; pages: number };
export type Paged<T> = { items: T[]; pagination: Pagination };

export type TenantRef = { _id: string; slug: string; name: string } | null;

export type OrderRow = {
  _id: string;
  tenantId: string;
  tenant: TenantRef;
  orderNumber: string;
  publicId: string;
  locale: 'bn' | 'en';
  customer: { name: string; phone: string; altPhone?: string; email?: string };
  shipping: { district?: string; thana?: string; address?: string; postcode?: string; note?: string };
  items: { name: string; sku?: string; unitPrice: number; qty: number; subtotal: number }[];
  pricing: { subtotal: number; deliveryCharge: number; discount: number; total: number; currency: string };
  payment: { method: string; status: string; transactionId?: string; paidAmount?: number };
  status: string;
  statusHistory: { status: string; at: string; byName?: string; note?: string }[];
  source: string;
  marketing?: { attribution?: Record<string, string | null> };
  client?: { ip?: string; pageUrl?: string; ipLocation?: { city?: string; country?: string } };
  internalNote?: string;
  createdAt: string;
};

export type DomainListRow = DomainRow & {
  tenantId: string;
  tenant: TenantRef;
  verification?: DomainRow['verification'] & { attempts?: number; lastCheckedAt?: string | null };
  createdAt: string;
};

export type AuditRow = {
  _id: string;
  tenantId: string | null;
  tenant: TenantRef;
  actorEmail: string;
  actorScope: string;
  actorIp: string;
  action: string;
  targetType: string;
  targetId: string;
  diff: unknown;
  createdAt: string;
};

export type PlatformSettings = {
  platformHost: string;
  publicBaseUrl: string;
  environment: string;
  hostAliases: string[];
  cookieSecure: boolean;
  integrations: { email: boolean; cloudinary: boolean };
};

async function get<T>(path: string): Promise<T | null> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  const cookie = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  try {
    const res = await fetch(`${serverEnv.backendUrl}/api${path}`, {
      headers: { cookie, 'x-forwarded-host': headerList.get('host') ?? '' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? ((json.data ?? null) as T) : null;
  } catch {
    return null;
  }
}

/** Like get(), but keeps the pagination block that list endpoints return. */
async function getList<T>(path: string): Promise<Paged<T> | null> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  const cookie = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  try {
    const res = await fetch(`${serverEnv.backendUrl}/api${path}`, {
      headers: { cookie, 'x-forwarded-host': headerList.get('host') ?? '' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return {
      items: (json.data ?? []) as T[],
      pagination: json.pagination ?? { total: 0, page: 1, limit: 20, pages: 1 },
    };
  } catch {
    return null;
  }
}

const withQuery = (path: string, query: string) => (query ? `${path}?${query}` : path);

export const platformApi = {
  overview: () => get<Overview>('/platform/overview'),
  tenants: (query = '') => get<TenantSummary[]>(`/platform/tenants${query ? `?${query}` : ''}`),
  tenant: (id: string) => get<TenantDetail>(`/platform/tenants/${id}`),
  plans: () => get<PlanRow[]>('/platform/plans'),
  orders: (query = '') => getList<OrderRow>(withQuery('/platform/orders', query)),
  domains: (query = '') => getList<DomainListRow>(withQuery('/platform/domains', query)),
  audit: (query = '') => getList<AuditRow>(withQuery('/platform/audit', query)),
  settings: () => get<PlatformSettings>('/platform/settings'),
};
