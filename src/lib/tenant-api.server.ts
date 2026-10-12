import { cookies, headers } from 'next/headers';
import { serverEnv } from '@/env';
import type { PublicProduct, PublicSettings, PublicTenant } from './server-api';
import type { PageBrand } from './brand';
import type { PageTheme } from './theme-css';

/**
 * Server-side calls to the tenant admin API (/api/t/*), on behalf of the
 * signed-in user: their cookies and host are forwarded, so the API applies
 * exactly the same session, tenant and role checks as a browser call.
 */
async function tenantGet<T>(path: string, tenantSlug: string): Promise<T | null> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  const cookie = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  if (!cookie) return null;

  try {
    const res = await fetch(`${serverEnv.backendUrl}/api${path}`, {
      headers: {
        accept: 'application/json',
        cookie,
        'x-forwarded-host': headerList.get('host') ?? '',
        'x-tenant-slug': tenantSlug,
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data as T) : null;
  } catch {
    return null;
  }
}

export type EditorSection = {
  key: string;
  type: string;
  order: number;
  enabled: boolean;
  data: Record<string, unknown>;
};

export type EditorSlot = {
  brand: PageBrand;
  theme: PageTheme;
  seo: Record<string, unknown>;
  sections: EditorSection[];
};

export type EditorPage = {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
  template: string;
  status: 'draft' | 'published';
  revision: number;
  publishedAt: string | null;
  dirty: boolean;
  draftUpdatedAt: string | null;
  draft: EditorSlot;
  live: EditorSlot;
};

export type EditorBundle = {
  page: EditorPage;
  tenant: PublicTenant;
  primaryHost: string;
  products: PublicProduct[];
  settings: PublicSettings;
  canEdit: boolean;
};

export const getEditorBundle = (tenantSlug: string) =>
  tenantGet<EditorBundle>('/t/pages/home', tenantSlug);
