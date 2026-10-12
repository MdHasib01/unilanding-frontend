'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { api, ApiRequestError, fieldErrors } from '@/lib/api-client';
import { LOCALES, LOCALE_LABELS, LOCALE_COOKIE, type Locale } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Your name is required').max(120),
  phone: z.string().trim().max(40),
  locale: z.enum(LOCALES),
});

export function ProfileForm({
  initial,
}: {
  initial: { name: string; email: string; phone?: string; locale: Locale };
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: initial.name, phone: initial.phone ?? '', locale: initial.locale },
  });

  const locale = watch('locale');

  const onSubmit = handleSubmit(async (v) => {
    try {
      await api.patch('/auth/profile', v);
      // The dashboard's language comes from this cookie, so keep it in step
      // with the saved preference rather than waiting for the next sign-in.
      document.cookie = `${LOCALE_COOKIE}=${v.locale}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
      reset(v);
      toast.success('Profile saved');
      router.refresh();
    } catch (err) {
      const fe = fieldErrors(err);
      for (const [path, message] of Object.entries(fe)) {
        setError(path as 'name' | 'phone' | 'locale', { message });
      }
      if (!Object.keys(fe).length) {
        toast.error(err instanceof ApiRequestError ? err.message : 'Could not save your profile.');
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
        <CardDescription>How you appear in the audit log and to your colleagues.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={initial.email} disabled readOnly />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name ? <p className="text-xs font-medium text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" autoComplete="tel" inputMode="tel" {...register('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label>Dashboard language</Label>
              <Select value={locale} onValueChange={(v) => setValue('locale', v as Locale, { shouldDirty: true })}>
                <SelectTrigger className="w-full">
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
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Save profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(10, 'Use at least 10 characters').max(200),
    confirm: z.string().min(1, 'Repeat the new password'),
  })
  .refine((v) => v.newPassword === v.confirm, {
    path: ['confirm'],
    message: 'The two passwords do not match',
  });

export function ChangePasswordForm() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = handleSubmit(async (v) => {
    setDone(false);
    try {
      await api.post('/auth/change-password', {
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
      });
      reset({ currentPassword: '', newPassword: '', confirm: '' });
      setDone(true);
      toast.success('Password changed. Other devices have been signed out.');
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'WRONG_PASSWORD') {
        setError('currentPassword', { message: err.message });
      } else if (err instanceof ApiRequestError && err.code === 'PASSWORD_UNCHANGED') {
        setError('newPassword', { message: err.message });
      } else {
        toast.error(err instanceof ApiRequestError ? err.message : 'Could not change the password.');
      }
    }
  });

  const field = (
    id: 'currentPassword' | 'newPassword' | 'confirm',
    label: string,
    autoComplete: string
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="password" autoComplete={autoComplete} aria-invalid={Boolean(errors[id])} {...register(id)} />
      {errors[id] ? <p className="text-xs font-medium text-destructive">{errors[id]?.message}</p> : null}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Password</CardTitle>
        <CardDescription>
          Changing it signs you out everywhere else. This browser stays signed in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {field('currentPassword', 'Current password', 'current-password')}
          {field('newPassword', 'New password', 'new-password')}
          {field('confirm', 'Repeat new password', 'new-password')}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Change password
            </Button>
            {done ? <span className="text-sm text-emerald-700">Password updated.</span> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
