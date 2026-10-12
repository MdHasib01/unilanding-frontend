'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Search, Loader2, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export type SelectFilter = {
  param: string;
  label: string;
  allLabel: string;
  options: { value: string; label: string }[];
  className?: string;
};

/**
 * URL-driven list filters, the generalised form of TenantFilters. The URL is
 * the state, so a filtered view can be bookmarked or pasted to a colleague,
 * and the server component re-renders with the new query on every change.
 */
export function ListFilters({
  search,
  selects = [],
  dateRange = false,
}: {
  search?: { param: string; placeholder: string };
  selects?: SelectFilter[];
  dateRange?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [text, setText] = useState(search ? params.get(search.param) ?? '' : '');

  const apply = (next: Record<string, string | undefined>) => {
    const q = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === 'all') q.delete(k);
      else q.set(k, v);
    }
    // A new filter means a new result set; page 4 of the old one is meaningless.
    q.delete('page');
    startTransition(() => router.replace(`${pathname}?${q.toString()}`));
  };

  // Debounced, so typing does not fire a request per keystroke.
  useEffect(() => {
    if (!search) return;
    const current = params.get(search.param) ?? '';
    if (text === current) return;
    const id = setTimeout(() => apply({ [search.param]: text.trim() }), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const active = [search?.param, ...selects.map((s) => s.param), ...(dateRange ? ['from', 'to'] : [])]
    .filter((p): p is string => Boolean(p))
    .some((p) => params.get(p));

  const clear = () => {
    setText('');
    const q = new URLSearchParams(params.toString());
    for (const p of [search?.param, ...selects.map((s) => s.param), 'from', 'to', 'page']) {
      if (p) q.delete(p);
    }
    startTransition(() => router.replace(`${pathname}?${q.toString()}`));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {search ? (
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={search.placeholder}
            className="pl-8"
            aria-label={search.placeholder}
          />
          {pending ? (
            <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      ) : null}

      {selects.map((s) => (
        <Select
          key={s.param}
          value={params.get(s.param) ?? 'all'}
          onValueChange={(v) => apply({ [s.param]: v })}
        >
          <SelectTrigger className={s.className ?? 'w-44'} aria-label={s.label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{s.allLabel}</SelectItem>
            {s.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {dateRange ? (
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={params.get('from') ?? ''}
            onChange={(e) => apply({ from: e.target.value })}
            className="w-38"
            aria-label="From date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={params.get('to') ?? ''}
            onChange={(e) => apply({ to: e.target.value })}
            className="w-38"
            aria-label="To date"
          />
        </div>
      ) : null}

      {active ? (
        <Button variant="ghost" size="sm" onClick={clear}>
          <X className="size-3.5" />
          Clear
        </Button>
      ) : null}

      {!search && pending ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
    </div>
  );
}
