'use client';

import { useEffect, useState } from 'react';
import { Eye, Loader2, Monitor, Smartphone } from 'lucide-react';
import { themeToStyle, type PageTheme } from '@/lib/theme-css';
import { RenderPage, RenderSection } from '@/sections/renderer';
import type { SectionCtx, SectionInstance } from '@/sections/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * The tenant's palette applied to a subtree of the (neutral) dashboard. The
 * blocks inside are the REAL section components in preview mode — the same
 * tree the public page renders — so what the tenant sees here is what ships.
 */
export function ThemedSurface({
  theme,
  className,
  children,
}: {
  theme: PageTheme;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={themeToStyle(theme)} className={cn('bg-background text-foreground', className)}>
      {children}
    </div>
  );
}

/** One section's live preview, framed like the reference editor's. */
export function LiveSectionFrame({
  title,
  section,
  ctx,
  theme,
}: {
  title: string;
  section: SectionInstance;
  ctx: SectionCtx;
  theme: PageTheme;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-primary/30 bg-background shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-muted/60 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <span className="flex size-2 animate-pulse rounded-full bg-emerald-500" />
          <span>{title}</span>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-extrabold text-primary">
          Live preview
        </span>
      </div>
      <ThemedSurface theme={theme} className="relative max-h-[640px] max-w-full overflow-auto">
        <RenderSection section={{ ...section, enabled: true }} ctx={ctx} />
      </ThemedSurface>
    </div>
  );
}

/** The whole draft page, scrollable, as the visitor will see it. */
export function PagePreview({
  sections,
  ctx,
  theme,
  className,
}: {
  sections: SectionInstance[];
  ctx: SectionCtx;
  theme: PageTheme;
  className?: string;
}) {
  return (
    <ThemedSurface theme={theme} className={cn('relative overflow-y-auto overflow-x-clip', className)}>
      <RenderPage sections={sections} ctx={ctx} />
    </ThemedSurface>
  );
}

export function FullPreviewDialog({
  open,
  onOpenChange,
  sections,
  ctx,
  theme,
  mobileSrc,
  requestMobileSrc,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sections: SectionInstance[];
  ctx: SectionCtx;
  theme: PageTheme;
  /** The saved draft on its real URL, for the phone frame. */
  mobileSrc: string | null;
  requestMobileSrc: () => void;
}) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Tailwind breakpoints follow the VIEWPORT, not the container, so a 390px box
  // on a desktop would still render the desktop layout. The phone frame
  // therefore loads the real page in an iframe, which has its own viewport.
  useEffect(() => {
    if (open && viewport === 'mobile') requestMobileSrc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, viewport]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-w-[96vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[96vw]">
        <DialogHeader className="flex-row flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3 pr-12">
          <div>
            <DialogTitle className="flex items-center gap-2 text-sm font-bold">
              <Eye className="size-4 text-primary" />
              Full landing page preview
            </DialogTitle>
            <DialogDescription className="text-xs">
              {viewport === 'desktop'
                ? 'Your changes, exactly as visitors will see them.'
                : 'Your saved draft on a phone-sized screen.'}
            </DialogDescription>
          </div>
          <div className="flex rounded-xl border border-border bg-muted/40 p-1">
            {(['desktop', 'mobile'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setViewport(v)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition',
                  viewport === v ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v === 'desktop' ? <Monitor className="size-3.5" /> : <Smartphone className="size-3.5" />}
                {v}
              </button>
            ))}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-muted/50 p-3 sm:p-5">
          <div
            className={cn(
              'mx-auto h-full overflow-hidden rounded-2xl border border-border bg-background shadow-xl transition-all',
              viewport === 'mobile' ? 'w-[390px] max-w-full rounded-[2rem] border-8 border-slate-900' : 'w-full'
            )}
          >
            {viewport === 'desktop' ? (
              <PagePreview sections={sections} ctx={ctx} theme={theme} className="h-full" />
            ) : mobileSrc ? (
              <iframe key={mobileSrc} src={mobileSrc} title="Mobile preview" className="size-full border-0" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                Saving your draft for the phone preview…
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
