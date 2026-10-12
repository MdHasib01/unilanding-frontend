import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/session.server';
import { getTenantContext } from '@/lib/tenant-context.server';
import { getPublicBootstrap } from '@/lib/server-api';
import { LoginForm } from '@/components/platform/login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

/** The tenant's own sign-in, at <their-site>/admin/login. */
export default async function TenantLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ tenantSlug }, sp] = await Promise.all([params, searchParams]);
  const ctx = await getTenantContext(tenantSlug);
  const [session, bootstrap, t] = await Promise.all([
    getSession(),
    getPublicBootstrap(ctx.slug),
    getTranslations('auth'),
  ]);

  const home = `${ctx.basePath}/admin/customize`;
  if (session?.user.scope === 'tenant' && session.tenant?.slug === ctx.slug) redirect(home);

  // Only a path inside this tenant's admin may be a post-login destination.
  const next = sp.next && sp.next.startsWith(`${ctx.basePath}/admin`) ? sp.next : home;

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {bootstrap?.tenant.name ?? ctx.slug}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('tenantSignInSubtitle')}</p>
        </div>
        <LoginForm
          tenantSlug={ctx.slug}
          nextPath={next}
          initialError={sp.error === 'expired_link' ? 'That link has expired. Please sign in again.' : undefined}
        />
      </div>
    </main>
  );
}
