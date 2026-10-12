'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import type { AuditRow } from '@/lib/platform-api.server';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

/** platform.tenant_created → tone by the verb at the end. */
const toneFor = (action: string) => {
  if (/(archived|suspended|removed|deleted|failed|password_reset)$/.test(action)) return 'bg-rose-100 text-rose-900';
  if (/(created|added|activated|verified)$/.test(action)) return 'bg-emerald-100 text-emerald-900';
  if (/impersonate$/.test(action)) return 'bg-amber-100 text-amber-900';
  return 'bg-muted text-foreground';
};

export function AuditList({ entries }: { entries: AuditRow[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>When</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead className="hidden md:table-cell">Tenant</TableHead>
            <TableHead className="hidden lg:table-cell">Target</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((a) => {
            const expanded = open === a._id;
            const hasDiff = a.diff !== null && a.diff !== undefined;
            return (
              <Fragment key={a._id}>
                <TableRow
                  className={cn(hasDiff && 'cursor-pointer')}
                  onClick={() => hasDiff && setOpen(expanded ? null : a._id)}
                  aria-expanded={hasDiff ? expanded : undefined}
                >
                  <TableCell className="pr-0">
                    {hasDiff ? (
                      <ChevronRight
                        className={cn('size-4 text-muted-foreground transition-transform', expanded && 'rotate-90')}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDateTime(a.createdAt, 'en')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn('font-mono text-[0.7rem] font-medium', toneFor(a.action))}>
                      {a.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-56">
                    <span className="block truncate text-sm">{a.actorEmail || 'system'}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[a.actorScope, a.actorIp].filter(Boolean).join(' · ')}
                    </span>
                  </TableCell>
                  <TableCell className="hidden max-w-44 md:table-cell">
                    {a.tenant ? (
                      <Link
                        href={`/platform/tenants/${a.tenant._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate hover:underline"
                      >
                        {a.tenant.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden max-w-48 lg:table-cell">
                    <span className="block truncate text-xs">
                      {a.targetType || '—'}
                      {a.targetId ? <span className="font-mono text-muted-foreground"> {a.targetId}</span> : null}
                    </span>
                  </TableCell>
                </TableRow>
                {expanded ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="bg-muted/40 p-0">
                      {/* Secrets were redacted before this was ever written. */}
                      <pre className="max-h-80 overflow-auto px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
                        {JSON.stringify(a.diff, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
