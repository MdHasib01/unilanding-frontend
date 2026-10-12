import type { ComponentType } from 'react';
import type { ZodTypeAny } from 'zod';
import type { LucideIcon } from 'lucide-react';
import type { Locale } from '@/lib/constants';
import type { PublicProduct, PublicSettings, PublicTenant } from '@/lib/server-api';
import type { ResolvedBrand } from '@/lib/brand';

export const SECTION_TYPES = [
  'announcementBar',
  'hero',
  'imagine',
  'benefitsOrbit',
  'benefitsGrid',
  'reviewsCarousel',
  'certifications',
  'doctorsCarousel',
  'faq',
  'comparison',
  'emotionalCost',
  'guarantee',
  'pricingCard',
  'orderForm',
  'countdown',
  'logoCloud',
  'videoEmbed',
  'imageText',
  'richText',
  'footer',
  'stickyCta',
  'floatingActions',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export type SectionInstance = {
  key: string;
  type: SectionType | string;
  order: number;
  enabled?: boolean;
  data: Record<string, unknown>;
};

/**
 * Everything a block needs in order to render, passed down once from the page
 * rather than fetched per block.
 *
 * `mode` is what makes the editor preview safe: in 'preview' the order form
 * renders but will not submit, countdowns freeze, and analytics no-op.
 */
export type SectionCtx = {
  tenant: PublicTenant;
  /** Logo, product image and name, already resolved against the defaults. */
  brand: ResolvedBrand;
  locale: Locale;
  fallbackLocale: Locale;
  basePath: string;
  primaryHost: string;
  products: PublicProduct[];
  settings: PublicSettings;
  currency: string;
  mode: 'live' | 'preview';
};

export type SectionRendererProps<T = Record<string, unknown>> = {
  data: T;
  ctx: SectionCtx;
};

export type SectionGroup = 'chrome' | 'content' | 'social' | 'commerce';

/** Where a section sits outside the normal scroll flow. */
export type SectionPin = 'top' | 'bottom' | 'floating';

export type SectionMeta = {
  type: SectionType;
  /** i18n-able label shown in the editor's section list. */
  label: string;
  labelBn: string;
  group: SectionGroup;
  icon: LucideIcon;
  /** Validates the data AND drives the auto-generated editor form. */
  schema: ZodTypeAny;
  defaults: () => Record<string, unknown>;
  Renderer: ComponentType<SectionRendererProps<never>>;
  /** Only one instance allowed per page (hero, order form, footer…). */
  singleton?: boolean;
  pinned?: SectionPin;
  /** Hidden from the picker below this plan. */
  minPlan?: string;
  description?: string;
  descriptionBn?: string;
};
