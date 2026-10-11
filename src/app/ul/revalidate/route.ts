import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { bustHostCache } from '@/proxy';

/**
 * Called by the API after a publish or a domain change so the change is live in
 * seconds rather than whenever the data cache happens to expire.
 *
 * Without this, server-api.ts caches a page bundle for 30s and a tenant who
 * hits Publish sees nothing change — then hits it again, and again. That is a
 * support ticket every single time.
 *
 * revalidateTag vs updateTag: revalidateTag marks the entry stale and refreshes
 * it in the background, so the very next read may still serve the old page.
 * That is the right trade HERE, because this endpoint is the server-initiated
 * path (a domain change, a cron, another operator) where a sub-second delay is
 * invisible. The tenant's own Publish button calls a Server Action that uses
 * updateTag instead, which expires and refetches within the same request and
 * so gives the person who clicked it read-your-writes.
 */
export async function POST(request: NextRequest) {
  const key = request.headers.get('x-internal-key');
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    // Indistinguishable from a route that does not exist.
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    pageSlug?: string;
    host?: string;
  };

  const busted: string[] = [];

  if (body.slug) {
    // Next 16 requires a cacheLife profile as the second argument.
    revalidateTag(`tenant:${body.slug}`, 'max');
    busted.push(`tenant:${body.slug}`);

    const pageTag = `page:${body.slug}:${body.pageSlug || 'home'}`;
    revalidateTag(pageTag, 'max');
    busted.push(pageTag);
  }

  // The proxy keeps its own in-process host map; clear that too, or a newly
  // mapped domain would still 404 for up to a minute.
  if (body.host || body.slug) {
    bustHostCache(body.host);
    busted.push(`host:${body.host || 'all'}`);
  }

  return NextResponse.json({ success: true, data: { busted } });
}
