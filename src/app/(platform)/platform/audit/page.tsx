import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { platformApi } from '@/lib/platform-api.server';
import { getSession } from '@/lib/session.server';
import { toApiQuery } from '@/lib/list-query';
import { ListFilters } from '@/components/platform/list-filters';
import { PaginationBar } from '@/components/platform/pagination-bar';
import { AuditList } from '@/components/platform/audit-list';
import { EmptyState, LOAD_FAILED } from '@/components/platform/empty-state';

export const metadata: Metadata = { title: 'Audit log · UniLanding' };

/** Prefixes that match the action names auditService writes. */
const ACTION_GROUPS = [
  { value: 'platform.tenant', label: 'Tenants' },
  { value: 'platform.domain', label: 'Domains' },
  { value: 'platform.plan', label: 'Plans' },
  { value: 'platform.impersonate', label: 'Impersonation' },
  { value: 'auth.', label: 'Sign-in & passwords' },
  { value: 'page.', label: 'Landing pages' },
];

type SP = { tenantId?: string; action?: string; actorEmail?: string; from?: string; to?: string; page?: string };

export default async function AuditPage({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await getSession();
  // The trail holds IPs and emails; support staff are kept out, matching the API.
  if (session?.user.role === 'platform_support') redirect('/platform');

  const [t, sp] = await Promise.all([getTranslations('platform'), searchParams]);
  const [result, tenants] = await Promise.all([
    platformApi.audit(toApiQuery(sp, ['tenantId', 'action', 'actorEmail', 'from', 'to'], { limit: 50 })),
    platformApi.tenants('limit=100&sort=name'),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('audit.title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('audit.subtitle')}</p>
      </header>

      <ListFilters
        search={{ param: 'actorEmail', placeholder: 'Filter by who did it (email)' }}
        selects={[
          {
            param: 'action',
            label: 'Filter by action',
            allLabel: 'All actions',
            options: ACTION_GROUPS,
          },
          {
            param: 'tenantId',
            label: 'Filter by tenant',
            allLabel: 'All tenants',
            className: 'w-48',
            options: (tenants ?? []).map((x) => ({ value: x._id, label: x.name })),
          },
        ]}
        dateRange
      />

      {!result ? (
        <EmptyState {...LOAD_FAILED} />
      ) : result.items.length === 0 ? (
        <EmptyState title={t('audit.emptyTitle')} body={t('audit.emptyBody')} />
      ) : (
        <>
          <AuditList entries={result.items} />
          <PaginationBar pagination={result.pagination} pathname="/platform/audit" searchParams={sp} noun="entries" />
        </>
      )}
    </div>
  );
}
