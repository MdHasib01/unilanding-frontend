'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, LogOut, Menu, Palette, ShieldAlert, X, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { SessionUser } from '@/lib/session.server';

type NavItem = { href: string; label: string; Icon: LucideIcon };

/**
 * The tenant admin frame: a sidebar on desktop, a top bar plus slide-in drawer
 * on a phone. Neutral dashboard colours, deliberately — the tenant's brand
 * palette belongs to their landing page, not to their admin.
 */
export function TenantAdminShell({
  user,
  tenantName,
  basePath,
  siteUrl,
  impersonated,
  children,
}: {
  user: SessionUser;
  tenantName: string;
  basePath: string;
  siteUrl: string;
  impersonated: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav: NavItem[] = [{ href: `${basePath}/admin/customize`, label: 'Customization', Icon: Palette }];

  const signOut = async () => {
    await api.post('/auth/logout').catch(() => {});
    window.location.assign(`${basePath}/admin/login`);
  };

  const links = (
    <nav className="flex-1 space-y-1.5 px-3 py-4">
      {nav.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="size-4.5 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
      <a
        href={siteUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <ExternalLink className="size-4.5 shrink-0" />
        <span className="truncate">View site</span>
      </a>
    </nav>
  );

  const account = (
    <div className="border-t border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-2xs">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-foreground">{user.name}</p>
          <p className="truncate font-mono text-[11px] capitalize text-muted-foreground">
            {user.role.replace('tenant_', '')}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-3.5" />
        Sign out
      </button>
    </div>
  );

  const brand = (
    <div className="flex items-center gap-2.5 overflow-hidden">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
        {tenantName.slice(0, 1).toUpperCase()}
      </span>
      <span className="truncate text-sm font-bold text-foreground">{tenantName}</span>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 text-foreground md:flex-row">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3 shadow-xs md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground hover:bg-muted"
          >
            <Menu className="size-5" />
          </button>
          {brand}
        </div>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4.5" />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden" onClick={() => setOpen(false)}>
          <aside
            className="fixed inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              {brand}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            {links}
            {account}
          </aside>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-5">{brand}</div>
        <div className="flex-1 overflow-y-auto">{links}</div>
        {account}
      </aside>

      <main className="min-h-screen min-w-0 flex-1 md:pl-64">
        {impersonated ? (
          <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900">
            <ShieldAlert className="size-4" />
            You are signed in to this site from the UniLanding platform.
          </div>
        ) : null}
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
