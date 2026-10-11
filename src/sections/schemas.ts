import { z } from 'zod';

/**
 * Per-section field schemas. These are the single source of truth for both
 * validation and the auto-generated editor form, so adding a field to a section
 * means touching one place.
 *
 * The `.describe()` strings and the custom markers below are what AutoForm
 * reads to decide which control to render.
 */

// ── field markers ───────────────────────────────────────────────────────────

/** A tenant-authored localised string: { bn, en }. */
export const i18nText = (label: string, opts: { multiline?: boolean; max?: number } = {}) =>
  z
    .union([z.string(), z.record(z.string(), z.string())])
    .optional()
    .describe(
      JSON.stringify({ control: 'i18n', label, multiline: opts.multiline ?? false, max: opts.max ?? 400 })
    );

export const imageField = (label: string) =>
  z
    .object({
      url: z.string().max(2000).default(''),
      publicId: z.string().max(400).default(''),
      alt: z.string().max(300).optional(),
    })
    .partial()
    .optional()
    .describe(JSON.stringify({ control: 'image', label }));

export const colorField = (label: string) =>
  z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional()
    .describe(JSON.stringify({ control: 'color', label }));

export const text = (label: string, max = 200) =>
  z.string().max(max).optional().describe(JSON.stringify({ control: 'text', label }));

export const num = (label: string) =>
  z.coerce.number().optional().describe(JSON.stringify({ control: 'number', label }));

export const bool = (label: string) =>
  z.boolean().optional().describe(JSON.stringify({ control: 'switch', label }));

export const choice = <T extends readonly [string, ...string[]]>(label: string, values: T) =>
  z.enum(values).optional().describe(JSON.stringify({ control: 'select', label, values }));

export const dateField = (label: string) =>
  z.string().optional().describe(JSON.stringify({ control: 'datetime', label }));

export const list = (label: string, item: z.ZodTypeAny, max = 40) =>
  z.array(item).max(max).optional().describe(JSON.stringify({ control: 'array', label }));

export const productRef = (label: string) =>
  z.string().optional().describe(JSON.stringify({ control: 'product', label }));

// ── shared item shapes ──────────────────────────────────────────────────────

const bulletItem = z.object({
  text: i18nText('Text'),
  icon: text('Icon name', 60),
});

const reviewItem = z.object({
  name: text('Name', 120),
  location: text('Location', 120),
  rating: num('Rating (1-5)'),
  text: i18nText('Review', { multiline: true, max: 1200 }),
  image: imageField('Photo'),
  verified: bool('Show verified badge'),
});

const faqItem = z.object({
  q: i18nText('Question'),
  a: i18nText('Answer', { multiline: true, max: 2000 }),
});

const doctorItem = z.object({
  name: text('Name', 120),
  degree: text('Degree', 160),
  subtitle: i18nText('Subtitle'),
  description: i18nText('Description', { multiline: true, max: 2000 }),
  image: imageField('Photo'),
});

const certItem = z.object({
  label: i18nText('Label'),
  image: imageField('Badge'),
  note: i18nText('Note'),
});

const benefitItem = z.object({
  title: i18nText('Title'),
  body: i18nText('Body', { multiline: true, max: 600 }),
  icon: text('Icon name', 60),
});

const costRow = z.object({
  label: i18nText('Label'),
  amount: text('Amount', 60),
});

const linkItem = z.object({
  label: i18nText('Label'),
  href: text('URL', 500),
});

const socialItem = z.object({
  platform: choice('Platform', ['facebook', 'instagram', 'youtube', 'tiktok', 'whatsapp', 'x']),
  href: text('URL', 500),
});

const logoItem = z.object({
  label: text('Label', 120),
  image: imageField('Logo'),
});

// ── section schemas ─────────────────────────────────────────────────────────

export const sectionSchemas = {
  announcementBar: z.object({
    text: i18nText('Announcement'),
    countdownTo: dateField('Count down to'),
    dismissible: bool('Visitor can dismiss'),
  }),

  hero: z.object({
    badge: i18nText('Badge'),
    title: i18nText('Headline', { max: 300 }),
    titleHighlight: text('Highlight this phrase in the headline', 160),
    subtitle: i18nText('Subheadline', { multiline: true, max: 600 }),
    ctaText: i18nText('Button text'),
    ctaTarget: text('Scrolls to (section id)', 80),
    image: imageField('Hero image'),
    imageMobile: imageField('Hero image (mobile)'),
    trustBadges: list('Trust badges', z.object({ label: i18nText('Label') }), 6),
  }),

  imagine: z.object({
    badge: i18nText('Badge'),
    title: i18nText('Headline', { max: 300 }),
    beforeTitle: i18nText('Before — title'),
    beforeItems: list('Before — points', bulletItem, 8),
    afterTitle: i18nText('After — title'),
    afterItems: list('After — points', bulletItem, 8),
    image: imageField('Before / after image'),
  }),

  benefitsOrbit: z.object({
    badge: i18nText('Badge'),
    title: i18nText('Headline', { max: 300 }),
    subtitle: i18nText('Subheadline', { multiline: true, max: 600 }),
    centerImage: imageField('Centre image (the product)'),
    items: list('Benefits', benefitItem, 8),
  }),

  benefitsGrid: z.object({
    title: i18nText('Headline', { max: 300 }),
    subtitle: i18nText('Subheadline', { multiline: true, max: 600 }),
    columns: choice('Columns', ['2', '3', '4']),
    items: list('Benefits', benefitItem, 12),
  }),

  reviewsCarousel: z.object({
    title: i18nText('Headline', { max: 300 }),
    autoplayMs: num('Autoplay delay (ms, 0 = off)'),
    items: list('Reviews', reviewItem, 30),
  }),

  certifications: z.object({
    title: i18nText('Headline', { max: 300 }),
    items: list('Certifications', certItem, 12),
  }),

  doctorsCarousel: z.object({
    title: i18nText('Headline', { max: 300 }),
    items: list('Experts', doctorItem, 12),
  }),

  faq: z.object({
    title: i18nText('Headline', { max: 300 }),
    items: list('Questions', faqItem, 30),
    defaultOpen: num('Open this one by default (0 = first)'),
  }),

  comparison: z.object({
    title: i18nText('Headline', { max: 300 }),
    leftLabel: i18nText('Left column label'),
    leftItems: list('Left column points', bulletItem, 10),
    rightLabel: i18nText('Right column label'),
    rightItems: list('Right column points', bulletItem, 10),
  }),

  emotionalCost: z.object({
    title: i18nText('Headline', { max: 300 }),
    body: i18nText('Body', { multiline: true, max: 2000 }),
    costRows: list('Cost breakdown', costRow, 8),
    conclusion: i18nText('Conclusion', { multiline: true, max: 600 }),
    image: imageField('Image'),
  }),

  guarantee: z.object({
    title: i18nText('Headline', { max: 300 }),
    text: i18nText('Body', { multiline: true, max: 1200 }),
    days: num('Guarantee length (days)'),
    badgeImage: imageField('Badge image'),
  }),

  pricingCard: z.object({
    title: i18nText('Headline', { max: 300 }),
    productId: productRef('Product'),
    showVariants: bool('Let the visitor choose a variant'),
    savingsLabel: i18nText('Savings label'),
    ctaText: i18nText('Button text'),
    bullets: list('What is included', bulletItem, 10),
  }),

  orderForm: z.object({
    headline: i18nText('Headline', { max: 300 }),
    subheadline: i18nText('Subheadline', { multiline: true, max: 600 }),
    productId: productRef('Product'),
    showDistrict: bool('Ask for district'),
    showThana: bool('Ask for area / thana'),
    showAltPhone: bool('Ask for a second phone number'),
    showEmail: bool('Ask for email'),
    showNote: bool('Allow an order note'),
    submitText: i18nText('Button text'),
    successNote: i18nText('Message after ordering', { multiline: true, max: 600 }),
  }),

  countdown: z.object({
    title: i18nText('Headline', { max: 300 }),
    endsAt: dateField('Ends at'),
    expiredText: i18nText('Text once it has ended'),
  }),

  logoCloud: z.object({
    title: i18nText('Headline', { max: 300 }),
    items: list('Logos', logoItem, 20),
  }),

  videoEmbed: z.object({
    title: i18nText('Headline', { max: 300 }),
    provider: choice('Provider', ['youtube', 'vimeo']),
    videoId: text('Video ID', 80),
    poster: imageField('Poster image'),
  }),

  imageText: z.object({
    title: i18nText('Headline', { max: 300 }),
    body: i18nText('Body', { multiline: true, max: 3000 }),
    image: imageField('Image'),
    imageSide: choice('Image side', ['left', 'right']),
    ctaText: i18nText('Button text'),
    ctaTarget: text('Scrolls to (section id)', 80),
  }),

  richText: z.object({
    title: i18nText('Headline', { max: 300 }),
    body: i18nText('Body', { multiline: true, max: 8000 }),
    align: choice('Alignment', ['left', 'center']),
  }),

  footer: z.object({
    text: i18nText('About line', { multiline: true, max: 600 }),
    phone: text('Phone', 60),
    email: text('Email', 160),
    address: i18nText('Address', { multiline: true, max: 400 }),
    links: list('Links', linkItem, 12),
    socials: list('Social profiles', socialItem, 8),
    showPoweredBy: bool('Show "Powered by UniLanding"'),
  }),

  stickyCta: z.object({
    text: i18nText('Text'),
    ctaText: i18nText('Button text'),
    target: text('Scrolls to (section id)', 80),
    showAfterPx: num('Appear after scrolling (px)'),
    mobileOnly: bool('Mobile only'),
  }),

  floatingActions: z.object({
    whatsappNumber: text('WhatsApp number', 40),
    whatsappMessage: i18nText('Pre-filled message'),
    callNumber: text('Phone number', 40),
    backToTop: bool('Show back-to-top'),
  }),
} as const;

export type SectionSchemas = typeof sectionSchemas;

/** Reads an AutoForm control hint off a schema field. */
export type FieldHint = {
  control:
    | 'i18n' | 'text' | 'number' | 'switch' | 'select' | 'color'
    | 'image' | 'array' | 'product' | 'datetime';
  label: string;
  multiline?: boolean;
  max?: number;
  values?: string[];
};

export function readHint(schema: z.ZodTypeAny): FieldHint | null {
  const d = schema.description;
  if (!d) return null;
  try {
    return JSON.parse(d) as FieldHint;
  } catch {
    return null;
  }
}
