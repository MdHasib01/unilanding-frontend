import { NextResponse, type NextRequest } from 'next/server';

/**
 * Lands a one-time handoff token and turns it into a session cookie ON THIS
 * HOST.
 *
 * This is how cross-domain sign-in works without a shared cookie: the platform
 * mints a 60-second signed token, the browser arrives here on the tenant's own
 * domain, and the API sets a host-only cookie for that domain. Used by
 * "sign in as owner" and by the links in provisioning emails.
 *
 * The exchange is proxied through this route rather than called from the
 * browser so the token never has to be handled by client JavaScript.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t');
  const next = request.nextUrl.searchParams.get('next') || '/admin';

  // Only same-origin paths, so ?next= cannot be used as an open redirect.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/admin';

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
  }

  const backend = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:5000';

  const res = await fetch(`${backend}/api/auth/exchange`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // The API needs the tenant host to scope the cookie it issues.
      'x-forwarded-host': request.headers.get('host') ?? '',
    },
    body: JSON.stringify({ token }),
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.redirect(new URL('/login?error=expired_link', request.url));
  }

  const redirect = NextResponse.redirect(new URL(safeNext, request.url));

  // Forward the Set-Cookie headers the API issued. They carry no Domain
  // attribute, so the session is bound to this host and unusable on any other
  // tenant's domain.
  for (const cookie of res.headers.getSetCookie?.() ?? []) {
    redirect.headers.append('set-cookie', cookie);
  }

  return redirect;
}
