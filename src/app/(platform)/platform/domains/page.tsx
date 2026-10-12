import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { platformApi } from '@/lib/platform-api.server';
import { getSession } from '@/lib/session.server';
import { toApiQuery } from '@/lib/list-query';
import { formatDateTime } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ListFilters } from '@/components/platform/list-filters';
import { PaginationBar } from '@/components/platform/pagination-bar';
import { DomainStatusBadge } from '@/components/platform/domain-status-badge';
import { DomainActions } from '@/components/platform/domain-actions';
import { AddDomainDialog } from '@/components/platform/add-domain-dialog';
import { EmptyState, LOAD_FAILED } from '@/components/platform/empty-state';

export const metadata: Metadata = { title: 'Domains · UniLanding' };

const TYPE_LABELS: Record<string, string> = {
  platform_subdomain: 'Platform subdomain',
  custom_apex: 'Custom apex',
  custom_subdomain: 'Custom subdomain',
};

const STATUSES = ['pending', 'verifying', 'active', 'error', 'disabled'];

type SP = { search?: string; status?: string; type?: string; tenantId?: string; page?: string };

export default async function DomainsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [t, sp, session] = await Promise.all([
    getTranslations('platform'),
    searchParams,
    getSession(),
  ]);
  const canEdit = session?.user.role === 'platform_owner' || session?.user.role === 'platform_admin';

  const [result, tenants] = await Promise.all([
    platformApi.domains(toApiQuery(sp, ['search', 'status', 'type', 'tenantId'], { limit: 50 })),
    platformApi.tenants('limit=100&sort=name'),
  ]);
  const tenantOptions = (tenants ?? []).map((x) => ({ _id: x._id, name: x.name, slug: x.slug }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('domains.title')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('domains.subtitle')}</p>
        </div>
        {canEdit ? <AddDomainDialog tenants={tenantOptions} /> : null}
      </header>

      <ListFilters
        search={{ param: 'search', placeholder: 'Search by domain' }}
        selects={[
          {
            param: 'tenantId',
            label: 'Filter by tenant',
            allLabel: 'All tenants',
            className: 'w-48',
            options: tenantOptions.map((x) => ({ value: x._id, label: x.name })),
          },
          {
            param: 'status',
            label: 'Filter by status',
            allLabel: 'All statuses',
            className: 'w-36',
            options: STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
          },
          {
            param: 'type',
            label: 'Filter by type',
            allLabel: 'All types',
            options: Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label })),
          },
        ]}
      />

      {!result ? (
        <EmptyState {...LOAD_FAILED} />
      ) : result.items.length === 0 ? (
        <EmptyState title={t('domains.emptyTitle')} body={t('domains.emptyBody')} />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Last check</TableHead>
                  {canEdit ? <TableHead className="w-10" /> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((d) => {
                  const showRecord = d.status !== 'active' && d.verification?.method !== 'none' && d.verification?.recordName;
                  return (
                    <TableRow key={d._id} className="align-top">
                      <TableCell className="max-w-80 whitespace-normal">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="break-all font-mono text-sm">{d.host}</span>
                          {d.isPrimary ? <Badge variant="outline">Primary</Badge> : null}
                        </div>
                        {d.redirectTo ? (
                          <p className="mt-1 text-xs text-muted-foreground">Redirects to {d.redirectTo}</p>
                        ) : null}
                        {/* The record is what the operator relays to the tenant,
                            so it is spelled out right in the row. */}
                        {showRecord ? (
                          <div className="mt-2 rounded-lg bg-muted px-2.5 py-2 text-xs">
                            <p className="font-medium">DNS record to add</p>
                            <p className="mt-1 break-all font-mono">
                              {d.verification?.method?.toUpperCase()} {d.verification?.recordName}
                            </p>
                            <p className="break-all font-mono text-muted-foreground">{d.verification?.recordValue}</p>
                            {d.verification?.lastError ? (
                              <p className="mt-1 text-destructive">{d.verification.lastError}</p>
                            ) : null}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-44">
                        {d.tenant ? (
                          <Link href={`/platform/tenants/${d.tenant._id}`} className="block truncate hover:underline">
                            {d.tenant.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                        {TYPE_LABELS[d.type] ?? d.type}
                      </TableCell>
                      <TableCell>
                        <DomainStatusBadge status={d.status} sslStatus={d.ssl?.status} type={d.type} />
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground lg:table-cell">
                        {d.verification?.lastCheckedAt
                          ? `${formatDateTime(d.verification.lastCheckedAt, 'en')} · ${d.verification.attempts ?? 0}×`
                          : '—'}
                      </TableCell>
                      {canEdit ? (
                        <TableCell className="text-right">
                          <DomainActions domain={d} />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <PaginationBar pagination={result.pagination} pathname="/platform/domains" searchParams={sp} noun="domains" />
        </>
      )}
    </div>
  );
}
