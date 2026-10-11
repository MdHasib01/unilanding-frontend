import {
  Megaphone, Sparkles, SplitSquareVertical, Orbit, LayoutGrid, Star, Award,
  Stethoscope, HelpCircle, Columns2, Coins, ShieldCheck, Tag, ShoppingCart,
  Timer, Building2, Play, Image as ImageIcon, Type, PanelBottom, MousePointerClick,
  PhoneCall,
} from 'lucide-react';

import { sectionSchemas } from './schemas';
import { sectionDefaults } from './defaults';
import type { SectionMeta, SectionType } from './types';

import { AnnouncementBar } from './blocks/announcement-bar';
import { Hero } from './blocks/hero';
import { BenefitsOrbit, BenefitsGrid } from './blocks/benefits';
import { Imagine, Comparison, EmotionalCost, Guarantee } from './blocks/persuasion';
import { ReviewsCarousel, Certifications, DoctorsCarousel, LogoCloud } from './blocks/proof';
import { Faq, Countdown, VideoEmbed, ImageText, RichText } from './blocks/content';
import { PricingCard } from './blocks/pricing-card';
import { OrderForm } from './blocks/order-form';
import { Footer, StickyCta, FloatingActions } from './blocks/chrome';

/**
 * THE registry. Adding a section type means one entry here plus one component —
 * the renderer, the editor form, the section picker and validation all read
 * from this, so there is no second place to remember.
 *
 * Contrast with the reference project, where each of three landing pages
 * imported its own hand-built set of components and "add a new product page"
 * could create a database row but not a working page.
 */
export const SECTION_REGISTRY: Record<SectionType, SectionMeta> = {
  announcementBar: {
    type: 'announcementBar',
    label: 'Announcement bar',
    labelBn: 'ঘোষণা বার',
    group: 'chrome',
    icon: Megaphone,
    schema: sectionSchemas.announcementBar,
    defaults: sectionDefaults.announcementBar,
    Renderer: AnnouncementBar as SectionMeta['Renderer'],
    singleton: true,
    pinned: 'top',
    description: 'A thin bar at the very top, with an optional countdown.',
    descriptionBn: 'পেজের সবার উপরে সরু একটি বার, চাইলে কাউন্টডাউন সহ।',
  },

  hero: {
    type: 'hero',
    label: 'Hero',
    labelBn: 'হিরো',
    group: 'content',
    icon: Sparkles,
    schema: sectionSchemas.hero,
    defaults: sectionDefaults.hero,
    Renderer: Hero as SectionMeta['Renderer'],
    singleton: true,
    description: 'The first screen: headline, promise, main call to action.',
    descriptionBn: 'প্রথম স্ক্রিন — শিরোনাম, প্রতিশ্রুতি ও মূল বাটন।',
  },

  imagine: {
    type: 'imagine',
    label: 'Before / after',
    labelBn: 'আগে / পরে',
    group: 'content',
    icon: SplitSquareVertical,
    schema: sectionSchemas.imagine,
    defaults: sectionDefaults.imagine,
    Renderer: Imagine as SectionMeta['Renderer'],
    description: 'Two columns contrasting life without and with the product.',
    descriptionBn: 'দুই কলামে — পণ্যটি ছাড়া আর পণ্যটির সাথে।',
  },

  benefitsOrbit: {
    type: 'benefitsOrbit',
    label: 'Benefits (orbit)',
    labelBn: 'উপকারিতা (বৃত্ত)',
    group: 'content',
    icon: Orbit,
    schema: sectionSchemas.benefitsOrbit,
    defaults: sectionDefaults.benefitsOrbit,
    Renderer: BenefitsOrbit as SectionMeta['Renderer'],
    description: 'Benefits arranged around the product. Falls back to a list on mobile.',
    descriptionBn: 'পণ্যের চারপাশে উপকারিতা। মোবাইলে তালিকা আকারে।',
  },

  benefitsGrid: {
    type: 'benefitsGrid',
    label: 'Benefits (grid)',
    labelBn: 'উপকারিতা (গ্রিড)',
    group: 'content',
    icon: LayoutGrid,
    schema: sectionSchemas.benefitsGrid,
    defaults: sectionDefaults.benefitsGrid,
    Renderer: BenefitsGrid as SectionMeta['Renderer'],
    description: 'A simple 2, 3 or 4 column grid of benefits.',
    descriptionBn: '২, ৩ বা ৪ কলামে উপকারিতার সাধারণ গ্রিড।',
  },

  reviewsCarousel: {
    type: 'reviewsCarousel',
    label: 'Customer reviews',
    labelBn: 'ক্রেতাদের মতামত',
    group: 'social',
    icon: Star,
    schema: sectionSchemas.reviewsCarousel,
    defaults: sectionDefaults.reviewsCarousel,
    Renderer: ReviewsCarousel as SectionMeta['Renderer'],
    description: 'Swipeable review cards with star ratings.',
    descriptionBn: 'স্টার রেটিং সহ রিভিউ কার্ড, সোয়াইপ করা যায়।',
  },

  certifications: {
    type: 'certifications',
    label: 'Certifications',
    labelBn: 'সার্টিফিকেশন',
    group: 'social',
    icon: Award,
    schema: sectionSchemas.certifications,
    defaults: sectionDefaults.certifications,
    Renderer: Certifications as SectionMeta['Renderer'],
    description: 'Badges: BSTI, lab tested, halal, and so on.',
    descriptionBn: 'ব্যাজ — BSTI, ল্যাব টেস্টেড, হালাল ইত্যাদি।',
  },

  doctorsCarousel: {
    type: 'doctorsCarousel',
    label: 'Expert opinions',
    labelBn: 'বিশেষজ্ঞের মতামত',
    group: 'social',
    icon: Stethoscope,
    schema: sectionSchemas.doctorsCarousel,
    defaults: sectionDefaults.doctorsCarousel,
    Renderer: DoctorsCarousel as SectionMeta['Renderer'],
    description: 'Doctors or specialists endorsing the product.',
    descriptionBn: 'চিকিৎসক বা বিশেষজ্ঞদের মতামত।',
  },

  faq: {
    type: 'faq',
    label: 'FAQ',
    labelBn: 'সাধারণ প্রশ্ন',
    group: 'content',
    icon: HelpCircle,
    schema: sectionSchemas.faq,
    defaults: sectionDefaults.faq,
    Renderer: Faq as SectionMeta['Renderer'],
    description: 'An accordion answering the objections that stop orders.',
    descriptionBn: 'অ্যাকর্ডিয়ন — যে প্রশ্নগুলো অর্ডার আটকে দেয়।',
  },

  comparison: {
    type: 'comparison',
    label: 'Comparison',
    labelBn: 'তুলনা',
    group: 'content',
    icon: Columns2,
    schema: sectionSchemas.comparison,
    defaults: sectionDefaults.comparison,
    Renderer: Comparison as SectionMeta['Renderer'],
    description: 'Two paths, side by side, with and without the product.',
    descriptionBn: 'পাশাপাশি দুটি পথ — পণ্যটি ছাড়া ও সাথে।',
  },

  emotionalCost: {
    type: 'emotionalCost',
    label: 'Cost of waiting',
    labelBn: 'দেরির খরচ',
    group: 'content',
    icon: Coins,
    schema: sectionSchemas.emotionalCost,
    defaults: sectionDefaults.emotionalCost,
    Renderer: EmotionalCost as SectionMeta['Renderer'],
    description: 'Puts a number on doing nothing. Strong closer before pricing.',
    descriptionBn: 'কিছু না করার খরচ হিসেব করে দেখায়। দামের আগে কাজে দেয়।',
  },

  guarantee: {
    type: 'guarantee',
    label: 'Guarantee',
    labelBn: 'নিশ্চয়তা',
    group: 'content',
    icon: ShieldCheck,
    schema: sectionSchemas.guarantee,
    defaults: sectionDefaults.guarantee,
    Renderer: Guarantee as SectionMeta['Renderer'],
    description: 'Money-back promise, to remove the last hesitation.',
    descriptionBn: 'টাকা ফেরতের প্রতিশ্রুতি — শেষ দ্বিধাটুকু সরায়।',
  },

  pricingCard: {
    type: 'pricingCard',
    label: 'Price card',
    labelBn: 'দামের কার্ড',
    group: 'commerce',
    icon: Tag,
    schema: sectionSchemas.pricingCard,
    defaults: sectionDefaults.pricingCard,
    Renderer: PricingCard as SectionMeta['Renderer'],
    description: 'Shows the price from your product catalogue, never typed by hand.',
    descriptionBn: 'প্রোডাক্ট ক্যাটালগ থেকে দাম দেখায় — হাতে লিখতে হয় না।',
  },

  orderForm: {
    type: 'orderForm',
    label: 'Order form',
    labelBn: 'অর্ডার ফর্ম',
    group: 'commerce',
    icon: ShoppingCart,
    schema: sectionSchemas.orderForm,
    defaults: sectionDefaults.orderForm,
    Renderer: OrderForm as SectionMeta['Renderer'],
    singleton: true,
    description: 'Where the order is actually placed. Every CTA scrolls here.',
    descriptionBn: 'এখানেই অর্ডার হয়। সব বাটন এখানে নিয়ে আসে।',
  },

  countdown: {
    type: 'countdown',
    label: 'Countdown',
    labelBn: 'কাউন্টডাউন',
    group: 'content',
    icon: Timer,
    schema: sectionSchemas.countdown,
    defaults: sectionDefaults.countdown,
    Renderer: Countdown as SectionMeta['Renderer'],
    description: 'A deadline for the offer.',
    descriptionBn: 'অফারের সময়সীমা।',
  },

  logoCloud: {
    type: 'logoCloud',
    label: 'Logo strip',
    labelBn: 'লোগো সারি',
    group: 'social',
    icon: Building2,
    schema: sectionSchemas.logoCloud,
    defaults: sectionDefaults.logoCloud,
    Renderer: LogoCloud as SectionMeta['Renderer'],
    description: 'Partner, press or retailer logos.',
    descriptionBn: 'পার্টনার, প্রেস বা রিটেইলারের লোগো।',
  },

  videoEmbed: {
    type: 'videoEmbed',
    label: 'Video',
    labelBn: 'ভিডিও',
    group: 'content',
    icon: Play,
    schema: sectionSchemas.videoEmbed,
    defaults: sectionDefaults.videoEmbed,
    Renderer: VideoEmbed as SectionMeta['Renderer'],
    description: 'YouTube or Vimeo, loaded only when the visitor presses play.',
    descriptionBn: 'YouTube বা Vimeo — ক্লিক করলেই লোড হয়।',
  },

  imageText: {
    type: 'imageText',
    label: 'Image and text',
    labelBn: 'ছবি ও লেখা',
    group: 'content',
    icon: ImageIcon,
    schema: sectionSchemas.imageText,
    defaults: sectionDefaults.imageText,
    Renderer: ImageText as SectionMeta['Renderer'],
    description: 'A flexible two-column block for anything else.',
    descriptionBn: 'যেকোনো কিছুর জন্য দুই কলামের ব্লক।',
  },

  richText: {
    type: 'richText',
    label: 'Text block',
    labelBn: 'লেখার ব্লক',
    group: 'content',
    icon: Type,
    schema: sectionSchemas.richText,
    defaults: sectionDefaults.richText,
    Renderer: RichText as SectionMeta['Renderer'],
    description: 'Plain paragraphs, for policies or a longer story.',
    descriptionBn: 'সাধারণ প্যারাগ্রাফ — নীতিমালা বা বিস্তারিত গল্পের জন্য।',
  },

  footer: {
    type: 'footer',
    label: 'Footer',
    labelBn: 'ফুটার',
    group: 'chrome',
    icon: PanelBottom,
    schema: sectionSchemas.footer,
    defaults: sectionDefaults.footer,
    Renderer: Footer as SectionMeta['Renderer'],
    singleton: true,
    pinned: 'bottom',
    description: 'Contact details, links and social profiles.',
    descriptionBn: 'যোগাযোগের তথ্য, লিংক ও সোশ্যাল প্রোফাইল।',
  },

  stickyCta: {
    type: 'stickyCta',
    label: 'Sticky bar',
    labelBn: 'স্টিকি বার',
    group: 'chrome',
    icon: MousePointerClick,
    schema: sectionSchemas.stickyCta,
    defaults: sectionDefaults.stickyCta,
    Renderer: StickyCta as SectionMeta['Renderer'],
    singleton: true,
    pinned: 'floating',
    description: 'A bar pinned to the bottom once the visitor scrolls.',
    descriptionBn: 'স্ক্রল করলে নিচে আটকে থাকা একটি বার।',
  },

  floatingActions: {
    type: 'floatingActions',
    label: 'WhatsApp & call',
    labelBn: 'হোয়াটসঅ্যাপ ও কল',
    group: 'chrome',
    icon: PhoneCall,
    schema: sectionSchemas.floatingActions,
    defaults: sectionDefaults.floatingActions,
    Renderer: FloatingActions as SectionMeta['Renderer'],
    singleton: true,
    pinned: 'floating',
    description: 'Floating WhatsApp, call and back-to-top buttons.',
    descriptionBn: 'ভাসমান হোয়াটসঅ্যাপ, কল ও উপরে যাওয়ার বাটন।',
  },
};

export const SECTION_TYPE_LIST = Object.keys(SECTION_REGISTRY) as SectionType[];

export const getSectionMeta = (type: string): SectionMeta | undefined =>
  SECTION_REGISTRY[type as SectionType];

export const isKnownSectionType = (type: string): type is SectionType =>
  type in SECTION_REGISTRY;

/** Grouped for the "Add section" picker. */
export const SECTION_GROUPS = [
  { id: 'content', label: 'Content', labelBn: 'কনটেন্ট' },
  { id: 'social', label: 'Social proof', labelBn: 'সামাজিক প্রমাণ' },
  { id: 'commerce', label: 'Selling', labelBn: 'বিক্রয়' },
  { id: 'chrome', label: 'Page chrome', labelBn: 'পেজ ফ্রেম' },
] as const;
