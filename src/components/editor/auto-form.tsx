'use client';

import { useState } from 'react';
import { z } from 'zod';
import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Trash2 } from 'lucide-react';
import { readHint, type FieldHint } from '@/sections/schemas';
import { tt } from '@/lib/i18n-text';
import type { Locale } from '@/lib/constants';
import type { PublicProduct } from '@/lib/server-api';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { FieldShell, I18nInput, ColorField, inputCls } from './fields';
import { ImageField, type ImageValue } from './image-field';

type Dict = Record<string, unknown>;

export type FormEnv = {
  locales: Locale[];
  tenantSlug: string;
  products: PublicProduct[];
  currencyFormat: (n: number) => string;
  disabled?: boolean;
  /** Shown faintly in empty image slots that fall back to the product image. */
  productImageUrl?: string;
};

/** zod v4: a field is `X.optional().describe(...)`; look through the optional. */
const unwrap = (s: z.ZodTypeAny): z.ZodTypeAny =>
  s instanceof z.ZodOptional ? (s.unwrap() as z.ZodTypeAny) : s;

const shapeOf = (s: z.ZodTypeAny): Record<string, z.ZodTypeAny> | null => {
  const inner = unwrap(s);
  return inner instanceof z.ZodObject ? (inner.shape as Record<string, z.ZodTypeAny>) : null;
};

/**
 * Renders an editor for any section, generated from its zod schema.
 *
 * Every control is chosen from the field's describe() hint (see
 * sections/schemas.ts), so adding a field to a section — or a whole new
 * section type — needs no editor code at all.
 */
export function AutoForm({
  schema,
  value,
  onChange,
  env,
  idPrefix,
}: {
  schema: z.ZodTypeAny;
  value: Dict;
  onChange: (next: Dict) => void;
  env: FormEnv;
  idPrefix: string;
}) {
  const shape = shapeOf(schema);
  if (!shape) return null;

  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4">
      {Object.entries(shape).map(([key, field]) => {
        const hint = readHint(field);
        if (!hint) return null;
        return (
          <Field
            key={key}
            id={`${idPrefix}-${key}`}
            field={field}
            hint={hint}
            value={value[key]}
            onChange={(v) => set(key, v)}
            env={env}
          />
        );
      })}
    </div>
  );
}

function Field({
  id,
  field,
  hint,
  value,
  onChange,
  env,
}: {
  id: string;
  field: z.ZodTypeAny;
  hint: FieldHint;
  value: unknown;
  onChange: (v: unknown) => void;
  env: FormEnv;
}) {
  switch (hint.control) {
    case 'i18n':
      return (
        <I18nInput
          id={id}
          label={hint.label}
          help={hint.help}
          value={value}
          onChange={onChange}
          locales={env.locales}
          multiline={hint.multiline}
          max={hint.max}
        />
      );

    case 'text':
      return (
        <FieldShell label={hint.label} help={hint.help} htmlFor={id}>
          <input
            id={id}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
        </FieldShell>
      );

    case 'number':
      return (
        <FieldShell label={hint.label} help={hint.help} htmlFor={id}>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            value={typeof value === 'number' || typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            className={cn(inputCls, 'max-w-40')}
          />
        </FieldShell>
      );

    case 'switch':
      return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5">
          <div>
            <label htmlFor={id} className="text-xs font-bold text-foreground">{hint.label}</label>
            {hint.help ? <p className="text-[11px] text-muted-foreground">{hint.help}</p> : null}
          </div>
          <Switch id={id} checked={Boolean(value)} onCheckedChange={(v) => onChange(v)} disabled={env.disabled} />
        </div>
      );

    case 'select':
      return (
        <FieldShell label={hint.label} help={hint.help} htmlFor={id}>
          <select
            id={id}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={inputCls}
          >
            <option value="">—</option>
            {(hint.values ?? []).map((v) => (
              <option key={v} value={v}>
                {hint.labels?.[v] ?? v}
              </option>
            ))}
          </select>
        </FieldShell>
      );

    case 'color':
      return (
        <ColorField
          label={hint.label}
          value={typeof value === 'string' ? value : '#000000'}
          onChange={onChange}
        />
      );

    case 'datetime':
      return (
        <FieldShell label={hint.label} help={hint.help} htmlFor={id}>
          <div className="flex items-center gap-2">
            <input
              id={id}
              type="datetime-local"
              value={toLocalInput(value)}
              onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className={cn(inputCls, 'max-w-64')}
            />
            {value ? (
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs font-semibold text-muted-foreground hover:text-destructive"
              >
                Clear
              </button>
            ) : null}
          </div>
        </FieldShell>
      );

    case 'image':
      return (
        <ImageField
          id={id}
          label={hint.label}
          help={hint.help}
          value={value as ImageValue | undefined}
          onChange={onChange}
          tenantSlug={env.tenantSlug}
          disabled={env.disabled}
          fallbackUrl={/product/i.test(hint.help ?? '') ? env.productImageUrl : undefined}
        />
      );

    case 'product':
      return (
        <FieldShell
          label={hint.label}
          help={env.products.length === 0 ? 'Your catalogue has no products yet.' : hint.help}
          htmlFor={id}
        >
          <select
            id={id}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          >
            <option value="">First product in the catalogue</option>
            {env.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {env.currencyFormat(p.offerPrice ?? p.basePrice)}
              </option>
            ))}
          </select>
        </FieldShell>
      );

    case 'array':
      return (
        <ArrayField
          id={id}
          hint={hint}
          element={(() => {
            const inner = unwrap(field);
            return inner instanceof z.ZodArray ? (inner.element as z.ZodTypeAny) : null;
          })()}
          value={Array.isArray(value) ? (value as Dict[]) : []}
          onChange={onChange}
          env={env}
        />
      );

    default:
      return null;
  }
}

/** ISO string → the "YYYY-MM-DDTHH:mm" a datetime-local input wants, in local time. */
function toLocalInput(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const off = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

/** A readable title for a list item: its first non-empty text field. */
function itemTitle(element: z.ZodTypeAny | null, item: Dict, locale: Locale): string {
  const shape = element ? shapeOf(element) : null;
  if (!shape) return '';
  for (const [key, f] of Object.entries(shape)) {
    const h = readHint(f);
    if (h?.control === 'i18n' || h?.control === 'text') {
      const v = tt(item[key], locale, locale);
      if (v) return v;
    }
  }
  return '';
}

function ArrayField({
  id,
  hint,
  element,
  value,
  onChange,
  env,
}: {
  id: string;
  hint: FieldHint;
  element: z.ZodTypeAny | null;
  value: Dict[];
  onChange: (v: Dict[]) => void;
  env: FormEnv;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const noun = hint.itemLabel ?? 'Item';

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
    setOpen(to);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-foreground">
          {hint.label} <span className="font-medium text-muted-foreground">({value.length})</span>
        </p>
        <button
          type="button"
          disabled={env.disabled}
          onClick={() => {
            onChange([...value, {}]);
            setOpen(value.length);
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-primary/30 px-2.5 py-1 text-[11px] font-bold text-primary transition hover:bg-primary/10 disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          Add {noun.toLowerCase()}
        </button>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          None yet.
        </p>
      ) : null}

      <div className="space-y-2">
        {value.map((item, i) => {
          const isOpen = open === i;
          const title = itemTitle(element, item, env.locales[0] ?? 'bn');
          return (
            <div key={i} className={cn('overflow-hidden rounded-xl border bg-card', isOpen ? 'border-primary/40' : 'border-border')}>
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="truncate text-xs font-semibold text-foreground">{title || `${noun} ${i + 1}`}</span>
                  <ChevronDown className={cn('ml-auto size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                </button>
                <IconBtn label="Move up" onClick={() => move(i, i - 1)} disabled={env.disabled || i === 0}>
                  <ArrowUp className="size-3.5" />
                </IconBtn>
                <IconBtn label="Move down" onClick={() => move(i, i + 1)} disabled={env.disabled || i === value.length - 1}>
                  <ArrowDown className="size-3.5" />
                </IconBtn>
                <IconBtn
                  label="Duplicate"
                  disabled={env.disabled}
                  onClick={() => {
                    const next = [...value];
                    next.splice(i + 1, 0, structuredClone(item));
                    onChange(next);
                    setOpen(i + 1);
                  }}
                >
                  <Copy className="size-3.5" />
                </IconBtn>
                <IconBtn
                  label="Remove"
                  danger
                  disabled={env.disabled}
                  onClick={() => {
                    onChange(value.filter((_, j) => j !== i));
                    setOpen(null);
                  }}
                >
                  <Trash2 className="size-3.5" />
                </IconBtn>
              </div>
              {isOpen && element ? (
                <div className="border-t border-border bg-muted/10 p-3">
                  <AutoForm
                    schema={element}
                    value={item}
                    onChange={(next) => onChange(value.map((x, j) => (j === i ? next : x)))}
                    env={env}
                    idPrefix={`${id}-${i}`}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition disabled:opacity-30',
        danger ? 'hover:bg-destructive/10 hover:text-destructive' : 'hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
