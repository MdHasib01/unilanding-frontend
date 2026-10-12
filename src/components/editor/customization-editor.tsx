'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2, CircleDot, ExternalLink, FileText, Loader2, Lock, Palette, Rocket, Save, ShieldAlert, Undo2,
} from 'lucide-react';
import { api, ApiRequestError } from '@/lib/api-client';
import { resolveBrand, type PageBrand } from '@/lib/brand';
import { formatMoney } from '@/lib/format';
import type { Locale } from '@/lib/constants';
import type { PageTheme } from '@/lib/theme-css';
import type { EditorBundle, EditorPage } from '@/lib/tenant-api.server';
import type { SectionCtx, SectionInstance } from '@/sections/types';
import { cn } from '@/lib/utils';
import { ThemePanel } from './theme-panel';
import { ContentPanel } from './content-panel';
import { FullPreviewDialog } from './previews';
import type { FormEnv } from './auto-form';

type Tab = 'theme' | 'content';
type Seo = { title?: unknown; description?: unknown };

type DraftState = {
  brand: PageBrand;
  theme: PageTheme;
  seo: Seo;
  sections: SectionInstance[];
};

const fromPage = (page: EditorPage): DraftState => ({
  brand: page.draft.brand ?? {},
  theme: page.draft.theme ?? {},
  seo: (page.draft.seo as Seo) ?? {},
  sections: [...(page.draft.sections ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((s, i) => ({ ...s, order: i, enabled: s.enabled !== false })),
});

/** Stable fingerprint for "is there anything unsaved?". */
const fingerprint = (d: DraftState) => JSON.stringify(d);

/**
 * The tenant's landing page editor — a port of the reference project's
 * Customization screen (Theme & Colors / Content & Media Assets, inline /
 * split / form-only previews, full desktop/mobile preview).
 *
 * Changes are held locally and saved to the page's DRAFT; nothing reaches
 * visitors until Publish copies the draft to live.
 */
export function CustomizationEditor({
  bundle,
  basePath,
  locale,
}: {
  bundle: EditorBundle;
  basePath: string;
  locale: Locale;
}) {
  const [page, setPage] = useState<EditorPage>(bundle.page);
  const [state, setState] = useState<DraftState>(() => fromPage(bundle.page));
  const [savedPrint, setSavedPrint] = useState(() => fingerprint(fromPage(bundle.page)));
  const [tab, setTab] = useState<Tab>('content');
  const [busy, setBusy] = useState<null | 'save' | 'publish' | 'discard'>(null);
  const [fullPreview, setFullPreview] = useState(false);
  const [mobileSrc, setMobileSrc] = useState<string | null>(null);

  const { canEdit, tenant } = bundle;
  const slug = tenant.slug;
  const unsaved = fingerprint(state) !== savedPrint;
  const liveHref = basePath || '/';

  const locales: Locale[] = useMemo(() => {
    const enabled = (tenant.enabledLocales?.length ? tenant.enabledLocales : [tenant.defaultLocale]) as Locale[];
    // The default language first, so a single-language form edits it.
    return [tenant.defaultLocale as Locale, ...enabled.filter((l) => l !== tenant.defaultLocale)];
  }, [tenant.defaultLocale, tenant.enabledLocales]);

  const resolvedBrand = useMemo(() => resolveBrand(state.brand, tenant.name), [state.brand, tenant.name]);

  const ctx: SectionCtx = useMemo(
    () => ({
      tenant,
      brand: resolvedBrand,
      locale: locales.includes(locale) ? locale : locales[0],
      fallbackLocale: tenant.defaultLocale,
      basePath,
      primaryHost: bundle.primaryHost,
      products: bundle.products,
      settings: bundle.settings,
      currency: tenant.currency,
      mode: 'preview',
    }),
    [tenant, resolvedBrand, locale, locales, basePath, bundle.primaryHost, bundle.products, bundle.settings]
  );

  const env: FormEnv = useMemo(
    () => ({
      locales,
      tenantSlug: slug,
      products: bundle.products,
      currencyFormat: (n: number) => formatMoney(n, tenant.currency, locales[0]),
      disabled: !canEdit,
      productImageUrl: resolvedBrand.productImageUrl,
    }),
    [locales, slug, bundle.products, tenant.currency, canEdit, resolvedBrand.productImageUrl]
  );

  const afterServer = useCallback((next: EditorPage) => {
    setPage(next);
    const fresh = fromPage(next);
    setState(fresh);
    setSavedPrint(fingerprint(fresh));
  }, []);

  const reportError = (err: unknown, fallback: string) => {
    if (err instanceof ApiRequestError) {
      const where = err.details?.[0]?.path ? ` (${err.details[0].path})` : '';
      toast.error(`${err.message}${where}`);
    } else {
      toast.error(fallback);
    }
  };

  const save = useCallback(
    async (quiet = false): Promise<boolean> => {
      if (!canEdit) return false;
      setBusy('save');
      try {
        const res = await api.put<{ page: EditorPage }>(
          `/t/pages/${page.id}/draft`,
          { brand: state.brand, theme: state.theme, seo: state.seo, sections: state.sections },
          { tenantSlug: slug }
        );
        afterServer(res.page);
        if (!quiet) toast.success('Draft saved — publish when you are ready to go live.');
        return true;
      } catch (err) {
        reportError(err, 'Could not save your changes');
        return false;
      } finally {
        setBusy(null);
      }
    },
    [canEdit, page.id, state, slug, afterServer]
  );

  const publish = async () => {
    if (unsaved && !(await save(true))) return;
    setBusy('publish');
    try {
      const res = await api.post<{ page: EditorPage }>(`/t/pages/${page.id}/publish`, undefined, { tenantSlug: slug });
      afterServer(res.page);
      toast.success(`Published — version ${res.page.revision} is live.`);
    } catch (err) {
      reportError(err, 'Could not publish');
    } finally {
      setBusy(null);
    }
  };

  const discard = async () => {
    if (!window.confirm('Throw away every change that is not live yet, including saved drafts?')) return;
    setBusy('discard');
    try {
      const res = await api.post<{ page: EditorPage }>(`/t/pages/${page.id}/discard`, undefined, { tenantSlug: slug });
      afterServer(res.page);
      toast.success('Draft discarded — you are looking at the live page again.');
    } catch (err) {
      reportError(err, 'Could not discard the draft');
    } finally {
      setBusy(null);
    }
  };

  /** A signed link that renders the saved draft on the real page URL. */
  const draftUrl = async (): Promise<string | null> => {
    if (unsaved && canEdit && !(await save(true))) return null;
    try {
      const { token } = await api.get<{ token: string }>(`/t/pages/${page.id}/preview-token`, { tenantSlug: slug });
      return `${liveHref}?preview=${encodeURIComponent(token)}`;
    } catch (err) {
      reportError(err, 'Could not create a preview link');
      return null;
    }
  };

  const openDraft = async () => {
    // Opened synchronously so the popup blocker treats it as a user action.
    const win = window.open('about:blank', '_blank');
    const url = await draftUrl();
    if (url && win) win.location.href = url;
    else win?.close();
  };

  // Ctrl/Cmd+S saves, as anyone used to an editor expects.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (unsaved && !busy) void save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unsaved, busy, save]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!unsaved) return;
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [unsaved]);

  const status = unsaved
    ? { label: 'Unsaved changes', cls: 'border-amber-300 bg-amber-50 text-amber-800', Icon: CircleDot }
    : page.dirty
      ? { label: 'Draft saved — not live yet', cls: 'border-sky-300 bg-sky-50 text-sky-800', Icon: Save }
      : { label: `Live · version ${page.revision}`, cls: 'border-emerald-300 bg-emerald-50 text-emerald-800', Icon: CheckCircle2 };

  return (
    <div className="space-y-6">
      {/* ── header ── */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-foreground">
            <Palette className="size-6 text-primary" />
            Landing page customization
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Your logo, product image, colours and every line of text — with a live preview. Save as a draft, publish when ready.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold', status.cls)}>
            <status.Icon className="size-3.5" />
            {status.label}
          </span>
          <a
            href={liveHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground transition hover:bg-muted"
          >
            <ExternalLink className="size-3.5" />
            View live
          </a>
          <button
            type="button"
            onClick={openDraft}
            disabled={busy !== null}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <FileText className="size-3.5" />
            Preview draft
          </button>
          {canEdit ? (
            <>
              {page.dirty || unsaved ? (
                <button
                  type="button"
                  onClick={discard}
                  disabled={busy !== null}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-destructive/30 px-3 text-xs font-bold text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                >
                  {busy === 'discard' ? <Loader2 className="size-3.5 animate-spin" /> : <Undo2 className="size-3.5" />}
                  Discard
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => save()}
                disabled={busy !== null || !unsaved}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-primary/40 bg-card px-3.5 text-xs font-bold text-primary transition hover:bg-primary/10 disabled:opacity-50"
              >
                {busy === 'save' ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Save draft
              </button>
              <button
                type="button"
                onClick={publish}
                disabled={busy !== null || (!unsaved && !page.dirty)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
              >
                {busy === 'publish' ? <Loader2 className="size-3.5 animate-spin" /> : <Rocket className="size-3.5" />}
                Publish
              </button>
            </>
          ) : (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-muted px-3 text-xs font-bold text-muted-foreground">
              <Lock className="size-3.5" />
              Read-only
            </span>
          )}
        </div>
      </div>

      {!canEdit ? (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-semibold text-amber-700">
          <ShieldAlert className="size-5 shrink-0" />
          <span>Your account can view this page but not change it. Ask the owner or an admin to make edits.</span>
        </div>
      ) : null}

      {/* ── tabs ── */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {(
          [
            { v: 'theme', label: '🎨 Theme & Brand', Icon: Palette },
            { v: 'content', label: '📝 Content & Media', Icon: FileText },
          ] as const
        ).map(({ v, label, Icon }) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              tab === v
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'theme' ? (
        <ThemePanel
          brand={state.brand}
          resolvedBrand={resolvedBrand}
          theme={state.theme}
          seo={state.seo}
          onBrand={(brand) => setState((s) => ({ ...s, brand }))}
          onTheme={(theme) => setState((s) => ({ ...s, theme }))}
          onSeo={(seo) => setState((s) => ({ ...s, seo }))}
          sections={state.sections}
          ctx={ctx}
          locales={locales}
          tenantSlug={slug}
          canEdit={canEdit}
          liveHref={liveHref}
        />
      ) : (
        <ContentPanel
          sections={state.sections}
          onSections={(sections) => setState((s) => ({ ...s, sections }))}
          ctx={ctx}
          theme={state.theme}
          env={env}
          canEdit={canEdit}
          liveHref={liveHref}
          onOpenFullPreview={() => {
            setMobileSrc(null);
            setFullPreview(true);
          }}
        />
      )}

      <FullPreviewDialog
        open={fullPreview}
        onOpenChange={setFullPreview}
        sections={state.sections}
        ctx={ctx}
        theme={state.theme}
        mobileSrc={mobileSrc}
        requestMobileSrc={() => {
          if (mobileSrc) return;
          void draftUrl().then((url) => url && setMobileSrc(url));
        }}
      />
    </div>
  );
}

