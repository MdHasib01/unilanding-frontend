'use client';

import { useState } from 'react';
import Link from 'next/link';

import type { OrderRow } from '@/lib/platform-api.server';
import { formatDateTime, formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { OrderStatusBadge } from '@/components/platform/order-status-badge';

export const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on delivery',
  manual_bkash: 'bKash',
  manual_nagad: 'Nagad',
  manual_rocket: 'Rocket',
  bank_transfer: 'Bank transfer',
};

const money = (n: number, currency = 'BDT') => formatMoney(n, currency, 'en');

/**
 * The platform-wide order feed. Read-only on purpose: an order belongs to the
 * tenant who works it, and the platform looks rather than touches.
 */
export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [open, setOpen] = useState<OrderRow | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="hidden md:table-cell">Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Placed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow
                key={o._id}
                onClick={() => setOpen(o)}
                className="cursor-pointer"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setOpen(o);
                }}
              >
                <TableCell className="font-mono text-xs font-semibold">{o.orderNumber}</TableCell>
                <TableCell className="max-w-40">
                  {o.tenant ? (
                    <Link
                      href={`/platform/tenants/${o.tenant._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block truncate hover:underline"
                    >
                      {o.tenant.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="max-w-48">
                  <span className="block truncate">{o.customer.name}</span>
                  <span className="block truncate font-mono text-xs text-muted-foreground">
                    {o.customer.phone}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {money(o.pricing.total, o.pricing.currency)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs">{PAYMENT_LABELS[o.payment.method] ?? o.payment.method}</span>
                  <span className="block text-xs capitalize text-muted-foreground">{o.payment.status}</span>
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={o.status} />
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground lg:table-cell">
                  {formatDateTime(o.createdAt, 'en')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={Boolean(open)} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open ? <OrderDetail order={open} /> : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function OrderDetail({ order: o }: { order: OrderRow }) {
  const attribution = Object.entries(o.marketing?.attribution ?? {}).filter(
    ([k, v]) => v && !['firstSeenAt', 'landingUrl'].includes(k)
  );
  const address = [o.shipping.address, o.shipping.thana, o.shipping.district].filter(Boolean).join(', ');

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <span className="font-mono">{o.orderNumber}</span>
          <OrderStatusBadge status={o.status} />
        </SheetTitle>
        <SheetDescription>
          {o.tenant?.name ?? 'Unknown tenant'} · {formatDateTime(o.createdAt, 'en')}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-5 px-4 pb-6 text-sm">
        <Section title="Customer">
          <Row label="Name" value={o.customer.name} />
          <Row label="Phone" value={o.customer.phone} mono />
          {o.customer.altPhone ? <Row label="Alt. phone" value={o.customer.altPhone} mono /> : null}
          {o.customer.email ? <Row label="Email" value={o.customer.email} /> : null}
          {address ? <Row label="Address" value={address} /> : null}
          {o.shipping.note ? <Row label="Note" value={o.shipping.note} /> : null}
        </Section>

        <Section title="Items">
          <ul className="space-y-2">
            {o.items.map((it, i) => (
              <li key={i} className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate">{it.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {it.qty} × {money(it.unitPrice, o.pricing.currency)}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">{money(it.subtotal, o.pricing.currency)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-2" />
          <Row label="Subtotal" value={money(o.pricing.subtotal, o.pricing.currency)} />
          <Row label="Delivery" value={money(o.pricing.deliveryCharge, o.pricing.currency)} />
          {o.pricing.discount ? (
            <Row label="Discount" value={`−${money(o.pricing.discount, o.pricing.currency)}`} />
          ) : null}
          <Row label="Total" value={money(o.pricing.total, o.pricing.currency)} strong />
        </Section>

        <Section title="Payment">
          <Row label="Method" value={PAYMENT_LABELS[o.payment.method] ?? o.payment.method} />
          <Row label="Status" value={o.payment.status} />
          {o.payment.transactionId ? <Row label="Transaction" value={o.payment.transactionId} mono /> : null}
        </Section>

        {o.statusHistory?.length ? (
          <Section title="History">
            <ol className="space-y-2">
              {[...o.statusHistory].reverse().map((h, i) => (
                <li key={i} className="flex items-start justify-between gap-3">
                  <span>
                    <span className="capitalize">{h.status}</span>
                    {h.byName ? <span className="text-muted-foreground"> · {h.byName}</span> : null}
                    {h.note ? <span className="block text-xs text-muted-foreground">{h.note}</span> : null}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(h.at, 'en')}</span>
                </li>
              ))}
            </ol>
          </Section>
        ) : null}

        {attribution.length ? (
          <Section title="Attribution">
            <div className="flex flex-wrap gap-1.5">
              {attribution.map(([k, v]) => (
                <Badge key={k} variant="outline" className="max-w-full font-mono text-[0.7rem]">
                  <span className="truncate">
                    {k}={String(v)}
                  </span>
                </Badge>
              ))}
            </div>
          </Section>
        ) : null}

        <Section title="Source">
          <Row label="Channel" value={o.source} />
          <Row label="Language" value={o.locale === 'bn' ? 'বাংলা' : 'English'} />
          {o.client?.ipLocation?.city ? (
            <Row
              label="Location"
              value={[o.client.ipLocation.city, o.client.ipLocation.country].filter(Boolean).join(', ')}
            />
          ) : null}
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function Row({ label, value, mono, strong }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={cn('min-w-0 break-words text-right', mono && 'font-mono text-xs', strong && 'font-semibold')}>
        {value}
      </span>
    </div>
  );
}
