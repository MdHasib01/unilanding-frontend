import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/session.server';
import { LoginForm } from '@/components/platform/login-form';

export const metadata: Metadata = {
  title: 'Sign in · UniLanding',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const [session, sp, t] = await Promise.all([
    getSession(),
    searchParams,
    getTranslations('auth'),
  ]);

  // Already signed in — no reason to show a form.
  if (session?.user.scope === 'platform') redirect('/platform');

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            UniLanding
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            {t('platformSignInTitle')}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('platformSignInSubtitle')}</p>
        </div>

        <LoginForm
          initialError={
            sp.error === 'expired_link'
              ? 'That link has expired. Please sign in again.'
              : sp.error === 'missing_token'
                ? 'That link was incomplete. Please sign in again.'
                : undefined
          }
          nextPath={sp.next}
        />
      </div>
    </main>
  );
}
