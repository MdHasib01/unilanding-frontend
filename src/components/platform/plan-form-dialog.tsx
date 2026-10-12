'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Pencil, Plus } from 'lucide-react';

import { api, ApiRequestError, fieldErrors } from '@/lib/api-client';
import type { PlanRow } from '@/lib/platform-api.server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const LIMITS = [
  { key: 'landingPages', label: 'Landing pages' },
  { key: 'products', label: 'Products' },
  { key: 'staffUsers', label: 'Team members' },
  { key: 'ordersPerMonth', label: 'Orders / month' },
  { key: 'customDomains', label: 'Custom domains' },
  { key: 'mediaMb', label: 'Media (MB)' },
] as const;

type LimitKey = (typeof LIMITS)[number]['key'];

const whole = z.string().trim().regex(/^\d+$/, 'A whole number');

const schema = z.object({
  code: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/, '3–40 characters: lowercase letters, numbers and hyphens'),
  name: z.string().trim().min(1, 'A plan name is required').max(80),
  description: z.string().trim().max(400),
  price: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, 'A price such as 1500'),
  interval: z.enum(['monthly', 'yearly']),
  sortOrder: z.string().trim().regex(/^-?\d+$/, 'A whole number'),
  features: z.string().max(4000),
  active: z.boolean(),
  public: z.boolean(),
  limits: z.object({
    landingPages: whole,
    products: whole,
    staffUsers: whole,
    ordersPerMonth: whole,
    customDomains: whole,
    mediaMb: whole,
  }),
});

type Values = z.infer<typeof schema>;

const toValues = (plan?: PlanRow, nextSort = 0): Values => ({
  code: plan?.code ?? '',
  name: plan?.name ?? '',
  description: plan?.description ?? '',
  price: String(plan?.price ?? 0),
  interval: plan?.interval === 'yearly' ? 'yearly' : 'monthly',
  sortOrder: String(plan?.sortOrder ?? nextSort),
  features: (plan?.features ?? []).join('\n'),
  active: plan?.active ?? true,
  public: plan?.public ?? true,
  limits: Object.fromEntries(
    LIMITS.map(({ key }) => [key, String(plan?.limits?.[key] ?? 0)])
  ) as Record<LimitKey, string>,
});

/**
 * Create or edit a catalog plan. Editing never touches tenants already on the
 * plan: they keep the snapshot of the terms they signed up on, and only an
 * explicit plan change on the tenant re-snapshots.
 */
export function PlanFormDialog({ plan, nextSortOrder = 0 }: { plan?: PlanRow; nextSortOrder?: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const editing = Boolean(plan);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(plan, nextSortOrder) });

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      reset(toValues(plan, nextSortOrder));
      setFormError('');
    }
  };

  const onSubmit = handleSubmit(async (v) => {
    setFormError('');
    const body = {
      name: v.name,
      description: v.description,
      price: Number(v.price),
      interval: v.interval,
      sortOrder: Number(v.sortOrder),
      features: v.features.split('\n').map((f) => f.trim()).filter(Boolean),
      active: v.active,
      public: v.public,
      limits: Object.fromEntries(LIMITS.map(({ key }) => [key, Number(v.limits[key])])),
    };
    try {
      if (plan) await api.patch(`/platform/plans/${plan._id}`, body);
      else await api.post('/platform/plans', { ...body, code: v.code });
      toast.success(plan ? `${v.name} updated` : `${v.name} created`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.code === 'PLAN_CODE_TAKEN') {
          setError('code', { message: 'That code is already used by another plan' });
          return;
        }
        const fe = fieldErrors(err);
        for (const [path, message] of Object.entries(fe)) {
          setError(path as keyof Values, { message });
        }
        setFormError(Object.keys(fe).length ? '' : err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    }
  });

  const interval = watch('interval');
  const active = watch('active');
  const isPublic = watch('public');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {editing ? (
          <Button variant="outline" size="sm">
            <Pencil className="size-3.5" />
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            New plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${plan?.name}` : 'New plan'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Changes apply to tenants who choose this plan from now on. Existing tenants keep the terms they signed up on.'
              : 'Adds a plan to the catalog that tenants can be put on.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {formError ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name?.message}>
              <Input {...register('name')} placeholder="Business" />
            </Field>
            <Field
              label="Code"
              error={errors.code?.message}
              hint={editing ? 'Fixed once created — tenants reference it.' : 'Used internally, e.g. business'}
            >
              <Input {...register('code')} disabled={editing} className="font-mono" placeholder="business" />
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <Textarea {...register('description')} rows={2} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (৳)" error={errors.price?.message}>
              <Input {...register('price')} inputMode="decimal" />
            </Field>
            <Field label="Billing">
              <Select value={interval} onValueChange={(v) => setValue('interval', v as Values['interval'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sort order" error={errors.sortOrder?.message}>
              <Input {...register('sortOrder')} inputMode="numeric" />
            </Field>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Limits</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {LIMITS.map(({ key, label }) => (
                <Field key={key} label={label} error={errors.limits?.[key]?.message}>
                  <Input {...register(`limits.${key}`)} inputMode="numeric" />
                </Field>
              ))}
            </div>
          </fieldset>

          <Field label="Features" hint="One per line, shown on the plan card." error={errors.features?.message}>
            <Textarea {...register('features')} rows={5} />
          </Field>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={active} onCheckedChange={(v) => setValue('active', v)} />
              Active — can be assigned to tenants
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={isPublic} onCheckedChange={(v) => setValue('public', v)} />
              Public — listed on pricing
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {editing ? 'Save changes' : 'Create plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
