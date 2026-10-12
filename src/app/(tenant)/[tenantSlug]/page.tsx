import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTenantContext, canonicalUrl } from '@/lib/tenant-context.server';
import { getPublicPage, getPreviewPage } from '@/lib/server-api';
import { themeToCss } from '@/lib/theme-css';
import { resolveBrand } from '@/lib/brand';
import { tt } from '@/lib/i18n-text';
import { RenderPage } from '@/sections/renderer';
import { TenantAnalytics } from '@/components/analytics/tenant-analytics';
import { LandingLoader } from '@/components/landing/landing-loader';
import { loaderSeenScript } from '@/components/landing/loader-seen';
import type { SectionCtx } from '@/sections/types';

type Props = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function load(params: Props['params'], searchParams: Props['searchParams']) {
  const [{ tenantSlug }, sp] = await Promise.all([params, searchParams]);
  const ctx = await getTenantContext(tenantSlug);

  // A signed preview token renders the DRAFT on the real URL, so a tenant can
  // show a client an unpublished change without publishing it.
  const token = typeof sp.preview === 'string' ? sp.preview : undefined;
  const bundle = token
    ? await getPreviewPage(ctx.slug, token)
    : await getPublicPage(ctx.slug, '', ctx.locale);

  return { ctx, bundle };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { ctx, bundle } = await load(params, searchParams);
  if (!bundle) return { title: 'Not found', robots: { index: false, follow: false } };

  const { page, tenant, locale } = bundle;
  const brand = resolveBrand(page.brand, tenant.name);
  const title = tt(page.seo?.title, locale, tenant.defaultLocale) || brand.name;
  const description = tt(page.seo?.description, locale, tenant.defaultLocale);
  // Always the tenant's PRIMARY host, never the host this request arrived on,
  // or path mode / subdomain / custom domain would compete as three copies of
  // one page.
  //
  // bundle.primaryHost comes from the API and is authoritative. ctx.primaryHost
  // comes from the proxy header, which in PATH mode is only the platform host —
  // using it there advertised unilanding.com as the canonical for every
  // tenant's page.
  const canonical =
    page.seo?.canonicalOverride || canonicalUrl({ ...ctx, primaryHost: bundle.primaryHost }, '/');
  // A page without its own share image falls back to the product shot.
  const ogImage = page.seo?.ogImage?.url || brand.productImageUrl;
  const favicon = brand.faviconUrl || tenant.favicon?.url;

  return {
    title,
    description,
    alternates: { canonical },
    robots: page.seo?.noindex ? { index: false, follow: false } : undefined,
    keywords: page.seo?.keywords,
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: brand.name,
      type: 'website',
      locale: locale === 'bn' ? 'bn_BD' : 'en_US',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function TenantLandingPage({ params, searchParams }: Props) {
  const { ctx, bundle } = await load(params, searchParams);
  if (!bundle) notFound();

  const { tenant, page, products, settings, locale } = bundle;
  const brand = resolveBrand(page.brand, tenant.name);

  const sectionCtx: SectionCtx = {
    tenant,
    brand,
    locale,
    fallbackLocale: tenant.defaultLocale,
    basePath: ctx.basePath,
    primaryHost: bundle.primaryHost,
    products,
    settings,
    currency: tenant.currency,
    mode: 'live',
  };

  return (
    <>
      {/*
        The palette is rendered as a real <style> rule, server-side, so the
        FIRST BYTE already carries the tenant's colours.

        The reference did this in a client useEffect after fetching the theme,
        which meant every page painted in the previous product's crimson and
        then snapped to the right colour — obvious on a slow connection, and
        exactly the sort of thing a paying tenant notices immediately.
      */}
      <style>{themeToCss(page.theme, tenant.slug)}</style>

      {/*
        overflow-x-clip, not -hidden: hidden would make this a scroll container
        and break the announcement bar's position: sticky.
      */}
      <div data-ul-tenant={tenant.slug} className="min-h-screen w-full max-w-full overflow-x-clip bg-background text-foreground">
        {bundle.preview ? (
          <div className="bg-amber-400 px-4 py-1.5 text-center text-xs font-bold text-amber-950">
            Draft preview — not published
          </div>
        ) : (
          <>
            {/* Static script, no tenant data beyond the validated slug. */}
            <script dangerouslySetInnerHTML={{ __html: loaderSeenScript(tenant.slug) }} />
            <LandingLoader brand={brand} slug={tenant.slug} />
            <TenantAnalytics tracking={page.tracking} />
          </>
        )}

        <RenderPage sections={page.sections} ctx={sectionCtx} />
      </div>
    </>
  );
}
