'use client';

import { useState } from 'react';
import { setTt } from '@/lib/i18n-text';
import { LOCALE_LABELS, type Locale } from '@/lib/constants';
import { cn } from '@/lib/utils';

export const inputCls =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60';

/** Label, optional help line, then the control. */
export function FieldShell({
  label,
  help,
  htmlFor,
  aside,
  children,
}: {
  label: string;
  help?: string;
  htmlFor?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="block text-xs font-bold text-foreground">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {help ? <p className="text-[11px] leading-snug text-muted-foreground">{help}</p> : null}
    </div>
  );
}

/**
 * A tenant-authored string. With one enabled language it is a plain input that
 * writes that language's key; with two it grows language tabs — so a
 * single-language tenant never sees the bilingual machinery.
 */
export function I18nInput({
  id,
  label,
  help,
  value,
  onChange,
  locales,
  multiline,
  max = 400,
}: {
  id: string;
  label: string;
  help?: string;
  value: unknown;
  onChange: (next: Record<string, string>) => void;
  locales: Locale[];
  multiline?: boolean;
  max?: number;
}) {
  const [active, setActive] = useState<Locale>(locales[0] ?? 'bn');
  // This language's own text only — tt() would fall back to the other
  // language, which is right for rendering and wrong for editing. A plain
  // string is legacy single-language copy and belongs to the first locale.
  const own =
    typeof value === 'string'
      ? active === locales[0]
        ? value
        : ''
      : value && typeof value === 'object' && !Array.isArray(value)
        ? ((value as Record<string, string>)[active] ?? '')
        : '';

  const Control = multiline ? 'textarea' : 'input';

  return (
    <FieldShell
      label={label}
      help={help}
      htmlFor={id}
      aside={
        locales.length > 1 ? (
          <div className="flex gap-1">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setActive(l)}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase transition',
                  active === l ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {LOCALE_LABELS[l] ?? l}
              </button>
            ))}
          </div>
        ) : null
      }
    >
      <Control
        id={id}
        value={own}
        maxLength={max}
        rows={multiline ? 3 : undefined}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange(setTt(value, active, e.target.value))
        }
        className={cn(inputCls, multiline && 'min-h-20 resize-y leading-relaxed')}
      />
    </FieldShell>
  );
}

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Native colour picker, hex input and preset swatches, as in the reference. */
export function ColorField({
  label,
  description,
  value,
  onChange,
  presets = [],
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (next: string) => void;
  presets?: string[];
}) {
  const [draft, setDraft] = useState(value);
  const shown = draft.toLowerCase() === value.toLowerCase() || !HEX.test(draft) ? draft : value;

  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-foreground">{label}</p>
          {description ? <p className="text-[11px] text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <input
            type="color"
            aria-label={label}
            value={HEX.test(value) && value.length === 7 ? value : '#000000'}
            onChange={(e) => {
              setDraft(e.target.value);
              onChange(e.target.value);
            }}
            className="size-9 cursor-pointer rounded-lg border border-border bg-background p-0.5 disabled:cursor-not-allowed"
          />
          <input
            type="text"
            value={shown}
            maxLength={7}
            onChange={(e) => {
              const v = e.target.value.trim();
              setDraft(v);
              if (HEX.test(v)) onChange(v);
            }}
            className="w-24 rounded-lg border border-input bg-background px-2.5 py-1.5 font-mono text-xs uppercase text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>
      {presets.length > 0 ? (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[10px] font-semibold text-muted-foreground">Presets:</span>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              title={p}
              onClick={() => {
                setDraft(p);
                onChange(p);
              }}
              className={cn(
                'size-5 rounded-full border border-black/10 transition-transform hover:scale-110',
                value.toLowerCase() === p.toLowerCase() && 'ring-2 ring-primary ring-offset-1'
              )}
              style={{ backgroundColor: p }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
