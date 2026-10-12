import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, CheckCircle2, Home, MapPin, Package, Phone, User } from 'lucide-react';
import { serverEnv } from '@/env';
import { getTenantContext } from '@/lib/tenant-context.server';
import { getPublicPage } from '@/lib/server-api';
import { themeToCss } from '@/lib/theme-css';
import { resolveBrand } from '@/lib/brand';
import { formatDateTime, formatMoney } from '@/lib/format';

export const metadata: Metadata = {
  title: 'অর্ডার সম্পন্ন হয়েছে',
  robots: { index: false, follow: false },
};

type OrderSummary = {
  orderNumber: string;
  publicId: string;
  status: string;
  createdAt: string;
  customer: { name: string; phone: string };
  shipping: { district: string; thana: string; address: string };
  items: { name: string; qty: number; unitPrice: number; subtotal: number }[];
  pricing: { subtotal: number; deliveryCharge: number; discount: number; total: number; currency: string };
  payment: { method: string; status: string };
};

const PAYMENT_LABEL: Record<string, string> = {
  cod: 'ক্যাশ অন ডেলিভারি',
  manual_bkash: 'বিকাশ',
  manual_nagad: 'নগদ',
  manual_rocket: 'রকেট',
  bank_transfer: 'ব্যাংক ট্রান্সফার',
};

async function getOrder(slug: string, publicId: string): Promise<OrderSummary | null> {
  if (!/^[A-Za-z0-9]{10,20}$/.test(publicId)) return null;
  try {
    const res = await fetch(`${serverEnv.backendUrl}/api/public/orders/${encodeURIComponent(publicId)}`, {
      headers: { accept: 'application/json', 'x-tenant-slug': slug },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data as OrderSummary) : null;
  } catch {
    return null;
  }
}

/**
 * Where the order form lands. Wears the landing page's own palette, so the
 * visitor never feels they left the shop. Ported from the reference's
 * /thank-you, minus the hard-coded product names and crimson.
 */
export default async function ThankYouPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const [{ tenantSlug }, sp] = await Promise.all([params, searchParams]);
  const ctx = await getTenantContext(tenantSlug);
  const [bundle, order] = await Promise.all([
    getPublicPage(ctx.slug, '', ctx.locale),
    sp.order ? getOrder(ctx.slug, sp.order) : Promise.resolve(null),
  ]);

  const tenantName = bundle?.tenant.name ?? ctx.slug;
  const brand = resolveBrand(bundle?.page.brand, tenantName);
  const phone = bundle?.tenant.contact?.phone || bundle?.settings.general?.supportPhone || '';
  const money = (n: number) => formatMoney(n, order?.pricing.currency ?? bundle?.tenant.currency ?? 'BDT', 'bn');
  const home = ctx.basePath || '/';

  return (
    <>
      {bundle ? <style>{themeToCss(bundle.page.theme, ctx.slug)}</style> : null}
      <div data-ul-tenant={ctx.slug} className="min-h-screen bg-background pb-16 text-foreground">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary via-primary to-primary-dark px-4 pb-16 pt-10 text-center text-primary-foreground">
          <div className="mx-auto max-w-xl">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-white shadow-xl">
              <CheckCircle2 className="size-12 fill-primary text-white" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">অভিনন্দন!</h1>
            <p className="mt-2 text-base font-medium opacity-95 sm:text-lg">
              আমাদের টিম আপনার অর্ডারটি সফল ভাবে রিসিভ করেছে।
            </p>

            <div className="mt-6 rounded-2xl border border-white/20 bg-white p-5 text-foreground shadow-xl sm:p-6">
              <p className="text-sm font-bold leading-relaxed text-primary sm:text-base">
                অতিশীঘ্রই আমাদের একজন প্রতিনিধি আপনাকে কল করে অর্ডারটি কনফার্ম করবেন।
              </p>
              <hr className="my-3.5 border-border/60" />
              <p className="text-xs font-medium leading-relaxed text-muted-foreground sm:text-sm">
                আপনার যদি কোনো প্রশ্ন থেকে থাকে, তাহলে অনুগ্রহ করে আমাদের প্রতিনিধি কে প্রশ্ন করে নিশ্চিত হয়ে নিন।
              </p>
            </div>

            {order ? (
              <div className="mt-6 flex justify-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
                  <ArrowDown className="size-6 animate-bounce" />
                </div>
              </div>
            ) : null}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden leading-none">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-7 w-full fill-background sm:h-9" aria-hidden>
              <path d="M0,0 C300,90 900,90 1200,0 L1200,120 L0,120 Z" />
            </svg>
          </div>
        </section>

        <main className="mx-auto max-w-xl space-y-6 px-4 pt-6">
          {order ? (
            <>
              <div className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
                <Row label="অর্ডারের সময়" value={formatDateTime(order.createdAt, 'bn')} />
                <hr className="border-dashed border-border" />
                <Row label="অর্ডার নম্বর" value={order.orderNumber} mono />
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                <div className="flex items-center justify-between border-b border-border bg-muted/80 px-5 py-3.5">
                  <span className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Package className="size-5 text-primary" />
                    অর্ডার সামারি
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    {PAYMENT_LABEL[order.payment.method] ?? order.payment.method}
                  </span>
                </div>
                <div className="space-y-3 p-5 text-sm">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-3 font-medium">
                      <span className="text-foreground">{i.name} × {i.qty}</span>
                      <span className="font-bold text-foreground">{money(i.subtotal)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="font-semibold text-foreground">
                      {order.pricing.deliveryCharge ? money(order.pricing.deliveryCharge) : 'ফ্রি'}
                    </span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex items-center justify-between text-base font-bold">
                    <span className="text-foreground">সর্বমোট:</span>
                    <span className="text-xl font-extrabold text-primary">{money(order.pricing.total)}</span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                <div className="border-b border-border bg-muted/80 px-5 py-3.5">
                  <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <User className="size-4 text-primary" />
                    ডেলিভারি তথ্য
                  </h2>
                </div>
                <div className="space-y-2.5 p-5 text-sm">
                  <Detail Icon={User} label="নাম:" value={order.customer.name} />
                  <Detail Icon={Phone} label="মোবাইল নম্বর:" value={order.customer.phone} mono />
                  <Detail
                    Icon={MapPin}
                    label="ডেলিভারি ঠিকানা:"
                    value={[order.shipping.address, order.shipping.thana, order.shipping.district].filter(Boolean).join(', ')}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
              অর্ডারের বিস্তারিত তথ্য এই মুহূর্তে দেখানো যাচ্ছে না, তবে আপনার অর্ডারটি আমরা পেয়েছি।
            </p>
          )}

          <div className="space-y-3 pt-4 text-center">
            <Link
              href={home}
              className="mx-auto flex h-12 w-full max-w-md items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground shadow-md transition hover:opacity-90"
            >
              <Home className="size-5" />
              {brand.name} হোমপেজে ফিরে যান
            </Link>
            {phone ? (
              <p className="text-xs text-muted-foreground">
                যেকোনো প্রয়োজনে কল করুন:{' '}
                <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="font-bold text-primary hover:underline">
                  {phone}
                </a>
              </p>
            ) : null}
          </div>
        </main>
      </div>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono font-bold text-foreground' : 'font-bold text-foreground'}>{value}</span>
    </div>
  );
}

function Detail({
  Icon,
  label,
  value,
  mono,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className={mono ? 'font-mono font-semibold text-foreground' : 'font-semibold text-foreground'}>{value}</span>
      </div>
    </div>
  );
}
