import type { Metadata } from 'next';
import { getTenantContext } from '@/lib/tenant-context.server';
import { getEditorBundle } from '@/lib/tenant-api.server';
import { CustomizationEditor } from '@/components/editor/customization-editor';

export const metadata: Metadata = {
  title: 'Customization',
  robots: { index: false, follow: false },
};

export default async function CustomizePage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const ctx = await getTenantContext(tenantSlug);
  const bundle = await getEditorBundle(ctx.slug);

  if (!bundle) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <h1 className="text-lg font-bold">Your landing page could not be loaded</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Refresh the page. If this keeps happening, contact support — the site may not have a home page yet.
        </p>
      </div>
    );
  }

  return <CustomizationEditor bundle={bundle} basePath={ctx.basePath} locale={ctx.locale} />;
}
