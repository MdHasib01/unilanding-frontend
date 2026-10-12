import { TEMPLATE_ASSET } from '@/lib/brand';

/**
 * Default content per section type.
 *
 * This is the ONLY place default copy lives. The server seeds a page with an
 * empty `data: {}` per section, and every renderer and editor form merges
 * `{ ...meta.defaults(), ...section.data }` — so a tenant sees the finished
 * page immediately, can edit any of it, and adding a new field later needs no
 * data migration for existing pages.
 *
 * The sections the bd-dtc-v1 template uses carry the reference /milkready
 * page's copy and images verbatim, so a brand new landing page is that page
 * until the tenant changes it. Text marked **like this** renders in the
 * brand colour (see RichLine).
 */

type Dict = Record<string, unknown>;

const bn = (b: string, e?: string) => (e ? { bn: b, en: e } : { bn: b });
const img = (file: string) => ({ url: TEMPLATE_ASSET(file), publicId: '' });
const points = (...lines: string[]) => lines.map((t) => ({ text: bn(t) }));

export const sectionDefaults: Record<string, () => Dict> = {
  announcementBar: () => ({
    text: bn('40% Offer শেষ হতে বাকি'),
    showCountdown: true,
    countdownTo: '',
  }),

  hero: () => ({
    title: bn('ডেলিভারির পর বুকের দুধ না হওয়ার ভয়?'),
    titleHighlight: bn('প্রস্তুতি নিন আগেই।'),
    subtitle: bn('Delivery-এর আগের শেষ ৩ মাসের মধ্যে **১** ডোজ MilkReady—ডেলিভারি এর পরে বুকের দুধ নিশ্চিত করে'),
    ctaText: bn('MilkReady অর্ডার করতে ক্লিক করুন'),
    ctaTarget: 'order',
    showMessenger: true,
    messengerText: bn('মেসেজ করুন'),
    messengerUrl: 'https://www.facebook.com/milkimom?_rdr',
  }),

  imagine: () => ({
    title: bn('Delivery-এর পর বাচ্চাকে __Formula Milk__ না দিয়ে, যদি **নিজের বুকের দুধ** খাওয়াতে পারেন—কেমন হয়?'),
    image: img('before-vs-after.webp'),
    closingLine: bn('সেই **Happiness** পৃথিবীতে আর কোথাও নেই।'),
    ctaText: bn('হ্যাঁ, আমি Happy হতে চাই'),
    ctaTarget: 'order',
  }),

  benefitsOrbit: () => ({
    title: bn('MilkReady এর উপকারিতা'),
    centerImage: {},
    items: [
      { accent: bn('ব্রেস্টফিডিং প্রিপারেশন'), rest: bn('নিশ্চিত করে') },
      { accent: bn('ম্যাটারনাল নিউট্রিশন সাপোর্ট'), rest: bn('দেয়') },
      { accent: bn('ব্রেস্ট টিস্যু সাপোর্ট'), rest: bn('দেয়') },
      { accent: bn('মিল্ক ডাক্ট প্রিপারেশন'), rest: bn('প্রস্তুত করে') },
      { accent: bn('পোস্ট-ডেলিভারি ফিডিং রেডিনেস'), rest: bn('নিশ্চিত করে') },
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
    title: bn('আপনার মতো অন্য মায়েরাও **Delivery-এর আগেই** প্রস্তুতি নিয়েছিলেন'),
    subtitle: bn('আর আজ তারা তাদের Experience Share করছেন।'),
    autoplayMs: 5000,
    verifiedLabel: bn('Verified Purchase'),
    items: [
      {
        name: 'তানিয়া সুলতানা',
        location: bn('মিরপুর, ঢাকা'),
        rating: 5,
        text: bn('আলহামদুলিল্লাহ! ডেলিভারির ৩ সপ্তাহ আগে থেকেই MilkReady খাওয়া শুরু করেছিলাম। ডেলিভারির প্রথম দিন থেকেই পর্যাপ্ত বুকের দুধ হয়েছে, কোনো ফর্মুলা দুধের প্রয়োজন হয়নি!'),
        image: img('reviewer-1.webp'),
        timeAgo: bn('২ দিন আগে'),
        verified: true,
      },
      {
        name: 'নুসরাত জাহান',
        location: bn('উত্তরা, ঢাকা'),
        rating: 5,
        text: bn('প্রথম বাচ্চার সময় দুধ না হওয়ার কারণে অনেক কষ্ট পেতে হয়েছিল। তাই এবার ২য় প্রেগন্যান্সির ৮ম মাসে MilkReady নিই। ডেলিভারির পর এবার আর কোনো টেনশন করতে হয়নি।'),
        image: img('reviewer-2.webp'),
        timeAgo: bn('৫ দিন আগে'),
        verified: true,
      },
      {
        name: 'শারমিন আক্তার',
        location: bn('ধানমন্ডি, ঢাকা'),
        rating: 5,
        text: bn('আমার গাইনি ডাক্তারের পরামর্শে MilkReady ট্রাই করি। ডেলিভারির পর থেকেই দুধের ফ্লো খুব ভালো। টেস্টটাও খুব দারুণ!'),
        image: img('reviewer-3.webp'),
        timeAgo: bn('১ সপ্তাহ আগে'),
        verified: true,
      },
      {
        name: 'ফারহানা রহমান',
        location: bn('চট্টগ্রাম'),
        rating: 5,
        text: bn('অসাধারণ প্রোডাক্ট! নতুন মায়েদের ডেলিভারির আগে এই প্রস্তুতিটা নেওয়া কতটা জরুরি তা ব্যবহার না করলে বুঝতে পারতাম না। অনেক ধন্যবাদ MilkReady কে।'),
        image: img('reviewer-4.webp'),
        timeAgo: bn('২ সপ্তাহ আগে'),
        verified: true,
      },
    ],
    ctaText: bn('হ্যাঁ, আমিও Delivery-এর আগেই Ready হতে চাই'),
    ctaTarget: 'order',
  }),

  certifications: () => ({
    title: bn('বিশ্বাস রাখার কারণসমূহ'),
    subtitle: bn('দেশের স্বনামধন্য চিকিৎসকদের সুপারিশকৃত ও ল্যাব-সার্টিফাইড সমাধান'),
    items: [
      { label: bn('ISO Certified'), icon: 'award', image: {} },
      { label: bn('Halal Certified'), icon: 'badgeCheck', image: {} },
      { label: bn('100% Vegan'), icon: 'sprout', image: {} },
      { label: bn('GMP Certified'), icon: 'shieldCheck', image: {} },
      { label: bn('Lab Tested'), icon: 'flask', image: {} },
      { label: bn('100% Natural'), icon: 'leaf', image: {} },
    ],
    doctors: [
      {
        name: 'ডা. মোঃ সাদ্দাম',
        degree: 'এমবিবিএস, এফসিপিএস',
        subtitle: bn(''),
        description: bn('“প্রসবের পর বুকের দুধের স্বাভাবিক প্রবাহ বজায় রাখতে প্রসবপূর্ব পুষ্টি ও ব্রেস্ট টিস্যু প্রিপারেশন অত্যন্ত ফলপ্রসূ। MilkReady এই প্রক্রিয়ায় একটি চমৎকার বৈজ্ঞানিক সমাধান।”'),
        image: img('doctor-saddam.webp'),
      },
      {
        name: 'ডা. মোঃ নাজমুল',
        degree: 'এমবিবিএস, ডিজিইউ',
        subtitle: bn(''),
        description: bn('“MilkReady-তে থাকা প্রাকৃতিক উপাদান ও পুষ্টি উপাদানগুলো গর্ভাবস্থার শেষ ৩ মাসে মায়ের শরীরের ল্যাকটোজেনিক হরমোনের প্রাকৃতিক প্রস্তুতিতে অত্যন্ত কার্যকরী সহায়তা প্রদান করে।”'),
        image: img('doctor-nazmul.webp'),
      },
      {
        name: 'ডা. হাদিসুর রহমান',
        degree: 'এমবিবিএস',
        subtitle: bn(''),
        description: bn('“নবজাতকের জন্য প্রথম ৬ মাস মায়ের বুকের দুধের কোনো বিকল্প নেই। প্রসবের পর থেকেই পর্যাপ্ত বুকের দুধ নিশ্চিত করতে MilkReady একটি নিরাপদ ও নির্ভরযোগ্য প্রস্তুতি।”'),
        image: img('doctor-hadis.webp'),
      },
      {
        name: 'ডা. আব্দুল ওয়াহিদ',
        degree: 'এমবিবিএস, এফসিপিএস',
        subtitle: bn(''),
        description: bn('“ডেলিভারির আগে থেকেই ব্রেস্ট ডাক্ট সক্রিয় ও ল্যাকটেশন প্রস্তুতি সম্পন্ন করতে MilkReady একটি চিকিৎসাবিজ্ঞান সমর্থিত ও সম্পূর্ণ নির্ভরযোগ্য প্রাকৃতিক সমাধান।”'),
        image: img('doctor-wahid.webp'),
      },
    ],
    doctorBadge: bn('চিকিৎসকের সুপারিশকৃত'),
    doctorTag: 'MilkReady™',
    autoplayMs: 5000,
    ctaText: bn('হ্যাঁ, আমিও MilkReady নিতে চাই'),
    ctaTarget: 'order',
  }),

  doctorsCarousel: () => ({
    title: bn('বিশেষজ্ঞদের মতামত', 'What the experts say'),
    items: [
      {
        name: 'ডা. মোঃ সাদ্দাম',
        degree: 'এমবিবিএস, এফসিপিএস',
        subtitle: bn('চিকিৎসকের তত্ত্বাবধানে তৈরি'),
        description: bn('প্রসবের পর বুকের দুধের স্বাভাবিক প্রবাহ বজায় রাখতে প্রসবপূর্ব পুষ্টি ও ব্রেস্ট টিস্যু প্রিপারেশন অত্যন্ত ফলপ্রসূ।'),
        image: img('doctor-saddam.webp'),
      },
    ],
  }),

  faq: () => ({
    title: bn('**MilkReady** নিয়ে আপনার প্রশ্নের উত্তর।'),
    defaultOpen: 1,
    initialVisible: 4,
    showMoreText: bn('আরও প্রশ্ন দেখুন'),
    showLessText: bn('কমিয়ে দেখুন'),
    items: [
      { q: bn('MilkReady কী?'), a: bn('MilkReady হলো Delivery-এর আগের শেষ ৩ মাসে Breastfeeding Preparation নেওয়ার জন্য তৈরি একটি বিশেষায়িত Prenatal Support Supplement।') },
      { q: bn('কখন থেকে MilkReady খাওয়া শুরু করতে হবে?'), a: bn('ডেলিভারির আগের শেষ ৩ মাসের মধ্যে (যেমন: প্রেগন্যান্সির ৭ম, ৮ম বা ৯ম মাস) MilkReady ব্যবহার শুরু করা সবচেয়ে উত্তম।') },
      { q: bn('MilkReady কীভাবে কাজ করে?'), a: bn('এটি গর্ভবতী মায়ের শরীরে ল্যাকটোজেনিক পুষ্টির যোগান দেয়, ব্রেস্ট টিস্যুকে উদ্দীপিত করে এবং মিল্ক ডাক্টকে সক্রিয় করে তোলে—যাতে প্রসবের সাথে সাথেই প্রাকৃতিক দুধের সরবরাহ স্বাভাবিকভাবে শুরু হতে পারে।') },
      { q: bn('কীভাবে MilkReady খেতে হবে?'), a: bn('প্রতিদিন ১ চামচ MilkReady পাউডার ১ গ্লাস কুসুম গরম দুধ অথবা হালকা গরম পানির সাথে ভালোভাবে মিশিয়ে সহজে পান করা যায়।') },
      { q: bn('দিনে কতবার খেতে হবে?'), a: bn('দিনে ১ থেকে ২ বার নিয়মিত সেবন করুন। খাবারের পরে বা চিকিৎসকের পরামর্শ অনুযায়ী খাওয়া যেতে পারে।') },
      { q: bn('Pregnancy-এর সময় খাওয়া নিরাপদ?'), a: bn('হ্যাঁ, এটি সম্পূর্ণ নিরাপদ ও গর্ভাবস্থার শেষ ৩ মাসের জন্য বিশেষভাবে প্রস্তুতকৃত ১০০% ফুড-গ্রেড প্রাকৃতিক উপাদান সমৃদ্ধ।') },
      { q: bn('MilkReady-এর উপাদান কী কী?'), a: bn('অ্যাভেনা স্যাটিভা, বোভাইন WPC, ডেট পাউডার, কোকোনাট, সানফ্লাওয়ার লেসিথিন এবং ন্যাচারাল ফ্লেভার।') },
      { q: bn('কোনো Side Effect বা পার্শ্বপ্রতিক্রিয়া আছে?'), a: bn('না, MilkReady সম্পূর্ণ প্রাকৃতিক ও নিরাপদ উপাদানে তৈরি। এতে কোনো ক্ষতিকারক রাসায়নিক বা আর্টিফিশিয়াল প্রিজারভেটিভ নেই।') },
      { q: bn('Result না পেলে কী সুবিধা রয়েছে?'), a: bn('MilkReady-তে রয়েছে শতভাগ ৩ দিনের মানি ব্যাক গ্যারান্টি পলিসি। ব্যবহার করে কোনো পরিবর্তন অনুভব না করলে সম্পূর্ণ টাকা রিফান্ড পেয়ে যাবেন (এটা রিফান্ড পলিসি অনুযায়ী)।') },
    ],
    ctaText: bn('হ্যাঁ, আমিও প্রস্তুতি নিতে চাই'),
    ctaTarget: 'order',
  }),

  comparison: () => ({
    eyebrow: bn('আপনার সামনে এখন'),
    circledText: bn('২টা পথ'),
    title: bn('খোলা আছে'),
    subtitle: bn('আপনি কোনটা বেছে নেবেন?'),
    leftLabel: bn('আগে থেকে Preparation না নিলে'),
    leftTag: bn('ঝুঁকিপূর্ণ'),
    leftItems: points(
      'Delivery-এর পর বুকের দুধ নিয়ে অনিশ্চয়তা',
      'Formula Milk কেনার বিশাল খরচ',
      'Formula Milk-এর অপূরণীয় ক্ষতি',
      'বাচ্চার ঘন ঘন অসুস্থতা ও অপুষ্টি',
      'বাচ্চার ইমিউনিটি ও ব্রেইন গ্রোথে সারাজীবনের ঘাটতি'
    ),
    rightBadge: bn('সেরা সিদ্ধান্ত'),
    rightLabel: bn('MilkReady নিয়ে আগেই Preparation নিন'),
    rightItems: points(
      'Delivery-এর পর বুকের দুধ নিয়ে নিশ্চিন্ত থাকুন',
      'Formula Milk কেনার কোনো দরকার নেই',
      'বাচ্চা জন্ম থেকেই পর্যাপ্ত পুষ্টিকর বুকের দুধ পাবে',
      'বাচ্চার রোগ প্রতিরোধ ক্ষমতা শক্তিশালী থাকবে',
      'বাচ্চার স্বাভাবিক বৃদ্ধি ও ব্রেইন ডেভেলপমেন্ট নিশ্চিত হবে'
    ),
    closingLine: bn('Preparation শুরু হোক Baby আসার আগেই।'),
    closingHighlight: bn('সিদ্ধান্তটা আপনার।'),
    closingQuestion: bn('আপনি কোন Feeding Journey-টা চান?'),
    ctaText: bn('হ্যাঁ, আমি Delivery-এর আগেই প্রস্তুত হতে চাই'),
    ctaTarget: 'order',
  }),

  emotionalCost: () => ({
    image: img('pain-vs-money.webp'),
    title: bn('বুকের দুধ না হলে, সেই ক্ষতি !!টাকা দিয়ে মাপা যায় না!!।'),
    highlight: bn('Formula Milk-এর পেছনে খরচ হতে পারে **৮–১০ লাখ টাকা**।'),
    body: bn('বাচ্চার বিভিন্ন রোগব্যাধি, ঘন ঘন Doctor ভিজিট, Test আর Treatment-এর পেছনে চলে যেতে পারে আরও কয়েক লাখ টাকা।'),
    aside: bn('বারবার বাচ্চার অসুস্থতা, আর দিন দিন দুর্বল হয়ে যাওয়া—'),
    conclusion: bn('এত কষ্টের পরেও একটা অসুস্থ আর অপুষ্ট বাচ্চার যন্ত্রণা কোনো মা-বাবার পক্ষেই মেনে নেওয়া সম্ভব নয়।'),
    emoji: '😔',
  }),

  guarantee: () => ({
    title: bn('**100%** Satisfaction Guarantee'),
    subtitle: bn('আমরা জানি বাচ্চা জন্মের শুরু থেকেই বুকের দুধ কতটা গুরুত্বপূর্ণ'),
    cardTitle: bn('৩ দিনের Money Back Guarantee'),
    text: bn('বাচ্চা জন্মের পরে ৩ দিনের বুকের দুধ না পেলে আমাদেরকে জানালে আমরা সম্পূর্ণ টাকাটাই ফেরত দিবো। এমনকি আপনাকে একটা প্রশ্নও করা হবে না।'),
    badgeImage: {},
  }),

  pricingCard: () => ({
    title: bn('বুকের দুধ সম্পর্কে নিশ্চিত হয়ে নিন **Delivery-এর আগেই**'),
    productId: '',
    productTitle: bn('MilkReady™ Prenatal Dose'),
    image: {},
    ribbonText: '',
    savingsText: bn('আপনার সাশ্রয় {amount} ({percent}% ছাড়)'),
    showTimer: true,
    timerLabel: bn('অফার শেষ হতে বাকি:'),
    ctaText: bn('এখনই MilkReady অর্ডার করুন'),
    ctaTarget: 'order',
  }),

  orderForm: () => ({
    headline: bn('MilkReady অর্ডার করুন'),
    subheadline: bn('Delivery-এর আগেই Breastfeeding Preparation শুরু করুন।'),
    productId: '',
    deliveryTitle: bn('ডেলিভারি তথ্য'),
    variantLabel: bn('পছন্দসই ফ্লেভার সিলেক্ট করুন *'),
    nameLabel: bn('পূর্ণ নাম'),
    namePlaceholder: bn('আপনার নাম লিখুন'),
    phoneLabel: bn('মোবাইল নম্বর *'),
    addressLabel: bn('বাসার পূর্ণ ঠিকানা (এলাকা, থানা, জেলা সহ লিখুন)'),
    addressPlaceholder: bn('বাসা/হোল্ডিং নং, রোড, এলাকা, থানা, জেলা'),
    showDistrict: false,
    showThana: false,
    showAltPhone: false,
    showEmail: false,
    showNote: false,
    summaryTitle: bn('Order Summary'),
    deliveryLabel: bn('Delivery Charge'),
    freeText: bn('ফ্রি (Free)'),
    savingText: bn('আপনার Saving:'),
    totalLabel: bn('সর্বমোট'),
    paymentTitle: bn('PAYMENT METHOD'),
    codNote: bn('সাপ্লিমেন্ট হাতে পেয়ে মূল্য পরিশোধ করবো।'),
    bkashQr: img('bkash-qr.webp'),
    submitText: bn('অর্ডার Confirm করুন'),
    trustBadges: points('✓ Secure Order', '✓ Cash on Delivery'),
    showSocialProof: true,
    socialCount: '14,022+',
    socialText: bn('Mother ইতোমধ্যে MilkReady অর্ডার করেছেন'),
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
    text: bn('MilkReady - ডেলিভারি পূর্ববর্তী প্রাকৃতিক প্রস্তুতি'),
    contactTitle: bn('যোগাযোগ'),
    phone: '01517-102603',
    email: 'milkimominfo@gmail.com',
    address: bn('202-J, Road-6, Mohammadiya Housing society, Mohammadpur, Dhaka.'),
    links: [],
    socials: [
      { platform: 'facebook', href: 'https://www.facebook.com/milkimom' },
      { platform: 'instagram', href: '' },
    ],
    rightsText: bn('সর্বস্বত্ব সংরক্ষিত।'),
    showPoweredBy: false,
  }),

  stickyCta: () => ({
    productId: '',
    showPrice: true,
    discountText: '',
    showCountdown: true,
    ctaText: bn('অর্ডার করুন'),
    target: 'order',
    showAfterPx: 150,
  }),

  floatingActions: () => ({
    whatsappNumber: '01517-102603',
    whatsappMessage: bn('হ্যালো MilkReady, আমি বিস্তারিত জানতে চাই।'),
    callNumber: '',
    backToTop: true,
  }),
};

export const getDefaults = (type: string): Dict => sectionDefaults[type]?.() ?? {};
