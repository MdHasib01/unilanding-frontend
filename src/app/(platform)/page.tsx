import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session.server';

/**
 * The platform root.
 *
 * For now it is a doorway, not a page: signed in goes to the dashboard,
 * otherwise to sign-in. The public marketing site (or a demo landing built with
 * UniLanding itself) replaces this later — the route stays the same, so nothing
 * downstream has to change.
 *
 * Note this only ever runs for the PLATFORM host. A tenant's own domain is
 * rewritten to /[tenantSlug] by the proxy and never reaches this file.
 */
export default async function PlatformRoot() {
  const session = await getSession();

  if (session?.user.scope === 'platform') redirect('/platform');

  // A tenant user who lands on the platform host belongs in their own admin,
  // which lives on their own domain — send them to sign in there.
  if (session?.user.scope === 'tenant' && session.tenant) {
    redirect(`/${session.tenant.slug}/admin`);
  }

  redirect('/login');
}
