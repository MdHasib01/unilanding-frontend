import { redirect } from 'next/navigation';
import { getTenantContext } from '@/lib/tenant-context.server';

/** /admin lands on the customization screen. */
export default async function TenantAdminHome({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const ctx = await getTenantContext(tenantSlug);
  redirect(`${ctx.basePath}/admin/customize`);
}
