'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Loader2, AlertCircle } from 'lucide-react';

import { api, ApiRequestError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const schema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type Values = z.infer<typeof schema>;

export function LoginForm({
  initialError,
  nextPath,
  tenantSlug,
}: {
  initialError?: string;
  nextPath?: string;
  /** Set on a tenant login page so the API resolves the right audience. */
  tenantSlug?: string;
}) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [formError, setFormError] = useState(initialError ?? '');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    try {
      const data = await api.post<{
        user: { mustChangePassword: boolean; scope: string };
        locale?: string;
      }>('/auth/login', { ...values, tenantSlug }, { tenantSlug });

      // The dashboard honours the user's own language preference.
      if (data.locale) {
        document.cookie = `UL_LOCALE=${data.locale}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
      }

      const target =
        nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')
          ? nextPath
          : data.user.scope === 'platform'
            ? '/platform'
            : '/admin';

      // A hard navigation, so the server components re-run with the new cookie.
      window.location.assign(target);
    } catch (err) {
      setFormError(
        err instanceof ApiRequestError
          ? err.status === 401
            ? t('invalidCredentials')
            : err.message
          : 'Something went wrong. Please try again.'
      );
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {formError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          autoFocus
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email ? (
          <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{t('password')}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {t('signingIn')}
          </>
        ) : (
          t('signIn')
        )}
      </Button>
    </form>
  );
}
