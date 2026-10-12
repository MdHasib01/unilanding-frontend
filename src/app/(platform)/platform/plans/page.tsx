import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Check, Users } from 'lucide-react';

import { platformApi } from '@/lib/platform-api.server';
import { getSession } from '@/lib/session.server';
import { formatMoney } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlanFormDialog } from '@/components/platform/plan-form-dialog';
import { EmptyState, LOAD_FAILED } from '@/components/platform/empty-state';

export const metadata: Metadata = { title: 'Plans · UniLanding' };

const LIMIT_LABELS: Record<string, string> = {
  landingPages: 'Landing pages',
  products: 'Products',
  staffUsers: 'Team members',
  ordersPerMonth: 'Orders / month',
  customDomains: 'Custom domains',
  mediaMb: 'Media',
};

export default async function PlansPage() {
  const session = await getSession();
  // Support staff never see plans; the sidebar hides the link and this is the
  // matching guard for anyone typing the URL.
  if (session?.user.role === 'platform_support') redirect('/platform');
  const isOwner = session?.user.role === 'platform_owner';

  const [t, plans] = await Promise.all([getTranslations('platform'), platformApi.plans()]);
  const nextSort = Math.max(0, ...(plans ?? []).map((p) => p.sortOrder ?? 0)) + 1;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('plans.title')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t('plans.subtitle')}</p>
        </div>
        {isOwner ? <PlanFormDialog nextSortOrder={nextSort} /> : null}
      </header>

      {!plans ? (
        <EmptyState {...LOAD_FAILED} />
      ) : plans.length === 0 ? (
        <EmptyState title={t('plans.emptyTitle')} body={t('plans.emptyBody')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan._id} className={plan.active ? '' : 'opacity-70'}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                      {plan.name}
                      <Badge variant="outline" className="font-mono text-[0.7rem]">
                        {plan.code}
                      </Badge>
                    </CardTitle>
                    {plan.description ? (
                      <CardDescription className="mt-1.5">{plan.description}</CardDescription>
                    ) : null}
                  </div>
                  {isOwner ? <PlanFormDialog plan={plan} /> : null}
                </div>
                <p className="mt-3">
                  <span className="text-3xl font-bold tabular-nums">
                    {formatMoney(plan.price, plan.currency, 'en')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {' '}/ {plan.interval === 'yearly' ? 'year' : 'month'}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {plan.active ? (
                    <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {plan.public === false ? <Badge variant="secondary">Hidden</Badge> : null}
                  <Link
                    href={`/platform/tenants?plan=${plan.code}`}
                    className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Users className="size-3.5" />
                    {plan.tenantCount ?? 0} tenant{plan.tenantCount === 1 ? '' : 's'}
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-muted/60 p-3 text-sm">
                  {Object.entries(LIMIT_LABELS).map(([key, label]) => {
                    const v = plan.limits?.[key];
                    const shown =
                      v === null || v === undefined
                        ? 'Unlimited'
                        : key === 'mediaMb'
                          ? v >= 1024
                            ? `${(v / 1024).toFixed(v % 1024 ? 1 : 0)} GB`
                            : `${v} MB`
                          : v.toLocaleString('en-US');
                    return (
                      <div key={key} className="min-w-0">
                        <dt className="truncate text-xs text-muted-foreground">{label}</dt>
                        <dd className="font-semibold tabular-nums">{shown}</dd>
                      </div>
                    );
                  })}
                </dl>
                {plan.features?.length ? (
                  <ul className="space-y-1.5 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
