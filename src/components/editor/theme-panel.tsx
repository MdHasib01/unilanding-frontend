'use client';

import { Eye, ExternalLink, Palette, Search, Sparkles, Type, ImageIcon } from 'lucide-react';
import { THEME_PRESETS, type PageTheme } from '@/lib/theme-css';
import type { PageBrand, ResolvedBrand } from '@/lib/brand';
import type { Locale } from '@/lib/constants';
import { getSectionMeta } from '@/sections/registry';
import type { SectionCtx, SectionInstance } from '@/sections/types';
import { BrandLogo } from '@/components/landing/brand-logo';
import { cn } from '@/lib/utils';
import { ColorField, FieldShell, I18nInput, inputCls } from './fields';
import { ImageField } from './image-field';
import { ThemedSurface } from './previews';
import { RenderSection } from '@/sections/renderer';

type Seo = { title?: unknown; description?: unknown };

const COLOR_FIELDS: {
  key: keyof PageTheme;
  label: string;
  description: string;
}[] = [
  { key: 'primary', label: 'Brand colour', description: 'Headlines, highlights, the top bar, prices.' },
  { key: 'accent', label: 'Accent colour', description: 'Secondary highlights, rings and the dark comparison section.' },
  { key: 'cta', label: 'Button colour', description: 'Every "order" button.' },
  { key: 'ctaForeground', label: 'Button text colour', description: 'Text on the order buttons.' },
  { key: 'background', label: 'Page background', description: 'The soft background behind sections.' },
];

const presetsFor = (key: keyof PageTheme) =>
  [...new Set(THEME_PRESETS.map((p) => (p.theme as PageTheme)[key]).filter(Boolean) as string[])];

/** The reference editor's "🎨 Theme & Colors" tab, plus brand assets. */
export function ThemePanel({
  brand,
  resolvedBrand,
  theme,
  seo,
  onBrand,
  onTheme,
  onSeo,
  sections,
  ctx,
  locales,
  tenantSlug,
  canEdit,
  liveHref,
}: {
  brand: PageBrand;
  resolvedBrand: ResolvedBrand;
  theme: PageTheme;
  seo: Seo;
  onBrand: (next: PageBrand) => void;
  onTheme: (next: PageTheme) => void;
  onSeo: (next: Seo) => void;
  sections: SectionInstance[];
  ctx: SectionCtx;
  locales: Locale[];
  tenantSlug: string;
  canEdit: boolean;
  liveHref: string;
}) {
  const setBrand = (patch: Partial<PageBrand>) => onBrand({ ...brand, ...patch });
  const logoType = brand.logoType ?? 'text';

  // The live preview uses the page's own hero and price card, if it has them.
  const previewSections = ['hero', 'pricingCard']
    .map((type) => sections.find((s) => s.type === type))
    .filter(Boolean) as SectionInstance[];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <fieldset disabled={!canEdit} className="min-w-0 space-y-6 lg:col-span-7">
        {/* ── brand ── */}
        <Card icon={Sparkles} title="Brand">
          <FieldShell label="Business / product name" help="Used in the footer, the browser tab and link previews." htmlFor="brand-name">
            <input
              id="brand-name"
              value={brand.name ?? ''}
              onChange={(e) => setBrand({ name: e.target.value })}
              className={inputCls}
              maxLength={160}
            />
          </FieldShell>

          <FieldShell label="Logo">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { v: 'text', label: 'Text logo', Icon: Type },
                  { v: 'image', label: 'Image logo', Icon: ImageIcon },
                ] as const
              ).map(({ v, label, Icon }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBrand({ logoType: v })}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition',
                    logoType === v
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </FieldShell>

          {logoType === 'image' ? (
            <ImageField
              id="brand-logo"
              label="Logo image"
              help="A transparent PNG, WEBP or SVG looks best."
              value={brand.logo}
              onChange={(v) => setBrand({ logo: { url: v.url ?? '', publicId: v.publicId ?? '' } })}
              tenantSlug={tenantSlug}
              disabled={!canEdit}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldShell label="Coloured part" help="Shown in your brand colour." htmlFor="brand-accent">
                <input
                  id="brand-accent"
                  value={brand.logoTextAccent ?? ''}
                  onChange={(e) => setBrand({ logoTextAccent: e.target.value })}
                  className={inputCls}
                  maxLength={60}
                />
              </FieldShell>
              <FieldShell label="Rest of the name" htmlFor="brand-text">
                <input
                  id="brand-text"
                  value={brand.logoText ?? ''}
                  onChange={(e) => setBrand({ logoText: e.target.value })}
                  className={inputCls}
                  maxLength={60}
                />
              </FieldShell>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <span className="text-[11px] font-semibold text-muted-foreground">Logo preview:</span>
            <ThemedSurface theme={theme} className="rounded-lg bg-transparent px-2">
              <BrandLogo brand={resolvedBrand} size="sm" />
            </ThemedSurface>
          </div>

          <ImageField
            id="brand-product"
            label="Product image"
            help="Used in the loading screen, the benefits ring and the price card wherever those have no image of their own."
            value={brand.productImage}
            onChange={(v) => setBrand({ productImage: { url: v.url ?? '', publicId: v.publicId ?? '' } })}
            tenantSlug={tenantSlug}
            disabled={!canEdit}
            fallbackUrl={resolvedBrand.productImageUrl}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ImageField
              id="brand-favicon"
              label="Browser tab icon"
              help="Square, at least 64×64."
              value={brand.favicon}
              onChange={(v) => setBrand({ favicon: { url: v.url ?? '', publicId: v.publicId ?? '' } })}
              tenantSlug={tenantSlug}
              disabled={!canEdit}
            />
            <FieldShell
              label="Loading screen badge"
              help="The line under the logo while the page loads on a first visit."
              htmlFor="brand-badge"
            >
              <input
                id="brand-badge"
                value={brand.loaderBadge ?? ''}
                onChange={(e) => setBrand({ loaderBadge: e.target.value })}
                className={inputCls}
                maxLength={160}
              />
            </FieldShell>
          </div>
        </Card>

        {/* ── colours ── */}
        <Card icon={Palette} title="Colour settings">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground">Palettes:</span>
            {THEME_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onTheme({ ...theme, ...p.theme, preset: p.id })}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition hover:border-primary/50',
                  theme.preset === p.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground'
                )}
              >
                <span className="flex -space-x-1">
                  {[p.theme.primary, p.theme.accent, p.theme.cta].map((c) => (
                    <span key={c} className="size-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: c }} />
                  ))}
                </span>
                {p.name}
              </button>
            ))}
          </div>

          {COLOR_FIELDS.map((f) => (
            <ColorField
              key={f.key}
              label={f.label}
              description={f.description}
              value={(theme[f.key] as string) || '#000000'}
              onChange={(v) => onTheme({ ...theme, [f.key]: v, preset: '' })}
              presets={presetsFor(f.key)}
            />
          ))}
        </Card>

        {/* ── search & sharing ── */}
        <Card icon={Search} title="Search & sharing">
          <I18nInput
            id="seo-title"
            label="Page title"
            help="The browser tab and the headline of a shared link."
            value={seo.title}
            onChange={(v) => onSeo({ ...seo, title: v })}
            locales={locales}
            max={200}
          />
          <I18nInput
            id="seo-description"
            label="Description"
            help="The line under the title in Google and in Facebook / WhatsApp link previews."
            value={seo.description}
            onChange={(v) => onSeo({ ...seo, description: v })}
            locales={locales}
            multiline
            max={500}
          />
        </Card>
      </fieldset>

      {/* ── live preview ── */}
      <div className="space-y-4 lg:col-span-5">
        <div className="sticky top-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-2xs">
                <Eye className="size-3.5" />
              </span>
              Live theme preview
            </h3>
            <a href={liveHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              View page <ExternalLink className="size-3.5" />
            </a>
          </div>

          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl border border-border shadow-xl">
            <ThemedSurface theme={theme} className="relative">
              {previewSections.length > 0 ? (
                previewSections.map((s) => (
                  <RenderSection key={s.key} section={{ ...s, enabled: true }} ctx={ctx} />
                ))
              ) : (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  Add a {getSectionMeta('hero')?.label.toLowerCase()} section to preview your colours.
                </p>
              )}
            </ThemedSurface>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Card({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6', className)}>
      <h3 className="flex items-center gap-2 border-b border-border pb-3 text-sm font-bold uppercase tracking-wider text-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}
