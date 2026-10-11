/**
 * Default content per section type.
 *
 * This is the ONLY place default copy lives. The server seeds a page with an
 * empty `data: {}` per section, and every renderer and editor form merges
 * `{ ...meta.defaults(), ...section.data }` — so a tenant sees sensible Bangla
 * copy immediately, can edit any of it, and adding a new field later needs no
 * data migration for existing pages.
 *
 * The copy is modelled on the reference landing page's structure (which
 * converts) but is generic: no product names, no prices, no phone numbers.
 */

type Dict = Record<string, unknown>;

const bn = (b: string, e?: string) => (e ? { bn: b, en: e } : { bn: b });

export const sectionDefaults: Record<string, () => Dict> = {
  announcementBar: () => ({
    text: bn('সীমিত সময়ের বিশেষ অফার চলছে', 'Limited-time offer running now'),
    countdownTo: '',
    dismissible: true,
  }),

  hero: () => ({
    badge: bn('১০০% প্রাকৃতিক উপাদান', '100% natural ingredients'),
    title: bn('আপনার সমস্যার সমাধান এখন হাতের নাগালে', 'The solution you have been looking for'),
    titleHighlight: '',
    subtitle: bn(
      'বিশেষজ্ঞদের তত্ত্বাবধানে তৈরি, হাজারো মানুষের আস্থা অর্জন করেছে।',
      'Built with expert guidance and trusted by thousands.'
    ),
    ctaText: bn('এখনই অর্ডার করুন', 'Order now'),
    ctaTarget: 'order',
    image: {},
    imageMobile: {},
    trustBadges: [
      { label: bn('ক্যাশ অন ডেলিভারি', 'Cash on delivery') },
      { label: bn('সারা দেশে ডেলিভারি', 'Nationwide delivery') },
      { label: bn('১০০% অরিজিনাল', '100% original') },
    ],
  }),

  imagine: () => ({
    badge: bn('একবার ভাবুন', 'Imagine'),
    title: bn('আগে আর পরে — পার্থক্যটা নিজেই দেখুন', 'Before and after — see the difference'),
    beforeTitle: bn('এখন যেভাবে চলছে', 'How it is now'),
    beforeItems: [
      { text: bn('প্রতিদিনের অনিশ্চয়তা আর দুশ্চিন্তা', 'Daily uncertainty and worry') },
      { text: bn('বারবার চেষ্টা করেও ফল পাওয়া যাচ্ছে না', 'Trying again and again with no result') },
      { text: bn('খরচ বাড়ছে, সমাধান মিলছে না', 'Costs rising, still no solution') },
    ],
    afterTitle: bn('যেভাবে হতে পারে', 'How it could be'),
    afterItems: [
      { text: bn('নিশ্চিন্ত, স্বস্তির প্রতিদিন', 'Calm, settled days') },
      { text: bn('অল্প সময়েই স্পষ্ট পরিবর্তন', 'A clear change in a short time') },
      { text: bn('একবারের খরচে দীর্ঘদিনের সমাধান', 'One cost, a lasting solution') },
    ],
    image: {},
  }),

  benefitsOrbit: () => ({
    badge: bn('কী কাজ করে?', 'How it works'),
    title: bn('একটি সমাধানে অনেকগুলো উপকারিতা', 'Several benefits in one solution'),
    subtitle: bn('', ''),
    centerImage: {},
    items: [
      { title: bn('দ্রুত ফলাফল', 'Fast results'), body: bn('নিয়ম মেনে ব্যবহারে অল্প সময়েই পরিবর্তন বোঝা যায়।', 'Used as directed, the change shows quickly.'), icon: 'Zap' },
      { title: bn('প্রাকৃতিক উপাদান', 'Natural ingredients'), body: bn('কোনো ক্ষতিকর কেমিক্যাল নেই।', 'No harmful chemicals.'), icon: 'Leaf' },
      { title: bn('বিশেষজ্ঞ অনুমোদিত', 'Expert approved'), body: bn('চিকিৎসকদের পরামর্শে তৈরি ফর্মুলা।', 'Formulated with clinical guidance.'), icon: 'ShieldCheck' },
      { title: bn('সহজ ব্যবহার', 'Simple to use'), body: bn('প্রতিদিনের রুটিনে সহজেই যুক্ত হয়।', 'Fits into your daily routine.'), icon: 'Check' },
      { title: bn('সাশ্রয়ী', 'Good value'), body: bn('দীর্ঘমেয়াদে অনেক খরচ বাঁচায়।', 'Saves a great deal over time.'), icon: 'Wallet' },
    ],
  }),

  benefitsGrid: () => ({
    title: bn('কেন এটি বেছে নেবেন', 'Why choose this'),
    subtitle: bn('', ''),
    columns: '3',
    items: [
      { title: bn('নির্ভরযোগ্য', 'Dependable'), body: bn('হাজারো সন্তুষ্ট ক্রেতা।', 'Thousands of happy customers.'), icon: 'Heart' },
      { title: bn('নিরাপদ', 'Safe'), body: bn('ল্যাব টেস্টেড ও সার্টিফাইড।', 'Lab tested and certified.'), icon: 'ShieldCheck' },
      { title: bn('সহজ ডেলিভারি', 'Easy delivery'), body: bn('সারা দেশে ক্যাশ অন ডেলিভারি।', 'Cash on delivery nationwide.'), icon: 'Truck' },
    ],
  }),

  reviewsCarousel: () => ({
    title: bn('ক্রেতারা যা বলছেন', 'What customers say'),
    autoplayMs: 5000,
    items: [
      { name: 'Rahima Akter', location: bn('ঢাকা', 'Dhaka'), rating: 5, text: bn('সত্যিই কাজ করেছে। পরিবারের সবাই খুশি।', 'It genuinely worked. The whole family is pleased.'), verified: true, image: {} },
      { name: 'Nasrin Sultana', location: bn('চট্টগ্রাম', 'Chattogram'), rating: 5, text: bn('ডেলিভারি দ্রুত পেয়েছি, প্রোডাক্ট অরিজিনাল।', 'Delivery was quick and the product is genuine.'), verified: true, image: {} },
      { name: 'Shireen Begum', location: bn('সিলেট', 'Sylhet'), rating: 5, text: bn('অল্প দিনেই পরিবর্তন বুঝতে পেরেছি।', 'I noticed the difference within days.'), verified: true, image: {} },
    ],
  }),

  certifications: () => ({
    title: bn('সার্টিফিকেশন ও অনুমোদন', 'Certifications and approvals'),
    items: [
      { label: bn('BSTI অনুমোদিত', 'BSTI approved'), image: {}, note: bn('', '') },
      { label: bn('ল্যাব টেস্টেড', 'Lab tested'), image: {}, note: bn('', '') },
      { label: bn('১০০% হালাল', '100% halal'), image: {}, note: bn('', '') },
    ],
  }),

  doctorsCarousel: () => ({
    title: bn('বিশেষজ্ঞদের মতামত', 'What the experts say'),
    items: [
      {
        name: bn('ডা. নাম লিখুন', 'Dr. Name here'),
        degree: 'MBBS, FCPS',
        subtitle: bn('চিকিৎসকের তত্ত্বাবধানে তৈরি', 'Developed under clinical supervision'),
        description: bn(
          'এই পণ্যটি অভিজ্ঞ চিকিৎসকদের পরামর্শে, আধুনিক গবেষণার সমন্বয়ে তৈরি। প্রতিটি ব্যাচ ল্যাব টেস্টেড।',
          'This product was developed with experienced clinicians and modern research. Every batch is lab tested.'
        ),
        image: {},
      },
    ],
  }),

  faq: () => ({
    title: bn('সাধারণ প্রশ্ন', 'Frequently asked questions'),
    defaultOpen: 0,
    items: [
      { q: bn('ডেলিভারি কত দিনে পাবো?', 'How long does delivery take?'), a: bn('ঢাকার ভেতরে ১-২ দিন, ঢাকার বাইরে ২-৪ দিন।', 'One to two days inside Dhaka, two to four days elsewhere.') },
      { q: bn('পেমেন্ট কীভাবে করবো?', 'How do I pay?'), a: bn('ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দেবেন।', 'Cash on delivery — pay when the parcel arrives.') },
      { q: bn('কোনো পার্শ্বপ্রতিক্রিয়া আছে কি?', 'Are there any side effects?'), a: bn('সম্পূর্ণ প্রাকৃতিক উপাদানে তৈরি, নিয়ম মেনে ব্যবহারে কোনো সমস্যা নেই।', 'It is made from natural ingredients and is safe when used as directed.') },
      { q: bn('অর্ডার বাতিল করা যাবে?', 'Can I cancel my order?'), a: bn('ডেলিভারির আগে যেকোনো সময় ফোন করে বাতিল করতে পারবেন।', 'Yes — call us any time before delivery.') },
    ],
  }),

  comparison: () => ({
    title: bn('দুটি পথ — আপনি কোনটি বেছে নেবেন?', 'Two paths — which will you choose?'),
    leftLabel: bn('এটি ছাড়া', 'Without it'),
    leftItems: [
      { text: bn('সমস্যা থেকে যাচ্ছে', 'The problem persists') },
      { text: bn('প্রতি মাসে বাড়তি খরচ', 'Extra cost every month') },
      { text: bn('অনিশ্চয়তা ও দুশ্চিন্তা', 'Uncertainty and worry') },
    ],
    rightLabel: bn('এটির সাথে', 'With it'),
    rightItems: [
      { text: bn('সমস্যার কার্যকর সমাধান', 'A solution that works') },
      { text: bn('একবারের খরচ', 'A one-time cost') },
      { text: bn('নিশ্চিন্ত মন', 'Peace of mind') },
    ],
  }),

  emotionalCost: () => ({
    title: bn('দেরি করলে খরচ কেমন দাঁড়ায়?', 'What does waiting actually cost?'),
    body: bn(
      'সমস্যাটি ফেলে রাখলে খরচ শুধু বাড়তেই থাকে — টাকায়, সময়ে আর মানসিক চাপে।',
      'Leaving it alone only makes the cost grow — in money, in time, and in stress.'
    ),
    costRows: [
      { label: bn('প্রতি মাসের খরচ', 'Monthly cost'), amount: '৫,০০০' },
      { label: bn('এক বছরে', 'Over a year'), amount: '৬০,০০০' },
    ],
    conclusion: bn('আজ একটি সিদ্ধান্ত অনেক খরচ বাঁচাতে পারে।', 'One decision today can save a great deal.'),
    image: {},
  }),

  guarantee: () => ({
    title: bn('শতভাগ নিশ্চয়তা', 'A full guarantee'),
    text: bn(
      'পণ্য নিয়ে সন্তুষ্ট না হলে নির্দিষ্ট সময়ের মধ্যে জানালে টাকা ফেরত পাবেন।',
      'If you are not satisfied, tell us within the guarantee period and we will refund you.'
    ),
    days: 30,
    badgeImage: {},
  }),

  pricingCard: () => ({
    title: bn('আজকের বিশেষ মূল্য', "Today's price"),
    productId: '',
    showVariants: true,
    savingsLabel: bn('আপনি সঞ্চয় করছেন', 'You save'),
    ctaText: bn('অর্ডার করতে চাই', 'I want to order'),
    bullets: [
      { text: bn('ডেলিভারি চার্জ সহ', 'Delivery included') },
      { text: bn('ক্যাশ অন ডেলিভারি', 'Cash on delivery') },
    ],
  }),

  orderForm: () => ({
    headline: bn('অর্ডার করতে ফর্মটি পূরণ করুন', 'Fill in the form to order'),
    subheadline: bn('আমরা দ্রুত ফোন করে অর্ডার নিশ্চিত করবো।', 'We will call you shortly to confirm.'),
    productId: '',
    showDistrict: true,
    showThana: true,
    showAltPhone: false,
    showEmail: false,
    showNote: false,
    submitText: bn('অর্ডার কনফার্ম করুন', 'Confirm order'),
    successNote: bn('', ''),
  }),

  countdown: () => ({
    title: bn('অফার শেষ হচ্ছে', 'Offer ends in'),
    endsAt: '',
    expiredText: bn('অফারটি শেষ হয়ে গেছে', 'This offer has ended'),
  }),

  logoCloud: () => ({
    title: bn('যাঁরা আমাদের সাথে আছেন', 'Trusted by'),
    items: [],
  }),

  videoEmbed: () => ({
    title: bn('ভিডিওতে দেখুন', 'Watch the video'),
    provider: 'youtube',
    videoId: '',
    poster: {},
  }),

  imageText: () => ({
    title: bn('আমাদের সম্পর্কে', 'About us'),
    body: bn('এখানে আপনার ব্যবসার গল্প লিখুন।', 'Tell your story here.'),
    image: {},
    imageSide: 'left',
    ctaText: bn('', ''),
    ctaTarget: 'order',
  }),

  richText: () => ({
    title: bn('', ''),
    body: bn('', ''),
    align: 'left',
  }),

  footer: () => ({
    text: bn('', ''),
    phone: '',
    email: '',
    address: bn('', ''),
    links: [],
    socials: [],
    showPoweredBy: true,
  }),

  stickyCta: () => ({
    text: bn('সীমিত সময়ের অফার', 'Limited-time offer'),
    ctaText: bn('অর্ডার করুন', 'Order now'),
    target: 'order',
    showAfterPx: 600,
    mobileOnly: false,
  }),

  floatingActions: () => ({
    whatsappNumber: '',
    whatsappMessage: bn('আমি অর্ডার করতে চাই', 'I would like to order'),
    callNumber: '',
    backToTop: true,
  }),
};

export const getDefaults = (type: string): Dict => sectionDefaults[type]?.() ?? {};
