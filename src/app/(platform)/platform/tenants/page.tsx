import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Plus, ExternalLink, Settings2 } from 'lucide-react';

import { platformApi } from '@/lib/platform-api.server';
import { publicEnv } from '@/env';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TenantStatusBadge } from '@/components/platform/tenant-status-badge';
import { TenantFilters } from '@/components/platform/tenant-filters';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Tenants · UniLanding' };

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; plan?: string }>;
}) {
  const [t, sp] = await Promise.all([getTranslations('platform'), searchParams]);

  const qs = new URLSearchParams();
  if (sp.search) qs.set('search', sp.search);
  if (sp.status) qs.set('status', sp.status);
  if (sp.plan) qs.set('plan', sp.plan);
  qs.set('limit', '100');

  const tenants = (await platformApi.tenants(qs.toString())) ?? [];
  const scheme = publicEnv.platformHost.includes('.local') ? 'http' : 'https';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('tenants.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each one is a business with its own landing page, domain and orders.
          </p>
        </div>
        <Button asChild>
          <Link href="/platform/tenants/new">
            <Plus className="size-4" />
            {t('tenants.newTenant')}
          </Link>
        </Button>
      </header>

      <TenantFilters />

      {tenants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="font-semibold">{t('tenants.emptyTitle')}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {t('tenants.emptyBody')}
          </p>
          <Button asChild className="mt-5">
            <Link href="/platform/tenants/new">
              <Plus className="size-4" />
              {t('tenants.newTenant')}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {tenants.map((tenant) => {
            const subdomain = `${tenant.slug}.${publicEnv.platformHost}`;
            return (
              <Card key={tenant._id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-semibold">{tenant.name}</h2>
                      <TenantStatusBadge status={tenant.status} expiresAt={tenant.expiresAt} />
                      <Badge variant="secondary" className="capitalize">
                        {tenant.plan?.code ?? '—'}
                      </Badge>
                      {tenant.enabledLocales?.length > 1 ? (
                        <Badge variant="outline" className="font-mono text-[0.7rem]">
                          {tenant.enabledLocales.join(' / ')}
                        </Badge>
                      ) : null}
                    </div>

                    {/* Both URLs the business can use, shown plainly — this is
                        the question every operator asks first. */}
                    <dl className="mt-2.5 space-y-1 text-xs">
                      <div className="flex gap-2">
                        <dt className="w-16 shrink-0 text-muted-foreground">Subdomain</dt>
                        <dd className="truncate font-mono">{subdomain}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-16 shrink-0 text-muted-foreground">Path</dt>
                        <dd className="truncate font-mono">
                          {publicEnv.platformHost}/{tenant.slug}
                        </dd>
                      </div>
                    </dl>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Added {formatDate(tenant.createdAt, 'en')}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href={`${scheme}://${subdomain}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3.5" />
                        {t('tenants.openSite')}
                      </a>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/platform/tenants/${tenant._id}`}>
                        <Settings2 className="size-3.5" />
                        Configure
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
