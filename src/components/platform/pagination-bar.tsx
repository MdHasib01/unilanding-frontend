import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Pagination } from '@/lib/platform-api.server';

/**
 * Previous / next links that keep every other query param. Plain links rather
 * than client state, so the server component does the fetching.
 */
export function PaginationBar({
  pagination,
  pathname,
  searchParams,
  noun = 'results',
}: {
  pagination: Pagination;
  pathname: string;
  searchParams: Record<string, string | undefined>;
  noun?: string;
}) {
  const { page, pages, total, limit } = pagination;
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(total, page * limit);

  const hrefFor = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v && k !== 'page') q.set(k, v);
    if (p > 1) q.set('page', String(p));
    const s = q.toString();
    return s ? `${pathname}?${s}` : pathname;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        {total === 0 ? `No ${noun}` : `${first}–${last} of ${total.toLocaleString('en-US')} ${noun}`}
      </p>
      {pages > 1 ? (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={hrefFor(page - 1)}>
                <ChevronLeft className="size-4" />
                Previous
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="size-4" />
              Previous
            </Button>
          )}
          <span className="tabular-nums text-muted-foreground">
            {page} / {pages}
          </span>
          {page < pages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={hrefFor(page + 1)}>
                Next
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
