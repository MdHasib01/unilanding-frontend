'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard, Building2, ShoppingCart, Globe, CreditCard, ScrollText,
  Settings, Menu, X, LogOut, Languages, ChevronsLeft, ChevronsRight,
  type LucideIcon,
} from 'lucide-react';

import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SessionUser } from '@/lib/session.server';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/lib/constants';

type NavItem = {
  href: string;
  key: 'overview' | 'tenants' | 'orders' | 'domains' | 'plans' | 'audit' | 'settings';
  Icon: LucideIcon;
  /** Match the path exactly, so /platform does not light up on every subpage. */
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: '/platform', key: 'overview', Icon: LayoutDashboard, exact: true },
  { href: '/platform/tenants', key: 'tenants', Icon: Building2 },
  { href: '/platform/orders', key: 'orders', Icon: ShoppingCart },
  { href: '/platform/domains', key: 'domains', Icon: Globe },
  { href: '/platform/plans', key: 'plans', Icon: CreditCard },
  { href: '/platform/audit', key: 'audit', Icon: ScrollText },
  { href: '/platform/settings', key: 'settings', Icon: Settings },
];

/** Only the owner sets plans; support staff get a read-only view of the rest. */
const ROLE_HIDDEN: Record<string, string[]> = {
  platform_support: ['/platform/plans', '/platform/settings'],
  platform_admin: ['/platform/settings'],
};

export function PlatformShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const t = useTranslations('platform.nav');
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const hidden = ROLE_HIDDEN[user.role] ?? [];
  const items = NAV.filter((n) => !hidden.includes(n.href));

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const signOut = async () => {
    await api.post('/auth/logout').catch(() => {});
    window.location.assign('/login');
  };

  const setLocale = (locale: Locale) => {
    document.cookie = `UL_LOCALE=${locale}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
    api.patch('/auth/profile', { locale }).catch(() => {});
    router.refresh();
  };

  const nav = (
    <nav className="flex-1 space-y-1 px-2 py-3">
      {items.map(({ href, key, Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? t(key) : undefined}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              collapsed && 'justify-center px-0'
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed ? <span className="truncate">{t(key)}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-sidebar-border p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-sidebar-accent/60',
              collapsed && 'justify-center px-0'
            )}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            {!collapsed ? (
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-sidebar-foreground">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user.role.replace('platform_', '')}
                </span>
              </span>
            ) : null}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-56">
          <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
            {user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {LOCALES.map((l) => (
            <DropdownMenuItem
              key={l}
              onClick={() => setLocale(l)}
              className={cn(user.locale === l && 'font-semibold')}
            >
              <Languages className="size-4" />
              {LOCALE_LABELS[l]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} variant="destructive">
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/95 px-3 py-2.5 backdrop-blur md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
        <span className="font-semibold">UniLanding</span>
      </header>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar shadow-xl">
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
              <span className="font-bold text-sidebar-foreground">UniLanding</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close">
                <X className="size-5" />
              </Button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] md:flex',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <div
          className={cn(
            'flex items-center border-b border-sidebar-border px-4 py-3.5',
            collapsed ? 'justify-center px-0' : 'justify-between'
          )}
        >
          {!collapsed ? (
            <Link href="/platform" className="font-bold tracking-tight text-sidebar-foreground">
              UniLanding
            </Link>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </Button>
        </div>
        {nav}
        {footer}
      </aside>

      <div className={cn('transition-[padding]', collapsed ? 'md:pl-16' : 'md:pl-60')}>
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
