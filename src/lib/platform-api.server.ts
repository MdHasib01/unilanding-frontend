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

export const platformApi = {
  overview: () => get<Overview>('/platform/overview'),
  tenants: (query = '') => get<TenantSummary[]>(`/platform/tenants${query ? `?${query}` : ''}`),
  tenant: (id: string) => get<TenantDetail>(`/platform/tenants/${id}`),
  plans: () => get<PlanRow[]>('/platform/plans'),
};
