import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { CheckCircle2, XCircle } from 'lucide-react';

import { platformApi } from '@/lib/platform-api.server';
import { getSession } from '@/lib/session.server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm, ChangePasswordForm } from '@/components/platform/account-settings';

export const metadata: Metadata = { title: 'Settings · UniLanding' };

/**
 * Everyone gets their own account settings. The platform configuration card is
 * owner-only, and reports what is configured as yes/no — never a value.
 */
export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/platform/settings');

  const isOwner = session.user.role === 'platform_owner';
  const [t, config] = await Promise.all([
    getTranslations('platform'),
    isOwner ? platformApi.settings() : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('settings.subtitle')}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProfileForm
          initial={{
            name: session.user.name,
            email: session.user.email,
            phone: session.user.phone,
            locale: session.user.locale,
          }}
        />
        <ChangePasswordForm />
      </div>

      {isOwner && config ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform</CardTitle>
            <CardDescription>
              Read from the server environment. Change these in <code className="font-mono">server/.env</code> and
              restart the API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <Item label="Platform host" value={<span className="font-mono">{config.platformHost}</span>} />
              <Item label="Public URL" value={<span className="font-mono">{config.publicBaseUrl}</span>} />
              <Item
                label="Environment"
                value={
                  <Badge variant="secondary" className="capitalize">
                    {config.environment}
                  </Badge>
                }
              />
              <Item
                label="Host aliases"
                value={
                  config.hostAliases.length ? (
                    <span className="font-mono">{config.hostAliases.join(', ')}</span>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )
                }
              />
              <Item label="Secure cookies" value={<Flag on={config.cookieSecure} />} />
              <Item
                label="Email (SMTP)"
                value={<Flag on={config.integrations.email} off="Not configured — emails are logged only" />}
              />
              <Item
                label="Cloudinary"
                value={<Flag on={config.integrations.cloudinary} off="Not configured — uploads stored on disk" />}
              />
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all text-right">{value}</dd>
    </div>
  );
}

function Flag({ on, off = 'Off' }: { on: boolean; off?: string }) {
  return on ? (
    <span className="inline-flex items-center gap-1.5 text-emerald-700">
      <CheckCircle2 className="size-4" />
      Configured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <XCircle className="size-4" />
      {off}
    </span>
  );
}
