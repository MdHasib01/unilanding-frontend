'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getSectionMeta } from './registry';
import type { SectionCtx, SectionInstance, SectionPin } from './types';

/**
 * One bad section must never take down a tenant's whole landing page.
 *
 * On a live page a failing section renders nothing — the visitor sees a page
 * missing one block rather than a blank screen. In the editor it renders a
 * visible error, because there the tenant needs to know which section is
 * broken.
 */
class SectionBoundary extends Component<
  { children: ReactNode; type: string; mode: 'live' | 'preview' },
  { failed: boolean; message: string }
> {
  state = { failed: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { failed: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(`[section:${this.props.type}]`, error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.mode === 'live') return null;

    return (
      <div className="m-4 rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/5 p-5 text-center">
        <AlertTriangle className="mx-auto size-5 text-destructive" />
        <p className="mt-2 text-sm font-semibold text-destructive">
          The &ldquo;{this.props.type}&rdquo; section could not render.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{this.state.message}</p>
      </div>
    );
  }
}

const visible = (sections: SectionInstance[]) =>
  sections.filter((s) => s.enabled !== false && getSectionMeta(s.type));

/** Sections that sit in the normal scroll flow (everything not pinned). */
export const flowSections = (sections: SectionInstance[]) =>
  visible(sections)
    .filter((s) => !getSectionMeta(s.type)!.pinned)
    .sort((a, b) => a.order - b.order);

export const pinnedSections = (sections: SectionInstance[], where: SectionPin) =>
  visible(sections)
    .filter((s) => getSectionMeta(s.type)!.pinned === where)
    .sort((a, b) => a.order - b.order);

function RenderOne({ section, ctx }: { section: SectionInstance; ctx: SectionCtx }) {
  const meta = getSectionMeta(section.type);
  if (!meta) return null;

  // Merging over the registry defaults is what lets us add a field to a section
  // without migrating every existing page's stored data — and what makes a
  // partially-filled section render sensibly instead of blank.
  const data = { ...meta.defaults(), ...(section.data ?? {}) };
  const Renderer = meta.Renderer as unknown as (p: {
    data: Record<string, unknown>;
    ctx: SectionCtx;
  }) => ReactNode;

  return (
    <SectionBoundary type={section.type} mode={ctx.mode}>
      <Renderer data={data} ctx={ctx} />
    </SectionBoundary>
  );
}

export function SectionList({
  sections,
  ctx,
}: {
  sections: SectionInstance[];
  ctx: SectionCtx;
}) {
  return (
    <>
      {flowSections(sections).map((s) => (
        <RenderOne key={s.key} section={s} ctx={ctx} />
      ))}
    </>
  );
}

export function PinnedSections({
  sections,
  ctx,
  where,
}: {
  sections: SectionInstance[];
  ctx: SectionCtx;
  where: SectionPin;
}) {
  return (
    <>
      {pinnedSections(sections, where).map((s) => (
        <RenderOne key={s.key} section={s} ctx={ctx} />
      ))}
    </>
  );
}

/**
 * The whole page, in one component, used by BOTH the public route and the
 * editor's live preview. That shared path is why the preview is pixel-identical
 * to the published page: it is not a reimplementation, it is the same tree.
 */
export function RenderPage({
  sections,
  ctx,
}: {
  sections: SectionInstance[];
  ctx: SectionCtx;
}) {
  return (
    <>
      <PinnedSections sections={sections} ctx={ctx} where="top" />
      <main>
        <SectionList sections={sections} ctx={ctx} />
      </main>
      <PinnedSections sections={sections} ctx={ctx} where="bottom" />
      <PinnedSections sections={sections} ctx={ctx} where="floating" />
    </>
  );
}

export { SectionBoundary };
