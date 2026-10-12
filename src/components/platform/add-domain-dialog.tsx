'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Plus } from 'lucide-react';

import { api, ApiRequestError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type TenantOption = { _id: string; name: string; slug: string };

/**
 * Maps a custom domain to a tenant. The domain starts as pending: the API
 * returns the DNS record to add, and it only serves once verified and given a
 * certificate.
 */
export function AddDomainDialog({
  tenants,
  tenantId: fixedTenantId,
  size = 'default',
}: {
  /** Omit with tenantId set to add to one known tenant. */
  tenants?: TenantOption[];
  tenantId?: string;
  size?: 'default' | 'sm';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tenantId, setTenantId] = useState(fixedTenantId ?? '');
  const [host, setHost] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setHost('');
      setError('');
      setTenantId(fixedTenantId ?? '');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return setError('Choose the tenant this domain belongs to.');
    if (!host.trim()) return setError('Enter a domain such as example.com.');
    setBusy(true);
    setError('');
    try {
      const d = await api.post<{ host: string }>(`/platform/tenants/${tenantId}/domains`, { host });
      toast.success(`${d.host} added. Ask the tenant to add the DNS record shown.`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not add the domain.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size={size} variant={fixedTenantId ? 'outline' : 'default'}>
          <Plus className={size === 'sm' ? 'size-3.5' : 'size-4'} />
          Add domain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a custom domain</DialogTitle>
          <DialogDescription>
            An apex domain (example.com) is verified with a TXT record; a subdomain
            (shop.example.com) with a CNAME to the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {!fixedTenantId ? (
            <div className="space-y-1.5">
              <Label>Tenant</Label>
              <Select value={tenantId} onValueChange={setTenantId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {(tenants ?? []).map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name} <span className="font-mono text-xs text-muted-foreground">/{t.slug}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="domain-host">Domain</Label>
            <Input
              id="domain-host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="example.com"
              className="font-mono"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Add domain
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
