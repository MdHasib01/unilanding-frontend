'use client';

import { useState } from 'react';
import {
  DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  ChevronDown, Columns, Eye, EyeOff, ExternalLink, GripVertical, LayoutGrid, Maximize2, Pin, Plus,
  RotateCcw, Trash2,
} from 'lucide-react';
import type { PageTheme } from '@/lib/theme-css';
import { SECTION_GROUPS, SECTION_REGISTRY, getSectionMeta } from '@/sections/registry';
import type { SectionCtx, SectionInstance, SectionType } from '@/sections/types';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AutoForm, type FormEnv } from './auto-form';
import { LiveSectionFrame, PagePreview } from './previews';

type ViewMode = 'inline' | 'split' | 'form';

const SAFE = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
/** Same alphabet and length as the server's sectionKey(). */
const newKey = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => SAFE[b % SAFE.length]).join('');

const PIN_LABEL = { top: 'Pinned to the top', bottom: 'Pinned to the bottom', floating: 'Floats over the page' } as const;

/** The reference editor's "📝 Content & Media Assets" tab. */
export function ContentPanel({
  sections,
  onSections,
  ctx,
  theme,
  env,
  canEdit,
  liveHref,
  onOpenFullPreview,
}: {
  sections: SectionInstance[];
  onSections: (next: SectionInstance[]) => void;
  ctx: SectionCtx;
  theme: PageTheme;
  env: FormEnv;
  canEdit: boolean;
  liveHref: string;
  onOpenFullPreview: () => void;
}) {
  const [mode, setMode] = useState<ViewMode>('inline');
  const [expanded, setExpanded] = useState<string | null>(() => sections.find((s) => s.type === 'hero')?.key ?? null);
  const [hiddenPreviews, setHiddenPreviews] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const flow = sections.filter((s) => !getSectionMeta(s.type)?.pinned);
  const pinned = sections.filter((s) => getSectionMeta(s.type)?.pinned);

  const renumber = (list: SectionInstance[]) => list.map((s, i) => ({ ...s, order: i }));
  const update = (key: string, patch: Partial<SectionInstance>) =>
    onSections(sections.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = flow.findIndex((s) => s.key === active.id);
    const to = flow.findIndex((s) => s.key === over.id);
    if (from < 0 || to < 0) return;
    // Pinned sections keep their slots after the flow; their order among
    // themselves is what decides, e.g., sticky bar vs floating buttons.
    onSections(renumber([...arrayMove(flow, from, to), ...pinned]));
  };

  const addSection = (type: SectionType) => {
    const meta = SECTION_REGISTRY[type];
    const fresh: SectionInstance = { key: newKey(), type, order: 0, enabled: true, data: {} };
    const next = meta.pinned ? [...flow, ...pinned, fresh] : [...flow, fresh, ...pinned];
    onSections(renumber(next));
    setExpanded(fresh.key);
    setAdding(false);
  };

  const remove = (s: SectionInstance) => {
    const label = getSectionMeta(s.type)?.label ?? s.type;
    if (!window.confirm(`Remove the "${label}" section? Its content will be lost when you save.`)) return;
    onSections(renumber(sections.filter((x) => x.key !== s.key)));
  };

  const card = (s: SectionInstance, sortable: boolean) => (
    <SectionCard
      key={s.key}
      section={s}
      sortable={sortable && canEdit}
      expanded={expanded === s.key}
      onToggle={() => setExpanded(expanded === s.key ? null : s.key)}
      onChange={(patch) => update(s.key, patch)}
      onRemove={() => remove(s)}
      showPreview={mode === 'inline' && !hiddenPreviews.has(s.key)}
      onTogglePreview={
        mode === 'inline'
          ? () =>
              setHiddenPreviews((prev) => {
                const n = new Set(prev);
                if (n.has(s.key)) n.delete(s.key);
                else n.add(s.key);
                return n;
              })
          : undefined
      }
      ctx={ctx}
      theme={theme}
      env={env}
      canEdit={canEdit}
    />
  );

  const forms = (
    <div className="space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext items={flow.map((s) => s.key)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">{flow.map((s) => card(s, true))}</div>
        </SortableContext>
      </DndContext>

      {pinned.length > 0 ? (
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Pin className="size-3.5" /> Page frame
          </p>
          {pinned.map((s) => card(s, false))}
        </div>
      ) : null}

      {canEdit ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-bold text-muted-foreground transition hover:border-primary/50 hover:text-primary"
        >
          <Plus className="size-4" />
          Add a section
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview mode:</span>
          {(
            [
              { v: 'inline', label: 'Inline previews', Icon: LayoutGrid },
              { v: 'split', label: 'Split view', Icon: Columns },
              { v: 'form', label: 'Form only', Icon: EyeOff },
            ] as const
          ).map(({ v, label, Icon }) => (
            <button
              key={v}
              type="button"
              onClick={() => setMode(v)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all',
                mode === v ? 'bg-primary text-primary-foreground shadow-xs' : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onOpenFullPreview}
          className="flex items-center gap-2 rounded-xl border border-primary/30 px-3.5 py-2 text-xs font-bold text-primary transition hover:bg-primary/10"
        >
          <Maximize2 className="size-3.5" />
          Full landing page preview
        </button>
      </div>

      {mode === 'split' ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">{forms}</div>
          <div className="lg:col-span-6">
            <div className="sticky top-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs">
                    <Eye className="size-3.5" />
                  </span>
                  Live page preview
                </h3>
                <a href={liveHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                  View page <ExternalLink className="size-3.5" />
                </a>
              </div>
              <div className="overflow-hidden rounded-3xl border border-border shadow-xl">
                <PagePreview sections={sections} ctx={ctx} theme={theme} className="max-h-[calc(100vh-9rem)]" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        forms
      )}

      <AddSectionDialog open={adding} onOpenChange={setAdding} sections={sections} onAdd={addSection} />
    </div>
  );
}

function SectionCard({
  section,
  sortable,
  expanded,
  onToggle,
  onChange,
  onRemove,
  showPreview,
  onTogglePreview,
  ctx,
  theme,
  env,
  canEdit,
}: {
  section: SectionInstance;
  sortable: boolean;
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<SectionInstance>) => void;
  onRemove: () => void;
  showPreview: boolean;
  onTogglePreview?: () => void;
  ctx: SectionCtx;
  theme: PageTheme;
  env: FormEnv;
  canEdit: boolean;
}) {
  const meta = getSectionMeta(section.type);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.key,
    disabled: !sortable,
  });

  if (!meta) {
    return (
      <div className="rounded-2xl border border-dashed border-destructive/40 p-4 text-xs text-destructive">
        Unknown section type “{section.type}”.
      </div>
    );
  }

  const Icon = meta.icon;
  const enabled = section.enabled !== false;
  // The form always edits defaults merged with what is stored, so a field the
  // tenant never touched still shows the copy that is actually on the page.
  const value = { ...meta.defaults(), ...(section.data ?? {}) };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cn(
        'overflow-hidden rounded-2xl border bg-card shadow-xs transition-shadow',
        expanded ? 'border-primary/40 shadow-md' : 'border-border',
        isDragging && 'z-10 shadow-xl ring-2 ring-primary/30',
        !enabled && 'opacity-70'
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
        {sortable ? (
          <button
            type="button"
            aria-label="Drag to reorder"
            className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-muted-foreground hover:bg-muted active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center text-muted-foreground" title={meta.pinned ? PIN_LABEL[meta.pinned] : undefined}>
            <Pin className="size-3.5" />
          </span>
        )}

        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-foreground">{meta.label}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{meta.description}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          {onTogglePreview && expanded ? (
            <button
              type="button"
              onClick={onTogglePreview}
              title={showPreview ? 'Hide preview' : 'Show preview'}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {showPreview ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
          ) : null}
          <Switch
            checked={enabled}
            onCheckedChange={(v) => onChange({ enabled: v })}
            disabled={!canEdit}
            aria-label={enabled ? 'Shown on the page' : 'Hidden from the page'}
          />
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? 'Collapse' : 'Edit'}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-border bg-muted/10 p-4 sm:p-5">
          <fieldset disabled={!canEdit} className="min-w-0">
            <AutoForm
              schema={meta.schema}
              value={value}
              onChange={(data) => onChange({ data })}
              env={env}
              idPrefix={section.key}
            />
          </fieldset>

          {canEdit ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Put this section back to its original content?')) onChange({ data: {} });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="size-3.5" />
                Reset to default
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
                Remove section
              </button>
            </div>
          ) : null}

          {showPreview ? (
            <LiveSectionFrame title={meta.label} section={section} ctx={ctx} theme={theme} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AddSectionDialog({
  open,
  onOpenChange,
  sections,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sections: SectionInstance[];
  onAdd: (type: SectionType) => void;
}) {
  const present = new Set(sections.map((s) => s.type));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a section</DialogTitle>
          <DialogDescription>It is added at the end of the page — drag it where you want it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {SECTION_GROUPS.map((g) => {
            const items = Object.values(SECTION_REGISTRY).filter((m) => m.group === g.id);
            if (items.length === 0) return null;
            return (
              <div key={g.id}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{g.label}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((m) => {
                    const blocked = Boolean(m.singleton && present.has(m.type));
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.type}
                        type="button"
                        disabled={blocked}
                        onClick={() => onAdd(m.type)}
                        className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-4.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-foreground">{m.label}</span>
                          <span className="block text-[11px] leading-snug text-muted-foreground">
                            {blocked ? 'Already on this page (only one allowed).' : m.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
