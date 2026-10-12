'use client';

/* eslint-disable @next/next/no-img-element -- payment QR and logos may be tenant uploads from any host */

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, ShoppingCart, Truck } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { formatMoney } from '@/lib/format';
import { captureAttribution, readMetaCookies } from '@/lib/attribution';
import { BD_DISTRICTS } from '@/lib/bd-locations';
import { TEMPLATE_ASSET } from '@/lib/brand';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/shared/reveal';
import { GridPattern } from '@/components/landing/grid-pattern';
import type { SectionRendererProps } from '../types';

type Data = {
  headline?: unknown;
  subheadline?: unknown;
  productId?: string;
  deliveryTitle?: unknown;
  variantLabel?: unknown;
  nameLabel?: unknown;
  namePlaceholder?: unknown;
  phoneLabel?: unknown;
  addressLabel?: unknown;
  addressPlaceholder?: unknown;
  showDistrict?: boolean;
  showThana?: boolean;
  showAltPhone?: boolean;
  showEmail?: boolean;
  showNote?: boolean;
  summaryTitle?: unknown;
  deliveryLabel?: unknown;
  freeText?: unknown;
  savingText?: unknown;
  totalLabel?: unknown;
  paymentTitle?: unknown;
  codNote?: unknown;
  bkashQr?: { url?: string };
  submitText?: unknown;
  trustBadges?: { text?: unknown }[];
  showSocialProof?: boolean;
  socialCount?: string;
  socialText?: unknown;
};

/** Bangladesh mobile numbers. Same rule the server applies. */
const BD_PHONE = /^01[3-9]\d{8}$/;

const L = {
  bn: {
    altPhone: 'বিকল্প নম্বর', email: 'ইমেইল', district: 'জেলা', thana: 'থানা / এলাকা',
    note: 'অতিরিক্ত নোট', selectDistrict: 'জেলা নির্বাচন করুন', selectThana: 'থানা নির্বাচন করুন',
    nameReq: 'আপনার নাম লিখুন', phoneReq: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন',
    addressReq: 'আপনার ঠিকানা লিখুন', districtReq: 'জেলা নির্বাচন করুন', trxReq: 'ট্রানজেকশন আইডি দিন',
    submitting: 'অর্ডার প্রসেস হচ্ছে...', failed: 'অর্ডারটি নেওয়া যায়নি। আবার চেষ্টা করুন বা ফোন করুন।',
    previewNote: 'এটি প্রিভিউ — এখান থেকে অর্ডার যাবে না।', noProduct: 'কোনো প্রোডাক্ট যোগ করা হয়নি।',
    sendMoneyNumber: 'পার্সোনাল নম্বর (Send Money)', howTo: 'পেমেন্ট করার নির্দেশাবলী:',
    step1: 'আপনার মোবাইল অ্যাপ অথবা', step1b: 'ডায়াল করুন।', step2: 'অপশনটি সিলেক্ট করুন।',
    step3: 'প্রাপক নম্বর লিখুন:', step4: 'মোট পরিমাণ:', step4b: 'টাকা দিয়ে পিন দিন।',
    step5: 'সেন্ড মানি সফল হওয়ার পর প্রাপ্ত', step5b: 'নিচের ইনপুট বক্সে লিখুন।',
    trxLabel: 'ট্রানজেকশন আইডি (TrxID)', trxExample: 'উদাহরণ: 9AB12CD34E', trxPlaceholder: 'TrxID এখানে লিখুন (যেমন: 9AB12CD34E)',
  },
  en: {
    altPhone: 'Alternate number', email: 'Email', district: 'District', thana: 'Area',
    note: 'Order note', selectDistrict: 'Select a district', selectThana: 'Select an area',
    nameReq: 'Please enter your name', phoneReq: 'Enter a valid 11-digit mobile number',
    addressReq: 'Please enter your address', districtReq: 'Please choose a district', trxReq: 'Enter the transaction ID',
    submitting: 'Placing your order...', failed: 'We could not place your order. Please try again or call us.',
    previewNote: 'This is a preview — orders are not submitted from here.', noProduct: 'No product has been added yet.',
    sendMoneyNumber: 'Personal number (Send Money)', howTo: 'How to pay:',
    step1: 'Open your mobile app or dial', step1b: '.', step2: 'Choose', step3: 'Enter the number:',
    step4: 'Amount:', step4b: 'then confirm with your PIN.', step5: 'Enter the', step5b: 'you receive below.',
    trxLabel: 'Transaction ID (TrxID)', trxExample: 'e.g. 9AB12CD34E', trxPlaceholder: 'Your TrxID (e.g. 9AB12CD34E)',
  },
} as const;

type Method = {
  value: string;
  label: string;
  logo?: string;
  dial?: string;
  number?: string;
  instructions?: string;
};

export function OrderForm({ data, ctx }: SectionRendererProps<Data>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const s = L[ctx.locale] ?? L.bn;
  const router = useRouter();
  const money = (n: number) => formatMoney(n, ctx.currency, ctx.locale);

  // ── what can be ordered ──
  // One configured product: its variants are the choice (the reference's
  // flavour picker). No product configured and several in the catalogue:
  // the products themselves are the choice.
  const fixed = ctx.products.find((p) => p.id === data.productId);
  const [productId, setProductId] = useState<string | null>(fixed?.id ?? ctx.products[0]?.id ?? null);
  const product = ctx.products.find((p) => p.id === productId) ?? fixed ?? ctx.products[0] ?? null;
  const [variantId, setVariantId] = useState<string | null>(product?.variants?.[0]?.id ?? null);
  const variant = product?.variants?.find((v) => v.id === variantId) ?? null;
  const productChoices = !fixed && ctx.products.length > 1 ? ctx.products : [];
  const variantChoices = (product?.variants?.length ?? 0) > 1 ? product!.variants : [];

  const list = variant ? variant.price : (product?.basePrice ?? 0);
  const unit = variant ? (variant.offerPrice ?? variant.price) : (product?.offerPrice ?? product?.basePrice ?? 0);
  const saving = Math.max(0, list - unit);

  const methods = useMemo<Method[]>(() => {
    const p = ctx.settings.payments ?? {};
    const out: Method[] = [];
    if (p.cod?.enabled !== false) out.push({ value: 'cod', label: p.cod?.label || 'Cash on Delivery' });
    if (p.manualBkash?.enabled) {
      out.push({ value: 'manual_bkash', label: ctx.locale === 'bn' ? 'বিকাশ' : 'bKash', logo: TEMPLATE_ASSET('bkash-logo.webp'), dial: '*247#', number: p.manualBkash.number, instructions: p.manualBkash.instructions });
    }
    if (p.manualNagad?.enabled) {
      out.push({ value: 'manual_nagad', label: ctx.locale === 'bn' ? 'নগদ' : 'Nagad', dial: '*167#', number: p.manualNagad.number, instructions: p.manualNagad.instructions });
    }
    if (p.manualRocket?.enabled) {
      out.push({ value: 'manual_rocket', label: ctx.locale === 'bn' ? 'রকেট' : 'Rocket', dial: '*322#', number: p.manualRocket.number, instructions: p.manualRocket.instructions });
    }
    if (p.bankTransfer?.enabled) {
      out.push({ value: 'bank_transfer', label: 'Bank Transfer', instructions: p.bankTransfer.details });
    }
    return out.length > 0 ? out : [{ value: 'cod', label: 'Cash on Delivery' }];
  }, [ctx.settings.payments, ctx.locale]);

  const needsDistrict = Boolean(data.showDistrict || ctx.settings.orders?.requireDistrict);

  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(1, s.nameReq).max(120),
          phone: z
            .string()
            .trim()
            .transform((v) => v.replace(/[\s-]/g, '').replace(/^\+?88/, ''))
            .refine((v) => BD_PHONE.test(v), s.phoneReq),
          altPhone: z.string().trim().optional(),
          email: z.string().trim().email().optional().or(z.literal('')),
          district: needsDistrict ? z.string().trim().min(1, s.districtReq) : z.string().optional(),
          thana: z.string().trim().optional(),
          address: z.string().trim().min(1, s.addressReq).max(500),
          note: z.string().trim().max(500).optional(),
          paymentMethod: z.string().min(1),
          transactionId: z.string().trim().optional(),
        })
        .refine(
          // A manual mobile payment is worthless to the tenant without the
          // transaction id to reconcile against.
          (v) => v.paymentMethod === 'cod' || v.paymentMethod === 'bank_transfer' || Boolean(v.transactionId),
          { path: ['transactionId'], message: s.trxReq }
        ),
    [needsDistrict, s]
  );

  const {
    register, handleSubmit, watch, setValue, formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: methods[0].value, district: '', thana: '' },
  });

  const [submitError, setSubmitError] = useState('');
  const district = watch('district');
  const paymentMethod = watch('paymentMethod');
  const active = methods.find((m) => m.value === paymentMethod) ?? methods[0];

  useEffect(() => {
    if (ctx.mode === 'live') captureAttribution();
  }, [ctx.mode]);

  const thanas = useMemo(() => BD_DISTRICTS.find((d) => d.district === district)?.thanas ?? [], [district]);

  // Display only — the server recomputes all of this from the catalogue and
  // its own settings, and its answer is the one that is stored.
  const charges = ctx.settings.orders?.deliveryCharges ?? { inside: 0, outside: 0, freeAbove: null };
  const isInside = district === (charges.insideLabel || 'Dhaka');
  let delivery = isInside ? charges.inside : charges.outside;
  if (charges.freeAbove && unit >= charges.freeAbove) delivery = 0;
  const total = unit + (delivery || 0);

  const onSubmit = handleSubmit(async (values) => {
    if (ctx.mode === 'preview' || !product) return;
    setSubmitError('');
    const { fbp, fbc } = readMetaCookies();
    try {
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-tenant-slug': ctx.tenant.slug },
        body: JSON.stringify({
          customer: { name: values.name, phone: values.phone, altPhone: values.altPhone || '', email: values.email || '' },
          shipping: { district: values.district || '', thana: values.thana || '', address: values.address, note: values.note || '' },
          items: [{ productId: product.id, variantId: variant?.id || undefined, qty: 1 }],
          payment: { method: values.paymentMethod, transactionId: values.transactionId || '' },
          locale: ctx.locale,
          pageUrl: window.location.href,
          marketing: { fbp, fbc, attribution: captureAttribution() },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setSubmitError(typeof json.error === 'string' ? json.error : s.failed);
        return;
      }
      router.push(`${ctx.basePath}/thank-you?order=${encodeURIComponent(json.data.publicId)}`);
    } catch {
      setSubmitError(s.failed);
    }
  });

  const input =
    'h-10 w-full min-w-0 rounded-xl border border-input bg-transparent px-3 py-1 text-xs shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive sm:h-11 sm:text-sm';
  const labelCls = 'text-xs font-medium sm:text-sm';
  const err = (m?: string) =>
    m ? (
      <p className="flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="size-3.5 shrink-0" />
        {m}
      </p>
    ) : null;

  const productLabel = product
    ? `${product.name}${variant ? ` (${variant.name})` : ''} × 1`
    : '';

  return (
    <section id="order" className="relative mx-auto max-w-6xl scroll-mt-16 overflow-hidden px-3 py-10 sm:px-6 sm:py-16 md:px-8 lg:py-24">
      <GridPattern patternType="lines" size={32} className="opacity-40" />

      <Reveal className="mx-auto max-w-2xl px-2 text-center">
        {t(data.headline) ? (
          <h2 className="flex flex-wrap items-center justify-center gap-2 text-balance text-center text-2xl font-extrabold leading-tight text-primary sm:gap-3 sm:text-4xl md:text-5xl">
            <ShoppingCart className="size-6 shrink-0 text-primary sm:size-8 md:size-9" />
            <span>{t(data.headline)}</span>
          </h2>
        ) : null}
        {t(data.subheadline) ? (
          <p className="mx-auto mt-2 max-w-xl text-center text-xs font-medium leading-relaxed text-muted-foreground sm:mt-3 sm:text-base md:text-lg">
            {t(data.subheadline)}
          </p>
        ) : null}
      </Reveal>

      {ctx.mode === 'preview' ? (
        <p className="mx-auto mt-4 max-w-xl rounded-lg border border-dashed border-border bg-card px-4 py-2 text-center text-xs text-muted-foreground">
          {s.previewNote}
        </p>
      ) : null}

      <Reveal delay={0.15} className="mt-6 sm:mt-10">
        <form
          onSubmit={onSubmit}
          noValidate
          className="grid grid-cols-1 gap-6 rounded-2xl border border-border/80 bg-card p-3.5 shadow-sm sm:rounded-3xl sm:p-7 sm:shadow-md md:p-8 lg:grid-cols-12 lg:items-start"
        >
          {/* ── delivery details ── */}
          <div className="min-w-0 space-y-6 lg:col-span-7">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground sm:text-xl">
                <Truck className="size-5 shrink-0 text-primary" />
                <span>{t(data.deliveryTitle)}</span>
              </h3>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
                {productChoices.length > 0 || variantChoices.length > 0 ? (
                  <div className="col-span-full grid gap-1.5">
                    <label htmlFor="ul-choice" className="flex items-center justify-between text-xs font-semibold sm:text-sm">
                      <span>{t(data.variantLabel)}</span>
                    </label>
                    {variantChoices.length > 0 ? (
                      <select
                        id="ul-choice"
                        value={variantId ?? ''}
                        onChange={(e) => setVariantId(e.target.value)}
                        className="h-11 w-full cursor-pointer rounded-xl border-2 border-primary/40 bg-background px-3.5 text-xs font-bold text-foreground shadow-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary sm:h-12 sm:text-sm"
                      >
                        {variantChoices.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} — {money(v.offerPrice ?? v.price)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        id="ul-choice"
                        value={productId ?? ''}
                        onChange={(e) => {
                          const next = ctx.products.find((p) => p.id === e.target.value);
                          setProductId(e.target.value);
                          setVariantId(next?.variants?.[0]?.id ?? null);
                        }}
                        className="h-11 w-full cursor-pointer rounded-xl border-2 border-primary/40 bg-background px-3.5 text-xs font-bold text-foreground shadow-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary sm:h-12 sm:text-sm"
                      >
                        {productChoices.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — {money(p.offerPrice ?? p.basePrice)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : null}

                <div className="col-span-full grid gap-1.5 sm:col-span-1">
                  <label htmlFor="ul-name" className={labelCls}>{t(data.nameLabel)}</label>
                  <input
                    id="ul-name"
                    autoComplete="name"
                    placeholder={t(data.namePlaceholder)}
                    aria-invalid={Boolean(errors.name)}
                    className={input}
                    {...register('name')}
                  />
                  {err(errors.name?.message)}
                </div>

                <div className="col-span-full grid gap-1.5 sm:col-span-1">
                  <label htmlFor="ul-phone" className={labelCls}>{t(data.phoneLabel)}</label>
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-3 select-none text-xs font-semibold text-muted-foreground sm:text-sm">
                      +88
                    </span>
                    <input
                      id="ul-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="01XXXXXXXXX"
                      maxLength={14}
                      aria-invalid={Boolean(errors.phone)}
                      className={cn(input, 'pl-11 sm:pl-12')}
                      {...register('phone')}
                    />
                  </div>
                  {err(errors.phone?.message)}
                </div>

                {data.showAltPhone ? (
                  <div className="col-span-full grid gap-1.5 sm:col-span-1">
                    <label htmlFor="ul-alt" className={labelCls}>{s.altPhone}</label>
                    <input id="ul-alt" inputMode="numeric" className={input} {...register('altPhone')} />
                  </div>
                ) : null}

                {data.showEmail ? (
                  <div className="col-span-full grid gap-1.5 sm:col-span-1">
                    <label htmlFor="ul-email" className={labelCls}>{s.email}</label>
                    <input id="ul-email" type="email" autoComplete="email" className={input} {...register('email')} />
                  </div>
                ) : null}

                {needsDistrict ? (
                  <div className={cn('col-span-full grid gap-1.5', data.showThana && 'sm:col-span-1')}>
                    <label htmlFor="ul-district" className={labelCls}>{s.district} *</label>
                    <select
                      id="ul-district"
                      className={input}
                      aria-invalid={Boolean(errors.district)}
                      {...register('district')}
                      onChange={(e) => {
                        setValue('district', e.target.value, { shouldValidate: true });
                        setValue('thana', '');
                      }}
                    >
                      <option value="">{s.selectDistrict}</option>
                      {BD_DISTRICTS.map((d) => (
                        <option key={d.district} value={d.district}>
                          {ctx.locale === 'bn' ? d.bn : d.district}
                        </option>
                      ))}
                    </select>
                    {err(errors.district?.message)}
                  </div>
                ) : null}

                {needsDistrict && data.showThana ? (
                  <div className="col-span-full grid gap-1.5 sm:col-span-1">
                    <label htmlFor="ul-thana" className={labelCls}>{s.thana}</label>
                    <select id="ul-thana" className={input} disabled={!district} {...register('thana')}>
                      <option value="">{s.selectThana}</option>
                      {thanas.map((th) => <option key={th} value={th}>{th}</option>)}
                    </select>
                  </div>
                ) : null}

                <div className="col-span-full grid gap-1.5">
                  <label htmlFor="ul-address" className={labelCls}>{t(data.addressLabel)}</label>
                  <input
                    id="ul-address"
                    autoComplete="street-address"
                    placeholder={t(data.addressPlaceholder)}
                    aria-invalid={Boolean(errors.address)}
                    className={input}
                    {...register('address')}
                  />
                  {err(errors.address?.message)}
                </div>

                {data.showNote ? (
                  <div className="col-span-full grid gap-1.5">
                    <label htmlFor="ul-note" className={labelCls}>{s.note}</label>
                    <textarea id="ul-note" rows={2} className={cn(input, 'h-auto py-2')} {...register('note')} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* ── order summary, payment, confirm ── */}
          <div className="flex min-w-0 flex-col space-y-4 rounded-xl border border-border/60 bg-muted/60 p-4 shadow-xs sm:rounded-2xl sm:p-6 lg:sticky lg:top-24 lg:col-span-5">
            <h3 className="text-base font-bold text-foreground sm:text-lg">{t(data.summaryTitle)}</h3>

            <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
              {product ? (
                <>
                  <div className="flex items-start justify-between gap-2 text-xs sm:text-sm">
                    <span className="font-bold leading-snug text-foreground">{productLabel}</span>
                    <div className="shrink-0 text-right">
                      {saving > 0 ? (
                        <span className="block text-[11px] italic text-muted-foreground line-through sm:text-xs">{money(list)}</span>
                      ) : null}
                      <span className="block font-bold text-foreground">{money(unit)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                    <span>{t(data.deliveryLabel)}</span>
                    <span className={cn('font-semibold', delivery ? 'text-foreground' : 'text-emerald-600')}>
                      {delivery ? money(delivery) : t(data.freeText)}
                    </span>
                  </div>

                  {saving > 0 && t(data.savingText) ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-center text-xs font-bold text-primary">
                      {t(data.savingText)} {money(saving)}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between border-t border-border/80 pt-3">
                    <span className="text-xs font-semibold text-foreground sm:text-sm">{t(data.totalLabel)}</span>
                    <span className="text-lg font-extrabold text-primary sm:text-2xl">{money(total)}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{s.noProduct}</p>
              )}
            </div>

            <div className="border-t border-border/80 pt-4">
              {t(data.paymentTitle) ? (
                <span className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-primary">
                  {t(data.paymentTitle)}
                </span>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {methods.map((m) => (
                  <label
                    key={m.value}
                    className={cn(
                      'flex flex-1 cursor-pointer select-none items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all duration-150 sm:gap-2 sm:px-3 sm:text-sm',
                      paymentMethod === m.value
                        ? 'border-primary bg-primary/10 font-semibold text-primary shadow-xs ring-1 ring-primary/30'
                        : 'border-border bg-card text-foreground/80 hover:border-primary/40'
                    )}
                  >
                    <input type="radio" value={m.value} className="sr-only" {...register('paymentMethod')} />
                    {m.logo ? <img src={m.logo} alt="" className="h-4 w-auto shrink-0 object-contain sm:h-5" /> : null}
                    <span className="whitespace-nowrap">{m.label}</span>
                  </label>
                ))}
              </div>

              {active.value === 'cod' ? (
                <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground shadow-xs">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-primary sm:text-sm">
                    <Truck className="size-4 shrink-0 text-primary" />
                    <span>{active.label}</span>
                  </p>
                  {t(data.codNote) ? (
                    <p className="mt-1 text-[11px] font-semibold leading-relaxed text-muted-foreground sm:text-xs">{t(data.codNote)}</p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-3.5 space-y-3 rounded-xl border border-primary/30 bg-card p-3 text-foreground shadow-xs sm:p-4">
                  {active.value === 'manual_bkash' && data.bkashQr?.url ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-white p-2 text-center shadow-xs">
                      <img src={data.bkashQr.url} alt="bKash" className="mx-auto h-auto max-h-36 w-full rounded-lg object-contain sm:max-h-56" />
                    </div>
                  ) : null}

                  {active.number ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-center sm:p-3">
                      <span className="block text-[11px] font-medium text-muted-foreground sm:text-xs">
                        {active.label} {s.sendMoneyNumber}
                      </span>
                      <span className="mt-0.5 block select-all font-mono text-base font-bold tracking-wider text-primary sm:text-lg">
                        {active.number}
                      </span>
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-2.5 text-[11px] text-amber-950 sm:p-3 sm:text-xs">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-amber-900 sm:text-sm">
                      {active.logo ? <img src={active.logo} alt="" className="inline-block h-4 w-auto shrink-0 object-contain" /> : null}
                      <span>{active.label} {s.howTo}</span>
                    </p>
                    {active.dial ? (
                      <ol className="mt-1.5 list-inside list-decimal space-y-1 pl-0.5 text-[11px] font-medium leading-relaxed text-muted-foreground sm:text-xs">
                        <li>
                          {s.step1} <span className="font-mono font-bold text-foreground">{active.dial}</span> {s.step1b}
                        </li>
                        <li>
                          <strong className="text-foreground">Send Money</strong> {s.step2}
                        </li>
                        {active.number ? (
                          <li>
                            {s.step3} <strong className="font-mono font-bold text-primary">{active.number}</strong>
                          </li>
                        ) : null}
                        <li>
                          {s.step4} <strong className="font-bold text-primary">{money(total)}/=</strong> {s.step4b}
                        </li>
                        <li>
                          {s.step5} <strong className="text-foreground">Transaction ID (TrxID)</strong> {s.step5b}
                        </li>
                      </ol>
                    ) : null}
                    {active.instructions ? (
                      <p className="mt-1.5 whitespace-pre-line font-medium text-muted-foreground">{active.instructions}</p>
                    ) : null}
                  </div>

                  {active.value !== 'bank_transfer' ? (
                    <div className="grid gap-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="ul-trx" className="text-xs font-bold text-foreground">
                          {s.trxLabel} <span className="text-destructive">*</span>
                        </label>
                        <span className="text-[10px] text-muted-foreground">{s.trxExample}</span>
                      </div>
                      <input
                        id="ul-trx"
                        placeholder={s.trxPlaceholder}
                        aria-invalid={Boolean(errors.transactionId)}
                        className={cn(input, 'bg-background font-mono uppercase')}
                        {...register('transactionId')}
                      />
                      {err(errors.transactionId?.message)}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="pt-2">
              {submitError ? (
                <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-bold text-destructive shadow-xs sm:text-sm">
                  <AlertCircle className="size-4.5 shrink-0" />
                  <span>{submitError}</span>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || !product}
                className="cta-shine mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-cta text-sm font-bold text-brand-cta-foreground shadow-md shadow-brand-cta/20 transition-all hover:bg-brand-cta-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    <span>{s.submitting}</span>
                  </>
                ) : (
                  <span>{t(data.submitText)}</span>
                )}
              </button>

              {(data.trustBadges ?? []).length > 0 ? (
                <div className="mt-3.5 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-primary">
                  {(data.trustBadges ?? []).map((b, i) => (
                    <span key={i} className="flex items-center gap-1">{t(b.text)}</span>
                  ))}
                </div>
              ) : null}

              {data.showSocialProof && data.socialCount ? (
                <div className="mt-5 border-t border-border/60 pt-3 text-center">
                  <div className="text-xl font-extrabold tracking-tight text-primary sm:text-2xl">{data.socialCount}</div>
                  {t(data.socialText) ? (
                    <div className="mt-0.5 text-xs font-semibold text-muted-foreground">{t(data.socialText)}</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </form>
      </Reveal>
    </section>
  );
}
