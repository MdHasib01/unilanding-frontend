'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { tt } from '@/lib/i18n-text';
import { SectionShell } from '@/components/shared/section-shell';
import { formatMoney } from '@/lib/format';
import { captureAttribution, readMetaCookies } from '@/lib/attribution';
import { BD_DISTRICTS } from '@/lib/bd-locations';
import { cn } from '@/lib/utils';
import type { SectionRendererProps } from '../types';

type Data = {
  headline?: unknown;
  subheadline?: unknown;
  productId?: string;
  showDistrict?: boolean;
  showThana?: boolean;
  showAltPhone?: boolean;
  showEmail?: boolean;
  showNote?: boolean;
  submitText?: unknown;
  successNote?: unknown;
};

/** Bangladesh mobile numbers. Same rule the reference used, and it is correct. */
const BD_PHONE = /^01[3-9]\d{8}$/;

const L = {
  bn: {
    name: 'আপনার নাম', phone: 'মোবাইল নম্বর', altPhone: 'বিকল্প নম্বর', email: 'ইমেইল',
    district: 'জেলা', thana: 'থানা / এলাকা', address: 'সম্পূর্ণ ঠিকানা', note: 'অতিরিক্ত নোট',
    payment: 'পেমেন্ট পদ্ধতি', cod: 'ক্যাশ অন ডেলিভারি', subtotal: 'সাব-টোটাল',
    delivery: 'ডেলিভারি চার্জ', total: 'সর্বমোট', free: 'ফ্রি', qty: 'পরিমাণ',
    submit: 'অর্ডার কনফার্ম করুন', submitting: 'অর্ডার নেওয়া হচ্ছে…',
    selectDistrict: 'জেলা নির্বাচন করুন', selectThana: 'থানা নির্বাচন করুন',
    nameReq: 'আপনার নাম লিখুন', phoneReq: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন',
    addressReq: 'আপনার ঠিকানা লিখুন', districtReq: 'জেলা নির্বাচন করুন',
    trxId: 'ট্রানজেকশন আইডি', trxReq: 'ট্রানজেকশন আইডি দিন',
    failed: 'অর্ডারটি নেওয়া যায়নি। আবার চেষ্টা করুন বা ফোন করুন।',
    previewNote: 'এটি প্রিভিউ — এখান থেকে অর্ডার যাবে না।',
  },
  en: {
    name: 'Your name', phone: 'Mobile number', altPhone: 'Alternate number', email: 'Email',
    district: 'District', thana: 'Area', address: 'Full address', note: 'Order note',
    payment: 'Payment method', cod: 'Cash on delivery', subtotal: 'Subtotal',
    delivery: 'Delivery', total: 'Total', free: 'Free', qty: 'Quantity',
    submit: 'Confirm order', submitting: 'Placing your order…',
    selectDistrict: 'Select a district', selectThana: 'Select an area',
    nameReq: 'Please enter your name', phoneReq: 'Enter a valid 11-digit mobile number',
    addressReq: 'Please enter your address', districtReq: 'Please choose a district',
    trxId: 'Transaction ID', trxReq: 'Enter the transaction ID',
    failed: 'We could not place your order. Please try again or call us.',
    previewNote: 'This is a preview — orders are not submitted from here.',
  },
} as const;

export function OrderForm({ data, ctx }: SectionRendererProps<Data>) {
  const t = (v: unknown) => tt(v, ctx.locale, ctx.fallbackLocale);
  const s = L[ctx.locale] ?? L.bn;
  const router = useRouter();

  const product = ctx.products.find((p) => p.id === data.productId) ?? ctx.products[0] ?? null;
  const [variantId, setVariantId] = useState<string | null>(product?.variants?.[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [submitError, setSubmitError] = useState('');

  const methods = useMemo(() => {
    const p = ctx.settings.payments ?? {};
    const out: { value: string; label: string; number?: string; instructions?: string }[] = [];
    if (p.cod?.enabled !== false) out.push({ value: 'cod', label: p.cod?.label || s.cod });
    if (p.manualBkash?.enabled) out.push({ value: 'manual_bkash', label: 'bKash', number: p.manualBkash.number, instructions: p.manualBkash.instructions });
    if (p.manualNagad?.enabled) out.push({ value: 'manual_nagad', label: 'Nagad', number: p.manualNagad.number, instructions: p.manualNagad.instructions });
    if (p.manualRocket?.enabled) out.push({ value: 'manual_rocket', label: 'Rocket', number: p.manualRocket.number, instructions: p.manualRocket.instructions });
    if (p.bankTransfer?.enabled) out.push({ value: 'bank_transfer', label: 'Bank transfer', instructions: p.bankTransfer.details });
    return out.length > 0 ? out : [{ value: 'cod', label: s.cod }];
  }, [ctx.settings.payments, s.cod]);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, s.nameReq).max(120),
        phone: z
          .string()
          .trim()
          .transform((v) => v.replace(/[\s-]/g, ''))
          .refine((v) => BD_PHONE.test(v), s.phoneReq),
        altPhone: z.string().trim().optional(),
        email: z.string().trim().email().optional().or(z.literal('')),
        district: data.showDistrict ? z.string().trim().min(1, s.districtReq) : z.string().optional(),
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
    [data.showDistrict, s]
  );

  const {
    register, handleSubmit, watch, setValue, formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: methods[0].value, district: '', thana: '' },
  });

  const district = watch('district');
  const paymentMethod = watch('paymentMethod');
  const activeMethod = methods.find((m) => m.value === paymentMethod);

  useEffect(() => {
    if (ctx.mode === 'live') captureAttribution();
  }, [ctx.mode]);

  const thanas = useMemo(
    () => BD_DISTRICTS.find((d) => d.district === district)?.thanas ?? [],
    [district]
  );

  const variant = product?.variants?.find((v) => v.id === variantId) ?? null;
  const unit = variant
    ? (variant.offerPrice ?? variant.price)
    : (product?.offerPrice ?? product?.basePrice ?? 0);
  const subtotal = unit * qty;

  const charges = ctx.settings.orders?.deliveryCharges ?? { inside: 0, outside: 0, freeAbove: null };
  const insideLabel = charges.insideLabel || 'Dhaka';
  const isInside = district === insideLabel;
  let delivery = isInside ? charges.inside : charges.outside;
  if (charges.freeAbove && subtotal >= charges.freeAbove) delivery = 0;
  // Display only — the server recomputes all of this from the catalogue and its
  // own settings, and its answer is the one that is stored.
  const total = subtotal + delivery;

  const onSubmit = handleSubmit(async (values) => {
    if (ctx.mode === 'preview') return;
    setSubmitError('');

    const { fbp, fbc } = readMetaCookies();
    try {
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-tenant-slug': ctx.tenant.slug },
        body: JSON.stringify({
          customer: { name: values.name, phone: values.phone, altPhone: values.altPhone || '', email: values.email || '' },
          shipping: { district: values.district || '', thana: values.thana || '', address: values.address, note: values.note || '' },
          items: product ? [{ productId: product.id, variantId: variantId || undefined, qty }] : [],
          payment: { method: values.paymentMethod, transactionId: values.transactionId || '' },
          locale: ctx.locale,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          marketing: { fbp, fbc, attribution: captureAttribution() },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setSubmitError(typeof json.error === 'string' ? json.error : s.failed);
        return;
      }
      router.push(`${ctx.basePath}/thank-you?order=${encodeURIComponent(json.data.publicId)}`);
    } catch {
      setSubmitError(s.failed);
    }
  });

  const field =
    'w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-base text-card-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20';
  const label = 'mb-1.5 block text-sm font-medium text-card-foreground';
  const errorText = 'mt-1 flex items-center gap-1 text-xs font-medium text-destructive';

  return (
    <SectionShell id="order" width="default" tone="muted">
      <div className="mb-7 text-center">
        {t(data.headline) ? (
          <h2 className="text-balance text-2xl font-bold text-foreground sm:text-3xl">
            {t(data.headline)}
          </h2>
        ) : null}
        {t(data.subheadline) ? (
          <p className="mx-auto mt-2 max-w-xl text-pretty text-muted-foreground">
            {t(data.subheadline)}
          </p>
        ) : null}
      </div>

      {ctx.mode === 'preview' ? (
        <p className="mb-4 rounded-lg border border-dashed border-border bg-card px-4 py-2 text-center text-sm text-muted-foreground">
          {s.previewNote}
        </p>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div>
            <label className={label} htmlFor="ul-name">{s.name} *</label>
            <input id="ul-name" {...register('name')} className={field} autoComplete="name" />
            {errors.name ? <p className={errorText}><AlertCircle className="size-3.5" />{errors.name.message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="ul-phone">{s.phone} *</label>
              <input
                id="ul-phone" {...register('phone')} className={field}
                inputMode="numeric" autoComplete="tel" placeholder="01XXXXXXXXX" maxLength={14}
              />
              {errors.phone ? <p className={errorText}><AlertCircle className="size-3.5" />{errors.phone.message}</p> : null}
            </div>
            {data.showAltPhone ? (
              <div>
                <label className={label} htmlFor="ul-alt">{s.altPhone}</label>
                <input id="ul-alt" {...register('altPhone')} className={field} inputMode="numeric" />
              </div>
            ) : null}
          </div>

          {data.showEmail ? (
            <div>
              <label className={label} htmlFor="ul-email">{s.email}</label>
              <input id="ul-email" type="email" {...register('email')} className={field} autoComplete="email" />
            </div>
          ) : null}

          {data.showDistrict ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="ul-district">{s.district} *</label>
                <select
                  id="ul-district" {...register('district')} className={field}
                  onChange={(e) => { setValue('district', e.target.value); setValue('thana', ''); }}
                >
                  <option value="">{s.selectDistrict}</option>
                  {BD_DISTRICTS.map((d) => (
                    <option key={d.district} value={d.district}>
                      {ctx.locale === 'bn' ? d.bn : d.district}
                    </option>
                  ))}
                </select>
                {errors.district ? <p className={errorText}><AlertCircle className="size-3.5" />{errors.district.message}</p> : null}
              </div>
              {data.showThana ? (
                <div>
                  <label className={label} htmlFor="ul-thana">{s.thana}</label>
                  <select id="ul-thana" {...register('thana')} className={field} disabled={!district}>
                    <option value="">{s.selectThana}</option>
                    {thanas.map((th) => <option key={th} value={th}>{th}</option>)}
                  </select>
                </div>
              ) : null}
            </div>
          ) : null}

          <div>
            <label className={label} htmlFor="ul-address">{s.address} *</label>
            <textarea id="ul-address" rows={3} {...register('address')} className={field} autoComplete="street-address" />
            {errors.address ? <p className={errorText}><AlertCircle className="size-3.5" />{errors.address.message}</p> : null}
          </div>

          {data.showNote ? (
            <div>
              <label className={label} htmlFor="ul-note">{s.note}</label>
              <textarea id="ul-note" rows={2} {...register('note')} className={field} />
            </div>
          ) : null}

          <fieldset>
            <legend className={label}>{s.payment}</legend>
            <div className="space-y-2">
              {methods.map((m) => (
                <label
                  key={m.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition',
                    paymentMethod === m.value ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/40'
                  )}
                >
                  <input type="radio" value={m.value} {...register('paymentMethod')} className="size-4 accent-[var(--primary)]" />
                  <span className="text-sm font-medium text-card-foreground">{m.label}</span>
                </label>
              ))}
            </div>

            {activeMethod?.number || activeMethod?.instructions ? (
              <div className="mt-3 rounded-xl bg-muted p-3.5 text-sm">
                {activeMethod.number ? (
                  <p className="font-semibold text-card-foreground">
                    {activeMethod.label}: <span className="font-mono">{activeMethod.number}</span>
                  </p>
                ) : null}
                {activeMethod.instructions ? (
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">{activeMethod.instructions}</p>
                ) : null}
              </div>
            ) : null}

            {paymentMethod !== 'cod' ? (
              <div className="mt-3">
                <label className={label} htmlFor="ul-trx">{s.trxId} *</label>
                <input id="ul-trx" {...register('transactionId')} className={field} />
                {errors.transactionId ? <p className={errorText}><AlertCircle className="size-3.5" />{errors.transactionId.message}</p> : null}
              </div>
            ) : null}
          </fieldset>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-4">
          {product ? (
            <>
              <h3 className="font-bold text-card-foreground">{product.name}</h3>

              {(product.variants?.length ?? 0) > 1 ? (
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id} type="button" onClick={() => setVariantId(v.id)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-sm transition',
                        v.id === variantId ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                      )}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.qty}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-"
                    className="flex size-8 items-center justify-center rounded-lg border border-border text-lg leading-none">−</button>
                  <span className="w-8 text-center font-mono font-bold tabular-nums">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="+"
                    className="flex size-8 items-center justify-center rounded-lg border border-border text-lg leading-none">+</button>
                </div>
              </div>

              <dl className="space-y-2 border-t border-border pt-3 text-sm">
                <Row k={s.subtotal} v={formatMoney(subtotal, ctx.currency, ctx.locale)} />
                <Row k={s.delivery} v={delivery === 0 ? s.free : formatMoney(delivery, ctx.currency, ctx.locale)} />
                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <dt className="font-bold text-card-foreground">{s.total}</dt>
                  <dd className="text-xl font-extrabold text-primary">
                    {formatMoney(total, ctx.currency, ctx.locale)}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No product configured.</p>
          )}

          {submitError ? (
            <p className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || !product}
            className="cta-shine flex w-full items-center justify-center gap-2 rounded-full bg-[var(--cta)] px-6 py-3.5 text-base font-bold text-[var(--cta-foreground)] shadow transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <><Loader2 className="size-5 animate-spin" />{s.submitting}</> : (t(data.submitText) || s.submit)}
          </button>

          {t(data.successNote) ? (
            <p className="text-center text-xs text-muted-foreground">{t(data.successNote)}</p>
          ) : null}
        </aside>
      </form>
    </SectionShell>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex items-center justify-between">
    <dt className="text-muted-foreground">{k}</dt>
    <dd className="font-medium text-card-foreground">{v}</dd>
  </div>
);
