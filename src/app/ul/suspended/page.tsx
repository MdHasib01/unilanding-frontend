import { getTranslations } from 'next-intl/server';
import { PauseCircle } from 'lucide-react';

export const metadata = { robots: { index: false, follow: false } };

/** A suspended or expired tenant. Deliberately says nothing about billing. */
export default async function Suspended() {
  const t = await getTranslations('storefront');

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <PauseCircle className="size-7" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-foreground sm:text-2xl">
          {t('unavailableTitle')}
        </h1>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">{t('unavailableBody')}</p>
      </div>
    </main>
  );
}
