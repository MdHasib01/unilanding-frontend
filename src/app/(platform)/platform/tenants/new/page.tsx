import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { platformApi } from '@/lib/platform-api.server';
import { publicEnv } from '@/env';
import { Button } from '@/components/ui/button';
import { NewTenantForm } from '@/components/platform/new-tenant-form';

export const metadata: Metadata = { title: 'New tenant · UniLanding' };

export default async function NewTenantPage() {
  const plans = (await platformApi.plans()) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/platform/tenants">
            <ArrowLeft className="size-4" />
            Tenants
          </Link>
        </Button>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Create a landing page</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This sets up the business, its landing page, its subdomain and an owner
          login — all at once. The page is live the moment you save.
        </p>
      </div>

      <NewTenantForm plans={plans} platformHost={publicEnv.platformHost} />
    </div>
  );
}
