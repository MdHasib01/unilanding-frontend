'use client';

import { useState } from 'react';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter the password you signed in with'),
    newPassword: z.string().min(10, 'Use at least 10 characters'),
    confirm: z.string().min(1, 'Repeat the new password'),
  })
  .refine((v) => v.newPassword === v.confirm, {
    path: ['confirm'],
    message: 'The two passwords do not match',
  });

/**
 * Non-dismissible: no close button, no outside click, no Escape. The server
 * enforces this too (428 on every other endpoint), so the dialog reflects a
 * real constraint rather than imposing one.
 */
export function MustChangePassword() {
  const t = useTranslations('auth');
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError('');
    try {
      await api.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      window.location.reload();
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Could not change the password.');
    }
  });

  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>{t('mustChangeTitle')}</DialogTitle>
          <DialogDescription>{t('mustChangeBody')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {formError ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <Field
            id="currentPassword"
            label={t('currentPassword')}
            error={errors.currentPassword?.message}
            autoComplete="current-password"
            autoFocus
            {...register('currentPassword')}
          />
          <Field
            id="newPassword"
            label={t('newPassword')}
            error={errors.newPassword?.message}
            autoComplete="new-password"
            {...register('newPassword')}
          />
          <Field
            id="confirm"
            label="Repeat new password"
            error={errors.confirm?.message}
            autoComplete="new-password"
            {...register('confirm')}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('changePassword')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  error,
  ...rest
}: React.ComponentProps<'input'> & { id: string; label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="password" aria-invalid={Boolean(error)} {...rest} />
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
