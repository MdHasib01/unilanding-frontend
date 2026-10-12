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

const RICH_HELP = 'Wrap words in **double stars** to colour them in your brand colour.';

/** A tenant-authored localised string: { bn, en }. */
export const i18nText = (
  label: string,
  opts: { multiline?: boolean; max?: number; rich?: boolean; help?: string } = {}
) =>
  z
    .union([z.string(), z.record(z.string(), z.string())])
    .optional()
    .describe(
      JSON.stringify({
        control: 'i18n',
        label,
        multiline: opts.multiline ?? false,
        max: opts.max ?? 400,
        help: opts.help ?? (opts.rich ? RICH_HELP : undefined),
      })
    );

export const imageField = (label: string, help?: string) =>
  z
    .object({
      url: z.string().max(2000).default(''),
      publicId: z.string().max(400).default(''),
      alt: z.string().max(300).optional(),
    })
    .partial()
    .optional()
    .describe(JSON.stringify({ control: 'image', label, help }));

export const colorField = (label: string) =>
  z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional()
    .describe(JSON.stringify({ control: 'color', label }));

export const text = (label: string, max = 200, help?: string) =>
  z.string().max(max).optional().describe(JSON.stringify({ control: 'text', label, help }));

export const num = (label: string, help?: string) =>
  z.coerce.number().optional().describe(JSON.stringify({ control: 'number', label, help }));

export const bool = (label: string, help?: string) =>
  z.boolean().optional().describe(JSON.stringify({ control: 'switch', label, help }));

export const choice = <T extends readonly [string, ...string[]]>(
  label: string,
  values: T,
  labels?: Partial<Record<T[number], string>>
) =>
  z.enum(values).optional().describe(JSON.stringify({ control: 'select', label, values, labels }));

export const dateField = (label: string, help?: string) =>
  z.string().optional().describe(JSON.stringify({ control: 'datetime', label, help }));

export const list = (label: string, item: z.ZodTypeAny, max = 40, itemLabel?: string) =>
  z.array(item).max(max).optional().describe(JSON.stringify({ control: 'array', label, itemLabel }));

export const productRef = (label: string, help?: string) =>
  z.string().optional().describe(JSON.stringify({ control: 'product', label, help }));

// ── shared item shapes ──────────────────────────────────────────────────────

const pointItem = z.object({ text: i18nText('Point') });

const reviewItem = z.object({
  name: text('Name', 120),
  location: i18nText('Location'),
  rating: num('Rating (1-5)'),
  text: i18nText('Review', { multiline: true, max: 1200 }),
  image: imageField('Photo'),
  timeAgo: i18nText('When (e.g. ২ দিন আগে)'),
  verified: bool('Show "Verified Purchase"'),
});

const faqItem = z.object({
  q: i18nText('Question'),
  a: i18nText('Answer', { multiline: true, max: 2000 }),
});

const doctorItem = z.object({
  name: text('Name', 120),
  degree: text('Degree', 160),
  subtitle: i18nText('Subtitle'),
  description: i18nText('Quote', { multiline: true, max: 2000 }),
  image: imageField('Photo'),
});

export const CERT_ICONS = ['award', 'badgeCheck', 'sprout', 'shieldCheck', 'flask', 'leaf', 'heart', 'star'] as const;

const certItem = z.object({
  label: i18nText('Label'),
  icon: choice('Icon', CERT_ICONS, {
    award: 'Award',
    badgeCheck: 'Badge',
    sprout: 'Sprout (vegan)',
    shieldCheck: 'Shield',
    flask: 'Lab flask',
    leaf: 'Leaf',
    heart: 'Heart',
    star: 'Star',
  }),
  image: imageField('Badge image (optional)', 'Replaces the icon when set.'),
});

const benefitItem = z.object({
  title: i18nText('Title'),
  body: i18nText('Body', { multiline: true, max: 600 }),
  icon: text('Icon name', 60),
});

const orbitItem = z.object({
  accent: i18nText('Highlighted words (brand colour)'),
  rest: i18nText('Rest of the line'),
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

const ctaText = (label = 'Button text') => i18nText(label);
const ctaTarget = () => text('Button scrolls to (section id)', 80, 'Leave as "order" to scroll to the order form.');

// ── section schemas ─────────────────────────────────────────────────────────

export const sectionSchemas = {
  announcementBar: z.object({
    text: i18nText('Announcement'),
    showCountdown: bool('Show countdown timer'),
    countdownTo: dateField('Count down to', 'Leave empty to count down to midnight, every day.'),
  }),

  hero: z.object({
    title: i18nText('Headline — first line', { max: 300 }),
    titleHighlight: i18nText('Headline — second line (brand colour)', { max: 300 }),
    subtitle: i18nText('Text inside the pill', {
      multiline: true,
      max: 600,
      help: 'Wrap words in **double stars** to make them bold.',
    }),
    ctaText: ctaText('Order button text'),
    ctaTarget: ctaTarget(),
    showMessenger: bool('Show the Messenger button'),
    messengerText: i18nText('Messenger button text'),
    messengerUrl: text('Messenger / Facebook page link', 500),
  }),

  imagine: z.object({
    title: i18nText('Headline', {
      max: 400,
      help: '**double stars** = brand colour, __double underscores__ = greyed out.',
    }),
    image: imageField('Before / after image'),
    closingLine: i18nText('Line under the image', { rich: true }),
    ctaText: ctaText(),
    ctaTarget: ctaTarget(),
  }),

  benefitsOrbit: z.object({
    title: i18nText('Headline', { max: 300 }),
    centerImage: imageField('Centre image', 'Leave empty to use the product image from Theme & Brand.'),
    items: list('Benefits around the product', orbitItem, 8, 'Benefit'),
  }),

  benefitsGrid: z.object({
    title: i18nText('Headline', { max: 300 }),
    subtitle: i18nText('Subheadline', { multiline: true, max: 600 }),
    columns: choice('Columns', ['2', '3', '4']),
    items: list('Benefits', benefitItem, 12, 'Benefit'),
  }),

  reviewsCarousel: z.object({
    title: i18nText('Headline', { max: 300, rich: true }),
    subtitle: i18nText('Subheadline', { max: 400 }),
    autoplayMs: num('Auto-advance every (ms, 0 = off)'),
    verifiedLabel: i18nText('Verified badge text'),
    items: list('Reviews', reviewItem, 30, 'Review'),
    ctaText: ctaText(),
    ctaTarget: ctaTarget(),
  }),

  certifications: z.object({
    title: i18nText('Headline', { max: 300 }),
    subtitle: i18nText('Subheadline', { max: 400 }),
    items: list('Certifications', certItem, 12, 'Certification'),
    doctors: list('Doctor recommendations', doctorItem, 12, 'Doctor'),
    doctorBadge: i18nText('Doctor card badge'),
    doctorTag: text('Doctor card tag', 60),
    autoplayMs: num('Auto-advance every (ms, 0 = off)'),
    ctaText: ctaText(),
    ctaTarget: ctaTarget(),
  }),

  doctorsCarousel: z.object({
    title: i18nText('Headline', { max: 300 }),
    items: list('Experts', doctorItem, 12, 'Expert'),
  }),

  faq: z.object({
    title: i18nText('Headline', { max: 300, rich: true }),
    items: list('Questions', faqItem, 30, 'Question'),
    defaultOpen: num('Open this one by default (1 = first, 0 = none)'),
    initialVisible: num('Questions shown before "show more"'),
    showMoreText: i18nText('"Show more" text'),
    showLessText: i18nText('"Show less" text'),
    ctaText: ctaText(),
    ctaTarget: ctaTarget(),
  }),

  comparison: z.object({
    eyebrow: i18nText('Small line above the headline'),
    circledText: i18nText('Circled words'),
    title: i18nText('Rest of the headline'),
    subtitle: i18nText('Question under the headline'),
    leftLabel: i18nText('Left card — title'),
    leftTag: i18nText('Left card — tag'),
    leftItems: list('Left card — points', pointItem, 10, 'Point'),
    rightBadge: i18nText('Right card — corner badge'),
    rightLabel: i18nText('Right card — title'),
    rightItems: list('Right card — points', pointItem, 10, 'Point'),
    closingLine: i18nText('Closing line'),
    closingHighlight: i18nText('Closing line (brand colour)'),
    closingQuestion: i18nText('Closing question'),
    ctaText: ctaText(),
    ctaTarget: ctaTarget(),
  }),

  emotionalCost: z.object({
    image: imageField('Image'),
    title: i18nText('Headline', {
      max: 400,
      help: 'Wrap words in !!double exclamation marks!! to colour them red.',
    }),
    highlight: i18nText('Red box', { multiline: true, max: 600, help: 'Wrap words in **double stars** to make them bold.' }),
    body: i18nText('Paragraph', { multiline: true, max: 2000 }),
    aside: i18nText('Italic line', { multiline: true, max: 600 }),
    conclusion: i18nText('Bold closing line', { multiline: true, max: 600 }),
    emoji: text('Emoji', 8),
  }),

  guarantee: z.object({
    title: i18nText('Headline', { max: 300, rich: true }),
    subtitle: i18nText('Subheadline', { max: 400 }),
    cardTitle: i18nText('Card title', { max: 300 }),
    text: i18nText('Card text', { multiline: true, max: 1200 }),
    badgeImage: imageField('Badge image (optional)', 'Replaces the shield icon when set.'),
  }),

  pricingCard: z.object({
    title: i18nText('Headline', { max: 300, rich: true }),
    productId: productRef('Product', 'Prices come from the product, so they are always the real ones.'),
    productTitle: i18nText('Product title on the card', { help: 'Leave empty to use the product name.' }),
    image: imageField('Product image', 'Leave empty to use the product image.'),
    ribbonText: text('Corner ribbon', 40, 'Leave empty to show the discount, e.g. "40% OFF".'),
    savingsText: i18nText('Savings pill', {
      help: 'Use {amount} and {percent}, e.g. "আপনার সাশ্রয় {amount} ({percent}% ছাড়)".',
    }),
    showTimer: bool('Show countdown'),
    timerLabel: i18nText('Countdown label'),
    ctaText: ctaText(),
    ctaTarget: ctaTarget(),
  }),

  orderForm: z.object({
    headline: i18nText('Headline', { max: 300 }),
    subheadline: i18nText('Subheadline', { multiline: true, max: 600 }),
    productId: productRef('Product'),
    deliveryTitle: i18nText('Form title'),
    variantLabel: i18nText('Variant picker label'),
    nameLabel: i18nText('Name label'),
    namePlaceholder: i18nText('Name placeholder'),
    phoneLabel: i18nText('Phone label'),
    addressLabel: i18nText('Address label'),
    addressPlaceholder: i18nText('Address placeholder'),
    showDistrict: bool('Ask for district', 'Always shown when your order settings require it.'),
    showThana: bool('Ask for area / thana'),
    showAltPhone: bool('Ask for a second phone number'),
    showEmail: bool('Ask for email'),
    showNote: bool('Allow an order note'),
    summaryTitle: i18nText('Summary title'),
    deliveryLabel: i18nText('Delivery charge label'),
    freeText: i18nText('"Free delivery" text'),
    savingText: i18nText('Savings label'),
    totalLabel: i18nText('Total label'),
    paymentTitle: i18nText('Payment section title'),
    codNote: i18nText('Cash on delivery note'),
    bkashQr: imageField('bKash QR / instruction image'),
    submitText: i18nText('Order button text'),
    trustBadges: list('Lines under the button', pointItem, 4, 'Line'),
    showSocialProof: bool('Show order counter'),
    socialCount: text('Order counter number', 30),
    socialText: i18nText('Order counter text'),
  }),

  countdown: z.object({
    title: i18nText('Headline', { max: 300 }),
    endsAt: dateField('Ends at'),
    expiredText: i18nText('Text once it has ended'),
  }),

  logoCloud: z.object({
    title: i18nText('Headline', { max: 300 }),
    items: list('Logos', logoItem, 20, 'Logo'),
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
    ctaText: ctaText(),
    ctaTarget: ctaTarget(),
  }),

  richText: z.object({
    title: i18nText('Headline', { max: 300 }),
    body: i18nText('Body', { multiline: true, max: 8000 }),
    align: choice('Alignment', ['left', 'center']),
  }),

  footer: z.object({
    text: i18nText('About line', { multiline: true, max: 600 }),
    contactTitle: i18nText('Contact heading'),
    phone: text('Phone', 60),
    email: text('Email', 160),
    address: i18nText('Address', { multiline: true, max: 400 }),
    links: list('Links', linkItem, 12, 'Link'),
    socials: list('Social profiles', socialItem, 8, 'Profile'),
    rightsText: i18nText('Copyright line'),
    showPoweredBy: bool('Show "Powered by UniLanding"'),
  }),

  stickyCta: z.object({
    productId: productRef('Price shown from product'),
    showPrice: bool('Show price'),
    discountText: text('Discount tag', 40, 'Leave empty to show the discount, e.g. "৪০% ছাড়".'),
    showCountdown: bool('Show countdown'),
    ctaText: ctaText(),
    target: ctaTarget(),
    showAfterPx: num('Appear after scrolling (px)'),
  }),

  floatingActions: z.object({
    whatsappNumber: text('WhatsApp number', 40),
    whatsappMessage: i18nText('Pre-filled WhatsApp message'),
    callNumber: text('Call button number (optional)', 40),
    backToTop: bool('Show back-to-top button'),
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
  labels?: Record<string, string>;
  help?: string;
  itemLabel?: string;
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
