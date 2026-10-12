import { redirect } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { getSession } from '@/lib/session.server';
import { getTenantContext } from '@/lib/tenant-context.server';
import { getPublicBootstrap } from '@/lib/server-api';
import { MustChangePassword } from '@/components/platform/must-change-password';
import { TenantAdminShell } from '@/components/tenant-admin/tenant-admin-shell';

/**
 * Guards the tenant admin SERVER-SIDE: no session, or a session for a
 * different tenant, is redirected before any dashboard HTML is produced.
 * (The API enforces the same thing on every call; this only avoids rendering
 * a shell that would then fail.)
 */
export default async function TenantAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const ctx = await getTenantContext(tenantSlug);
  const [session, bootstrap] = await Promise.all([getSession(), getPublicBootstrap(ctx.slug)]);

  const login = `${ctx.basePath}/admin/login`;
  if (!session || session.user.scope !== 'tenant' || session.tenant?.slug !== ctx.slug) {
    redirect(`${login}?next=${encodeURIComponent(`${ctx.basePath}/admin/customize`)}`);
  }

  const scheme = ctx.requestHost.includes('.local') || ctx.requestHost.startsWith('localhost') ? 'http' : 'https';
  const siteUrl = ctx.hostMode === 'path' ? `${ctx.basePath || '/'}` : `${scheme}://${ctx.requestHost}/`;

  return (
    <TenantAdminShell
      user={session.user}
      tenantName={bootstrap?.tenant.name ?? ctx.slug}
      basePath={ctx.basePath}
      siteUrl={siteUrl}
      impersonated={session.impersonated}
    >
      {session.user.mustChangePassword ? <MustChangePassword /> : null}
      {children}
      <Toaster position="top-center" richColors />
    </TenantAdminShell>
  );
}
