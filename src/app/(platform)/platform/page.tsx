import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Building2, ShoppingCart, TrendingUp, CheckCircle2, Plus, ArrowRight } from 'lucide-react';

import { platformApi } from '@/lib/platform-api.server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TenantStatusBadge } from '@/components/platform/tenant-status-badge';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Overview · UniLanding' };

export default async function PlatformOverview() {
  const [t, overview] = await Promise.all([
    getTranslations('platform'),
    platformApi.overview(),
  ]);

  if (!overview) {
    return (
      <EmptyState
        title="Could not load the dashboard"
        body="The API did not respond. Check that the server is running on port 5000."
      />
    );
  }

  const active = overview.tenants.byStatus.active ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('overview.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every business you run on UniLanding, at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/platform/tenants/new">
            <Plus className="size-4" />
            {t('tenants.newTenant')}
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t('overview.totalTenants')}
          value={overview.tenants.total}
          Icon={Building2}
          sub={`${active} ${t('overview.activeTenants').toLowerCase()}`}
        />
        <Stat label={t('overview.ordersToday')} value={overview.orders.today} Icon={ShoppingCart} />
        <Stat label={t('overview.orders7d')} value={overview.orders.last7Days} Icon={CheckCircle2} />
        <Stat
          label={t('overview.mrr')}
          value={`৳${overview.mrr.toLocaleString('en-US')}`}
          Icon={TrendingUp}
          sub="from active plans"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{t('overview.recentTenants')}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/platform/tenants">
                {t('nav.tenants')}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {overview.recentTenants.length === 0 ? (
              <EmptyState title={t('tenants.emptyTitle')} body={t('tenants.emptyBody')} compact />
            ) : (
              <ul className="divide-y divide-border">
                {overview.recentTenants.map((tenant) => (
                  <li key={tenant._id}>
                    <Link
                      href={`/platform/tenants/${tenant._id}`}
                      className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{tenant.name}</span>
                        <span className="block truncate font-mono text-xs text-muted-foreground">
                          /{tenant.slug}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {tenant.plan?.code ?? '—'}
                        </Badge>
                        <TenantStatusBadge status={tenant.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('tenants.plan')}</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(overview.tenants.byPlan).length === 0 ? (
              <p className="text-sm text-muted-foreground">No tenants yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {Object.entries(overview.tenants.byPlan).map(([plan, count]) => (
                  <li key={plan} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{plan}</span>
                    <span className="font-mono font-semibold tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  Icon,
  sub,
}: {
  label: string;
  value: number | string;
  Icon: React.ComponentType<{ className?: string }>;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums">{value}</p>
          {sub ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p> : null}
        </div>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title,
  body,
  compact,
}: {
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? 'py-8 text-center' : 'rounded-xl border border-dashed border-border py-14 text-center'}>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export { formatDate };
