import { cookies, headers } from 'next/headers';
import { serverEnv } from '@/env';

/**
 * Server-side session check for layout guards.
 *
 * Asks the API rather than verifying the JWT here, so there is exactly one
 * place that knows how a session is validated — and so revocation
 * (tokenVersion, deactivation, a password change) takes effect for the
 * dashboard too, not just for API calls.
 *
 * This is a real guard, unlike the reference project's client-side
 * `useEffect(() => { if (!token) router.replace('/login') })`, which rendered
 * the whole admin shell for a moment before redirecting.
 */

export type SessionUser = {
  id: string;
  tenantId: string | null;
  scope: 'platform' | 'tenant';
  role: string;
  name: string;
  email: string;
  phone?: string;
  locale: 'bn' | 'en';
  mustChangePassword: boolean;
  active: boolean;
};

export type Session = {
  user: SessionUser;
  tenant: { id: string; slug: string; name: string } | null;
  impersonated: boolean;
};

export async function getSession(): Promise<Session | null> {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);

  const cookie = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  if (!cookie) return null;

  try {
    const res = await fetch(`${serverEnv.backendUrl}/api/auth/me`, {
      headers: {
        cookie,
        // The API infers the audience from the host, so forward it.
        'x-forwarded-host': headerList.get('host') ?? '',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data as Session) : null;
  } catch {
    return null;
  }
}

/** True when the caller is platform staff. */
export const isPlatform = (s: Session | null) => s?.user.scope === 'platform';
