'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { HostMode, Locale } from '@/lib/constants';
import type { PublicSettings, PublicTenant } from '@/lib/server-api';

export type TenantValue = {
  slug: string;
  tenantId: string;
  basePath: string;
  hostMode: HostMode;
  primaryHost: string;
  locale: Locale;
  tenant: PublicTenant;
  settings: PublicSettings;
};

const TenantCtx = createContext<TenantValue | null>(null);

export function TenantProvider({
  value,
  children,
}: {
  value: TenantValue;
  children: ReactNode;
}) {
  return <TenantCtx.Provider value={value}>{children}</TenantCtx.Provider>;
}

export function useTenant(): TenantValue {
  const ctx = useContext(TenantCtx);
  if (!ctx) throw new Error('useTenant must be used inside a TenantProvider');
  return ctx;
}

/**
 * The only sanctioned way to build a link inside app/(tenant).
 *
 * On milkready.com the thank-you page is /thank-you; on
 * unilanding.com/milkready it is /milkready/thank-you. A bare href works in one
 * mode and 404s in the other — and the first thing to break would be the
 * post-order redirect, silently, for path-mode tenants only.
 *
 * An ESLint rule bans importing next/link directly under app/(tenant).
 */
export function useTenantHref() {
  const { basePath } = useTenant();
  return useMemo(
    () => (path: string) => {
      const clean = path.startsWith('/') ? path : `/${path}`;
      return `${basePath}${clean}` || '/';
    },
    [basePath]
  );
}
