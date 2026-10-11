import { serverEnv } from '@/env';

/**
 * Server-side data loading for public pages.
 *
 * Calls the API directly (not through the Next rewrite), because a server
 * component talking to itself over HTTP would be a pointless extra hop. Tagged
 * so a publish can invalidate exactly the affected tenant.
 */

type Envelope<T> = { success: boolean; data?: T; error?: string; code?: string };

async function get<T>(
  path: string,
  { tags = [], revalidate = 30 }: { tags?: string[]; revalidate?: number } = {}
): Promise<T | null> {
  try {
    const res = await fetch(`${serverEnv.backendUrl}/api${path}`, {
      headers: { accept: 'application/json' },
      next: { revalidate, tags },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Envelope<T>;
    return json.success ? (json.data ?? null) : null;
  } catch {
    // A page should degrade to notFound(), never to an unhandled 500.
    return null;
  }
}

export type PublicTenant = {
  id: string;
  slug: string;
  name: string;
  logo?: { url?: string; publicId?: string };
  favicon?: { url?: string };
  productName?: string;
  defaultLocale: 'bn' | 'en';
  enabledLocales: ('bn' | 'en')[];
  currency: string;
  timezone: string;
  contact: { phone?: string; whatsapp?: string; email?: string; address?: string };
  whiteLabel: boolean;
};

export type PublicSection = {
  key: string;
  type: string;
  order: number;
  data: Record<string, unknown>;
};

export type PublicPage = {
  id: string;
  name: string;
  slug: string;
  isHome: boolean;
  template: string;
  revision: number;
  publishedAt: string | null;
  seo: {
    title?: Record<string, string> | string;
    description?: Record<string, string> | string;
    keywords?: string[];
    ogImage?: { url?: string };
    canonicalOverride?: string;
    noindex?: boolean;
  };
  theme: Record<string, string>;
  tracking: Record<string, string>;
  sections: PublicSection[];
};

export type PublicProduct = {
  id: string;
  name: string;
  nameEn?: string;
  sku?: string;
  description?: string;
  image?: { url?: string };
  gallery?: { url?: string }[];
  basePrice: number;
  offerPrice: number | null;
  weight?: string;
  unit?: string;
  tag?: string;
  variants: {
    id: string;
    name: string;
    price: number;
    offerPrice: number | null;
    weight?: string;
    image?: { url?: string };
  }[];
};

export type PublicSettings = {
  general: Record<string, string>;
  orders: {
    deliveryCharges: { inside: number; outside: number; freeAbove: number | null; insideLabel?: string };
    requireDistrict: boolean;
    requireThana: boolean;
    allowAltPhone: boolean;
    requireEmail: boolean;
    locations: { district: string; thanas?: string[] }[];
  };
  payments: Record<string, { enabled: boolean; number?: string; instructions?: string; label?: string; details?: string }>;
  otpOnOrder: boolean;
};

export type PageBundle = {
  tenant: PublicTenant;
  primaryHost: string;
  locale: 'bn' | 'en';
  preview?: boolean;
  page: PublicPage;
  products: PublicProduct[];
  settings: PublicSettings;
};

export const getPublicPage = (slug: string, pageSlug = '', locale?: string) =>
  get<PageBundle>(
    `/public/pages/${encodeURIComponent(slug)}${pageSlug ? `/${encodeURIComponent(pageSlug)}` : ''}` +
      (locale ? `?locale=${locale}` : ''),
    { tags: [`tenant:${slug}`, `page:${slug}:${pageSlug || 'home'}`] }
  );

export const getPublicBootstrap = (slug: string) =>
  get<{ tenant: PublicTenant; primaryHost: string; settings: PublicSettings }>(
    `/public/bootstrap/${encodeURIComponent(slug)}`,
    { tags: [`tenant:${slug}`] }
  );

/** Draft render behind a signed token. Never cached. */
export const getPreviewPage = (slug: string, token: string) =>
  get<PageBundle>(
    `/public/pages/${encodeURIComponent(slug)}/preview?token=${encodeURIComponent(token)}`,
    { revalidate: 0 }
  );

export const getPublicProducts = (slug: string) =>
  get<PublicProduct[]>(`/public/products/${encodeURIComponent(slug)}`, {
    tags: [`tenant:${slug}`],
  });
