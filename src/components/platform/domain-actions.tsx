'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  MoreHorizontal, Loader2, RefreshCw, Star, ShieldCheck, ShieldOff, PauseCircle, PlayCircle, Trash2,
} from 'lucide-react';

import { api, ApiRequestError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DomainLike = {
  _id: string;
  host: string;
  type: string;
  status: string;
  isPrimary: boolean;
  ssl?: { status?: string };
};

export function DomainActions({ domain }: { domain: DomainLike }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const isPlatform = domain.type === 'platform_subdomain';
  const sslIssued = domain.ssl?.status === 'issued';
  const servable = domain.status === 'active' && (isPlatform || sslIssued);

  const run = async (fn: () => Promise<unknown>, success: string | ((r: unknown) => string)) => {
    setBusy(true);
    try {
      const r = await fn();
      const msg = typeof success === 'function' ? success(r) : success;
      if (msg) toast.success(msg);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : 'That did not work.');
    } finally {
      setBusy(false);
      setConfirmRemove(false);
    }
  };

  const patch = (body: unknown, msg: string) =>
    run(() => api.patch(`/platform/domains/${domain._id}`, body), msg);

  const verify = () =>
    run(
      () => api.post<{ verified: boolean; verification?: { lastError?: string } }>(
        `/platform/domains/${domain._id}/verify`
      ),
      (r) => {
        const res = r as { verified: boolean; verification?: { lastError?: string } };
        if (!res.verified) {
          // A miss is an expected outcome, not a failure of the request.
          toast.warning(res.verification?.lastError || 'The DNS record was not found yet.');
          return '';
        }
        return `${domain.host} verified`;
      }
    );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" disabled={busy} aria-label={`Actions for ${domain.host}`}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {!isPlatform ? (
            <DropdownMenuItem onClick={verify}>
              <RefreshCw className="size-4" />
              Check DNS now
            </DropdownMenuItem>
          ) : null}
          {!domain.isPrimary ? (
            <DropdownMenuItem
              disabled={!servable}
              onClick={() => patch({ isPrimary: true }, `${domain.host} is now the primary domain`)}
            >
              <Star className="size-4" />
              Make primary
            </DropdownMenuItem>
          ) : null}
          {!isPlatform ? (
            sslIssued ? (
              <DropdownMenuItem
                onClick={() => patch({ ssl: { status: 'none' } }, 'Certificate marked as missing')}
                disabled={domain.isPrimary}
              >
                <ShieldOff className="size-4" />
                Mark certificate missing
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => patch({ ssl: { status: 'issued', provider: 'manual' } }, 'Certificate marked as issued')}
              >
                <ShieldCheck className="size-4" />
                Mark certificate issued
              </DropdownMenuItem>
            )
          ) : null}
          {domain.status === 'active' ? (
            <DropdownMenuItem
              disabled={domain.isPrimary}
              onClick={() => patch({ status: 'disabled' }, `${domain.host} disabled`)}
            >
              <PauseCircle className="size-4" />
              Disable
            </DropdownMenuItem>
          ) : (
            // Lets an operator activate by hand when DNS was confirmed some
            // other way, e.g. a domain behind a proxy the resolver cannot see.
            <DropdownMenuItem onClick={() => patch({ status: 'active' }, `${domain.host} activated`)}>
              <PlayCircle className="size-4" />
              Activate manually
            </DropdownMenuItem>
          )}
          {!isPlatform && !domain.isPrimary ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setConfirmRemove(true)}>
                <Trash2 className="size-4" />
                Remove
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {domain.host}?</AlertDialogTitle>
            <AlertDialogDescription>
              The domain stops serving this tenant straight away. It can be added again later, but
              will need to be verified again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                run(() => api.del(`/platform/domains/${domain._id}`), `${domain.host} removed`);
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
