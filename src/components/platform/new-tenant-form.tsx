'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2, AlertCircle, Check, Copy, ExternalLink, Settings2, PartyPopper,
} from 'lucide-react';

import { api, ApiRequestError, fieldErrors } from '@/lib/api-client';
import { RESERVED_SLUGS, LOCALES, LOCALE_LABELS, type Locale } from '@/lib/constants';
import type { PlanRow } from '@/lib/platform-api.server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

const schema = z.object({
  name: z.string().trim().min(1, 'The business name is required').max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(SLUG_RE, '3–40 characters: lowercase letters, numbers and hyphens')
    .refine((s) => !RESERVED_SLUGS.has(s), 'That word is reserved by the platform'),
  productName: z.string().trim().max(160).optional(),
  productPrice: z.string().trim().optional(),
  productOfferPrice: z.string().trim().optional(),
  ownerName: z.string().trim().max(120).optional(),
  ownerEmail: z.string().trim().toLowerCase().email('A valid owner email is required'),
  contactPhone: z.string().trim().max(40).optional(),
  planCode: z.string().min(1),
  defaultLocale: z.enum(LOCALES),
  bilingual: z.boolean(),
});

type Values = z.infer<typeof schema>;

type CreatedResult = {
  tenant: { _id: string; slug: string; name: string };
  owner: { email: string };
  adminUrls: string[];
  generatedPassword: string | null;
  page: { sections: number } | null;
  pageError: string | null;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

export function NewTenantForm({
  plans,
  platformHost,
}: {
  plans: PlanRow[];
  platformHost: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<CreatedResult | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      planCode: plans[0]?.code ?? 'starter',
      defaultLocale: 'bn',
      bilingual: false,
    },
  });

  const name = watch('name');
  const slug = watch('slug');
  const defaultLocale = watch('defaultLocale');
  const bilingual = watch('bilingual');

  // Derive the slug from the name until the operator edits it themselves.
  const onNameChange = (value: string) => {
    setValue('name', value);
    if (!slugTouched) setValue('slug', slugify(value), { shouldValidate: Boolean(value) });
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    setServerFieldErrors({});
    try {
      const result = await api.post<CreatedResult>('/platform/tenants', {
        name: values.name,
        slug: values.slug,
        ownerEmail: values.ownerEmail,
        ownerName: values.ownerName || values.name,
        contactPhone: values.contactPhone || undefined,
        planCode: values.planCode,
        defaultLocale: values.defaultLocale,
        enabledLocales: values.bilingual ? ['bn', 'en'] : [values.defaultLocale],
        productName: values.productName || undefined,
        productPrice: values.productPrice ? Number(values.productPrice) : undefined,
        productOfferPrice: values.productOfferPrice ? Number(values.productOfferPrice) : undefined,
      });
      setCreated(result);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setServerFieldErrors(fieldErrors(err));
        setFormError(err.code === 'SLUG_TAKEN' ? '' : err.message);
        if (err.code === 'SLUG_TAKEN') {
          setServerFieldErrors({ slug: 'That address is already taken' });
        }
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  });

  if (created) return <Success result={created} platformHost={platformHost} />;

  const err = (field: keyof Values) =>
    errors[field]?.message ?? serverFieldErrors[field as string];

  const scheme = platformHost.includes('.local') ? 'http' : 'https';

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">The business</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field id="name" label="Business name" error={err('name')} required>
            <Input
              id="name"
              value={name ?? ''}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="MilkReady"
              autoFocus
            />
          </Field>

          <Field
            id="slug"
            label="Address"
            error={err('slug')}
            required
            hint="Used for both URLs below. Lowercase letters, numbers and hyphens."
          >
            <Input
              id="slug"
              {...register('slug')}
              onChange={(e) => {
                setSlugTouched(true);
                setValue('slug', slugify(e.target.value), { shouldValidate: true });
              }}
              placeholder="milkready"
              className="font-mono"
            />
            {/* Showing both URLs here is the point: it is what the operator
                needs to hand the client, and what they ask for first. */}
            {slug && SLUG_RE.test(slug) ? (
              <div className="mt-2 space-y-1 rounded-lg bg-muted px-3 py-2 text-xs">
                <p className="font-mono">
                  {scheme}://<strong>{slug}</strong>.{platformHost}
                </p>
                <p className="font-mono text-muted-foreground">
                  {scheme}://{platformHost}/<strong>{slug}</strong>
                </p>
              </div>
            ) : null}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="defaultLocale" label="Page language" error={err('defaultLocale')}>
              <Select
                value={defaultLocale}
                onValueChange={(v) => setValue('defaultLocale', v as Locale)}
              >
                <SelectTrigger id="defaultLocale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {LOCALE_LABELS[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="contactPhone" label="Contact phone" error={err('contactPhone')}>
              <Input id="contactPhone" {...register('contactPhone')} placeholder="01712345678" inputMode="numeric" />
            </Field>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border p-3 text-sm">
            <input type="checkbox" {...register('bilingual')} className="mt-0.5 size-4" />
            <span>
              <span className="font-medium">Offer both Bangla and English</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Adds a language switcher to their page and a second tab on every
                text field in their editor. {bilingual ? '' : 'Leave off for a single-language page.'}
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">First product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Optional. The price on their landing page always comes from this
            catalogue, never typed into the page, so the pricing card, the order
            summary and the invoice can never disagree.
          </p>
          <Field id="productName" label="Product name" error={err('productName')}>
            <Input id="productName" {...register('productName')} placeholder="MilkReady Prenatal Dose" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="productPrice" label="Regular price" error={err('productPrice')}>
              <Input id="productPrice" {...register('productPrice')} inputMode="numeric" placeholder="5650" />
            </Field>
            <Field id="productOfferPrice" label="Offer price" error={err('productOfferPrice')}>
              <Input id="productOfferPrice" {...register('productOfferPrice')} inputMode="numeric" placeholder="3399" />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Owner login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="ownerName" label="Owner name" error={err('ownerName')}>
              <Input id="ownerName" {...register('ownerName')} placeholder="Defaults to the business name" />
            </Field>
            <Field
              id="ownerEmail"
              label="Owner email"
              error={err('ownerEmail')}
              required
              hint="They are emailed a generated password."
            >
              <Input id="ownerEmail" type="email" {...register('ownerEmail')} placeholder="owner@business.com" />
            </Field>
          </div>

          <Field id="planCode" label="Plan" error={err('planCode')}>
            <Select value={watch('planCode')} onValueChange={(v) => setValue('planCode', v)}>
              <SelectTrigger id="planCode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name} — ৳{p.price}/{p.interval === 'yearly' ? 'yr' : 'mo'}
                    {p.limits.landingPages ? ` · ${p.limits.landingPages} page(s)` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {isSubmitting ? 'Creating…' : 'Create landing page'}
        </Button>
        <Button asChild type="button" variant="ghost">
          <Link href="/platform/tenants">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Success({ result, platformHost }: { result: CreatedResult; platformHost: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const scheme = platformHost.includes('.local') ? 'http' : 'https';
  const siteUrl = `${scheme}://${result.tenant.slug}.${platformHost}`;

  const copy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-5">
      <Card className="border-emerald-300 bg-emerald-50/60">
        <CardContent className="flex items-start gap-3 pt-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <PartyPopper className="size-4" />
          </span>
          <div>
            <p className="font-semibold text-emerald-950">
              {result.tenant.name} is live
            </p>
            <p className="mt-0.5 text-sm text-emerald-900/80">
              Its landing page is already published with{' '}
              {result.page?.sections ?? 0} sections, so both URLs work right now.
            </p>
          </div>
        </CardContent>
      </Card>

      {result.pageError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            The tenant was created but its first page failed: {result.pageError}. You
            can add one from the tenant&rsquo;s configure screen.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Shown once. If the email bounces this is the only copy. */}
      {result.generatedPassword ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owner credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Emailed to {result.owner.email}. The password is shown here once —
              copy it now if you want to pass it on directly. They must change it
              at first sign-in.
            </p>
            <div className="space-y-2">
              <CopyRow label="Email" value={result.owner.email} copied={copied} onCopy={copy} />
              <CopyRow
                label="Password"
                value={result.generatedPassword}
                copied={copied}
                onCopy={copy}
                mono
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Their URLs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <CopyRow label="Site" value={siteUrl} copied={copied} onCopy={copy} mono />
          <CopyRow
            label="Path URL"
            value={`${scheme}://${platformHost}/${result.tenant.slug}`}
            copied={copied}
            onCopy={copy}
            mono
          />
          {result.adminUrls.map((u, i) => (
            <CopyRow
              key={u}
              label={i === 0 ? 'Their admin' : 'Admin (path)'}
              value={u}
              copied={copied}
              onCopy={copy}
              mono
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="lg">
          <Link href={`/platform/tenants/${result.tenant._id}`}>
            <Settings2 className="size-4" />
            Configure the landing page
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href={siteUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            View the site
          </a>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/platform/tenants">Back to tenants</Link>
        </Button>
      </div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
  mono,
}: {
  label: string;
  value: string;
  copied: string | null;
  onCopy: (label: string, value: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <Badge variant="outline" className="shrink-0">
        {label}
      </Badge>
      <code className={`min-w-0 flex-1 truncate text-xs ${mono ? 'font-mono' : ''}`}>{value}</code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        onClick={() => onCopy(label, value)}
        aria-label={`Copy ${label}`}
      >
        {copied === label ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  );
}
