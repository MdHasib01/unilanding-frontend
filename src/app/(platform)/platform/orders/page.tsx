import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { platformApi } from '@/lib/platform-api.server';
import { toApiQuery } from '@/lib/list-query';
import { ORDER_STATUSES } from '@/lib/constants';
import { ListFilters } from '@/components/platform/list-filters';
import { PaginationBar } from '@/components/platform/pagination-bar';
import { OrdersTable } from '@/components/platform/orders-table';
import { EmptyState, LOAD_FAILED } from '@/components/platform/empty-state';

export const metadata: Metadata = { title: 'Orders · UniLanding' };

type SP = { tenantId?: string; status?: string; from?: string; to?: string; page?: string };

export default async function PlatformOrdersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const [t, sp] = await Promise.all([getTranslations('platform'), searchParams]);

  const [result, tenants] = await Promise.all([
    platformApi.orders(toApiQuery(sp, ['tenantId', 'status', 'from', 'to'])),
    platformApi.tenants('limit=100&sort=name'),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('orders.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('orders.subtitle')}</p>
      </header>

      <ListFilters
        selects={[
          {
            param: 'tenantId',
            label: 'Filter by tenant',
            allLabel: 'All tenants',
            className: 'w-52',
            options: (tenants ?? []).map((x) => ({ value: x._id, label: x.name })),
          },
          {
            param: 'status',
            label: 'Filter by status',
            allLabel: 'All statuses',
            options: ORDER_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
          },
        ]}
        dateRange
      />

      {!result ? (
        <EmptyState {...LOAD_FAILED} />
      ) : result.items.length === 0 ? (
        <EmptyState title={t('orders.emptyTitle')} body={t('orders.emptyBody')} />
      ) : (
        <>
          <OrdersTable orders={result.items} />
          <PaginationBar pagination={result.pagination} pathname="/platform/orders" searchParams={sp} noun="orders" />
        </>
      )}
    </div>
  );
}

