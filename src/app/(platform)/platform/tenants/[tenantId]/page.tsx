import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, ExternalLink, Globe, ShoppingCart, Package, FileText, Users, LogIn,
} from 'lucide-react';

import { platformApi } from '@/lib/platform-api.server';
import { publicEnv } from '@/env';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TenantStatusBadge } from '@/components/platform/tenant-status-badge';
import { DomainStatusBadge } from '@/components/platform/domain-status-badge';
import { TenantActions } from '@/components/platform/tenant-actions';
import { AddDomainDialog } from '@/components/platform/add-domain-dialog';
import { DomainActions } from '@/components/platform/domain-actions';
import { getSession } from '@/lib/session.server';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Tenant · UniLanding' };

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const [detail, session] = await Promise.all([platformApi.tenant(tenantId), getSession()]);
  if (!detail) notFound();
  const canEditDomains =
    session?.user.role === 'platform_owner' || session?.user.role === 'platform_admin';

  const { tenant, domains, users, pages, counts, usage, primaryHost } = detail;
  const scheme = publicEnv.platformHost.includes('.local') ? 'http' : 'https';
  const siteUrl = `${scheme}://${primaryHost}`;
  const limits = tenant.plan?.limits ?? {};

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/platform/tenants">
            <ArrowLeft className="size-4" />
            Tenants
          </Link>
        </Button>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{tenant.name}</h1>
              <TenantStatusBadge status={tenant.status} expiresAt={tenant.expiresAt} />
              <Badge variant="secondary" className="capitalize">
                {tenant.plan?.name ?? '—'}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-sm text-muted-foreground">/{tenant.slug}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={siteUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" />
                View site
              </a>
            </Button>
            {/*
              Signs in as the owner on the tenant's OWN host via a single-use
              60-second handoff token — there is no shared cookie between the
              platform and a tenant domain, by design.
            */}
            <TenantActions
              tenantId={tenantId}
              slug={tenant.slug}
              status={tenant.status}
              name={tenant.name}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Orders" value={counts.orders} Icon={ShoppingCart} />
        <Metric label="Products" value={counts.products} Icon={Package} />
        <Metric label="Landing pages" value={pages.length} Icon={FileText} />
        <Metric label="Team" value={users.length} Icon={Users} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ── Landing pages: the thing this screen exists for ── */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Landing pages</CardTitle>
            <Button asChild variant="outline" size="sm">
              <a href={`${siteUrl}/admin/customize`} target="_blank" rel="noreferrer">
                <LogIn className="size-3.5" />
                Open their editor
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No landing page yet. One is normally created automatically — use
                their editor to add one.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {pages.map((page) => (
                  <li key={page._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-medium">
                        <span className="truncate">{page.name}</span>
                        {page.isHome ? (
                          <Badge variant="outline" className="shrink-0">
                            Home
                          </Badge>
                        ) : null}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        {primaryHost}/{page.slug}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          page.status === 'published'
                            ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-100'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-100'
                        }
                      >
                        {page.status === 'published' ? `v${page.revision}` : 'Draft'}
                      </Badge>
                      <Button asChild variant="ghost" size="sm">
                        <a
                          href={`${siteUrl}/admin/customize`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Configure
                        </a>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── Plan usage ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <UsageBar label="Landing pages" used={Number(usage.landingPages ?? 0)} limit={limits.landingPages} />
            <UsageBar label="Products" used={Number(usage.products ?? 0)} limit={limits.products} />
            <UsageBar label="Team" used={Number(usage.staffUsers ?? 0)} limit={limits.staffUsers} />
            <UsageBar label="Orders this month" used={Number(usage.ordersThisMonth ?? 0)} limit={limits.ordersPerMonth} />
            {tenant.expiresAt ? (
              <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                Plan runs to {formatDate(tenant.expiresAt, 'en')}
              </p>
            ) : (
              <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                No expiry set
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Domains ── */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4 text-muted-foreground" />
              Domains
            </CardTitle>
            {canEditDomains && tenant.status !== 'archived' ? (
              <AddDomainDialog tenantId={tenantId} size="sm" />
            ) : null}
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {domains.map((d) => (
                <li key={d._id} className="space-y-1.5 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 truncate font-mono text-sm">{d.host}</span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {d.isPrimary ? <Badge variant="outline">Primary</Badge> : null}
                      <DomainStatusBadge status={d.status} sslStatus={d.ssl?.status} type={d.type} />
                      {canEditDomains ? <DomainActions domain={d} /> : null}
                    </span>
                  </div>

                  {/* A pending custom domain needs its DNS record spelled out,
                      or the operator has to go looking for it. */}
                  {d.status !== 'active' && d.verification?.recordName ? (
                    <div className="rounded-lg bg-muted px-2.5 py-2 text-xs">
                      <p className="font-medium">Add this DNS record:</p>
                      <p className="mt-1 font-mono break-all">
                        {d.verification.method?.toUpperCase()} {d.verification.recordName}
                      </p>
                      <p className="font-mono break-all text-muted-foreground">
                        {d.verification.recordValue}
                      </p>
                      {d.verification.lastError ? (
                        <p className="mt-1 text-destructive">{d.verification.lastError}</p>
                      ) : null}
                    </div>
                  ) : null}

                  {d.redirectTo ? (
                    <p className="text-xs text-muted-foreground">Redirects to {d.redirectTo}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Team ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {users.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant="outline" className="capitalize">
                      {u.role.replace('tenant_', '')}
                    </Badge>
                    {!u.active ? <Badge variant="destructive">Disabled</Badge> : null}
                    {u.mustChangePassword ? (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-900">
                        Temp password
                      </Badge>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 pt-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  );
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit?: number | null;
}) {
  // null means unmetered — a progress bar would be meaningless.
  const unmetered = limit === null || limit === undefined;
  const pct = unmetered ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const atLimit = !unmetered && used >= limit;

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={atLimit ? 'font-semibold text-destructive' : 'font-mono tabular-nums'}>
          {used}
          {unmetered ? '' : ` / ${limit}`}
        </span>
      </div>
      {!unmetered ? <Progress value={pct} className="mt-1.5 h-1.5" /> : null}
    </div>
  );
}
