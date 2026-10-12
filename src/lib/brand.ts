/**
 * Page-level identity, drafted and published with the rest of the page (see
 * LandingPage.brand on the server).
 *
 * Every section that shows the product falls back to `productImage` when its
 * own image is empty, so a tenant uploads one product shot and the hero,
 * benefits centre, price card and loader all pick it up.
 */

type ImageRef = { url?: string; publicId?: string };

export type PageBrand = {
  name?: string;
  logoType?: 'image' | 'text';
  logo?: ImageRef;
  logoText?: string;
  logoTextAccent?: string;
  productImage?: ImageRef;
  favicon?: ImageRef;
  loaderBadge?: string;
};

export type ResolvedBrand = {
  name: string;
  logoType: 'image' | 'text';
  logoUrl: string;
  /** Rendered in the brand colour, before `logoText`. */
  logoTextAccent: string;
  logoText: string;
  productImageUrl: string;
  faviconUrl: string;
  loaderBadge: string;
};

/** The MilkReady template's own assets, shipped in public/templates/milkready. */
export const TEMPLATE_ASSET = (file: string) => `/templates/milkready/${file}`;

export const DEFAULT_PRODUCT_IMAGE = TEMPLATE_ASSET('product-jar.webp');

export const BRAND_DEFAULTS: Required<Omit<PageBrand, 'name'>> = {
  logoType: 'text',
  logo: { url: '', publicId: '' },
  logoTextAccent: 'Milk',
  logoText: 'Ready™',
  productImage: { url: DEFAULT_PRODUCT_IMAGE, publicId: '' },
  favicon: { url: '', publicId: '' },
  loaderBadge: 'ডেলিভারি পূর্ববর্তী প্রস্তুতি',
};

/**
 * Fills the gaps in a stored brand. An image logo with no image falls back to
 * text, and a text logo with no text falls back to the business name, so the
 * header and loader never render empty.
 */
export function resolveBrand(brand: PageBrand | undefined, tenantName: string): ResolvedBrand {
  const b = brand ?? {};
  const logoUrl = b.logo?.url?.trim() || '';
  const wantsImage = (b.logoType ?? BRAND_DEFAULTS.logoType) === 'image';

  const hasTextFields = b.logoText !== undefined || b.logoTextAccent !== undefined;
  let logoTextAccent = hasTextFields ? (b.logoTextAccent ?? '') : BRAND_DEFAULTS.logoTextAccent;
  let logoText = hasTextFields ? (b.logoText ?? '') : BRAND_DEFAULTS.logoText;
  if (!logoTextAccent.trim() && !logoText.trim()) {
    logoTextAccent = '';
    logoText = b.name?.trim() || tenantName;
  }

  return {
    name: b.name?.trim() || tenantName,
    logoType: wantsImage && logoUrl ? 'image' : 'text',
    logoUrl,
    logoTextAccent,
    logoText,
    productImageUrl: b.productImage?.url?.trim() || DEFAULT_PRODUCT_IMAGE,
    faviconUrl: b.favicon?.url?.trim() || '',
    loaderBadge: b.loaderBadge ?? BRAND_DEFAULTS.loaderBadge,
  };
}

/** First non-empty image url, for section images that fall back to the product. */
export const imageOr = (img: ImageRef | undefined, fallback: string) =>
  img?.url?.trim() || fallback;
