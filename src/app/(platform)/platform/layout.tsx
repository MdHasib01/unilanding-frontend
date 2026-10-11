import { redirect } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { getSession } from '@/lib/session.server';
import { PlatformShell } from '@/components/platform/platform-shell';
import { MustChangePassword } from '@/components/platform/must-change-password';

/**
 * Guards the whole platform dashboard SERVER-SIDE. A signed-out visitor is
 * redirected before any shell HTML is produced, unlike a client-side guard
 * which flashes the dashboard first.
 */
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) redirect('/login?next=/platform');

  // A tenant user has no business here; their admin lives on their own domain.
  if (session.user.scope !== 'platform') {
    redirect(session.tenant ? `/${session.tenant.slug}/admin` : '/login');
  }

  return (
    <PlatformShell user={session.user}>
      {/*
        A temporary password must be changed before anything else. The API
        returns 428 for every other endpoint while the flag is set, so this
        dialog is the only way forward rather than a suggestion.
      */}
      {session.user.mustChangePassword ? <MustChangePassword /> : null}
      {children}
      <Toaster position="top-center" richColors />
    </PlatformShell>
  );
}
