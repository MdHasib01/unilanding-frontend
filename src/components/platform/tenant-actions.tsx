'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MoreHorizontal, LogIn, PauseCircle, PlayCircle, Archive, Loader2 } from 'lucide-react';

import { api, ApiRequestError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Pending = null | 'impersonate' | 'suspend' | 'activate' | 'archive';

export function TenantActions({
  tenantId,
  slug,
  status,
  name,
}: {
  tenantId: string;
  slug: string;
  status: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending>(null);
  const [confirm, setConfirm] = useState<'suspend' | 'archive' | null>(null);

  const run = async (action: Pending, fn: () => Promise<unknown>, success: string) => {
    setPending(action);
    try {
      await fn();
      toast.success(success);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'That did not work.');
    } finally {
      setPending(null);
      setConfirm(null);
    }
  };

  /**
   * Signs in as the tenant owner on the tenant's OWN host.
   *
   * The platform cannot simply share its cookie: sessions are host-only by
   * design, so a cookie set on unilanding.com is unusable on the tenant's
   * domain. Instead the API mints a single-use 60-second token and we open
   * /ul/session on their host, which exchanges it for a cookie there.
   */
  const impersonate = () =>
    run(
      'impersonate',
      async () => {
        const { url } = await api.post<{ url: string }>(
          `/platform/tenants/${tenantId}/impersonate`
        );
        window.open(url, '_blank', 'noopener');
      },
      `Opening ${name}'s dashboard`
    );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={Boolean(pending)}>
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <MoreHorizontal className="size-3.5" />}
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={impersonate}>
            <LogIn className="size-4" />
            Sign in as owner
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {status === 'suspended' ? (
            <DropdownMenuItem
              onClick={() =>
                run(
                  'activate',
                  () => api.post(`/platform/tenants/${tenantId}/activate`),
                  `${name} is active again`
                )
              }
            >
              <PlayCircle className="size-4" />
              Activate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setConfirm('suspend')}>
              <PauseCircle className="size-4" />
              Suspend
            </DropdownMenuItem>
          )}

          <DropdownMenuItem variant="destructive" onClick={() => setConfirm('archive')}>
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === 'suspend' ? `Suspend ${name}?` : `Archive ${name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === 'suspend'
                ? 'Their landing page immediately shows a "page unavailable" screen and stops taking orders. Their data is untouched and you can reactivate at any time.'
                : `Their team is signed out, every session stops working, and the landing page goes dark. The address "${slug}" stays reserved so nobody else can claim it. This is not meant to be undone from here.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirm === 'suspend') {
                  run(
                    'suspend',
                    () =>
                      api.post(`/platform/tenants/${tenantId}/suspend`, {
                        reason: 'Suspended from the platform dashboard',
                      }),
                    `${name} is suspended`
                  );
                } else {
                  run(
                    'archive',
                    () => api.del(`/platform/tenants/${tenantId}`),
                    `${name} is archived`
                  );
                }
              }}
              className={confirm === 'archive' ? 'bg-destructive text-white hover:bg-destructive/90' : undefined}
            >
              {confirm === 'suspend' ? 'Suspend' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
