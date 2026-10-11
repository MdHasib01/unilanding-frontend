import { notFound } from 'next/navigation';
import { getTenantContext } from '@/lib/tenant-context.server';
import { getPublicBootstrap } from '@/lib/server-api';
import { TenantProvider } from '@/components/providers/tenant-provider';

/**
 * The tenant shell for every public page AND the tenant admin.
 *
 * Deliberately does NOT inject the theme — a landing page's palette belongs to
 * its page, not the tenant, and the admin should stay on the neutral dashboard
 * palette regardless of how garish a tenant's brand is. The page route injects
 * its own theme into a scoped wrapper.
 */
export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // Next 16: params is a Promise and must be awaited.
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const ctx = await getTenantContext(tenantSlug);

  const bootstrap = await getPublicBootstrap(ctx.slug);
  if (!bootstrap) notFound();

  return (
    <TenantProvider
      value={{
        slug: ctx.slug,
        tenantId: ctx.tenantId || bootstrap.tenant.id,
        basePath: ctx.basePath,
        hostMode: ctx.hostMode,
        primaryHost: bootstrap.primaryHost || ctx.primaryHost,
        locale: ctx.locale,
        tenant: bootstrap.tenant,
        settings: bootstrap.settings,
      }}
    >
      {children}
    </TenantProvider>
  );
}
