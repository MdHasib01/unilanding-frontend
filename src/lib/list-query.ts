/**
 * Turns a page's searchParams into the API's query string.
 *
 * Date filters arrive as plain YYYY-MM-DD from <input type="date">. They are
 * pinned to Dhaka midnight and end-of-day, so "to 12 Oct" includes orders
 * placed on the 12th rather than stopping at its first second.
 */
export function toApiQuery(
  sp: Record<string, string | undefined>,
  keys: string[],
  { limit = 25 }: { limit?: number } = {}
): string {
  const q = new URLSearchParams();
  for (const key of keys) {
    const v = sp[key]?.trim();
    if (!v) continue;
    if (key === 'from' && /^\d{4}-\d{2}-\d{2}$/.test(v)) q.set('from', `${v}T00:00:00+06:00`);
    else if (key === 'to' && /^\d{4}-\d{2}-\d{2}$/.test(v)) q.set('to', `${v}T23:59:59.999+06:00`);
    else q.set(key, v);
  }
  const page = Number.parseInt(sp.page ?? '', 10);
  if (page > 1) q.set('page', String(page));
  q.set('limit', String(limit));
  return q.toString();
}
