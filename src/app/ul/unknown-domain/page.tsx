import { getTranslations } from 'next-intl/server';
import { Globe } from 'lucide-react';

export const metadata = { robots: { index: false, follow: false } };

/**
 * Shown when a domain points at us but is not mapped to any tenant — usually a
 * DNS record added before the domain was registered in the dashboard.
 */
export default async function UnknownDomain() {
  const t = await getTranslations('storefront');

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Globe className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-foreground sm:text-2xl">
          {t('unknownDomainTitle')}
        </h1>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">{t('unknownDomainBody')}</p>
        <p className="mt-6 text-xs text-muted-foreground">{t('poweredBy')}</p>
      </div>
    </main>
  );
}
