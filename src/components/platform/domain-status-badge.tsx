import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TONE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-100',
  pending: 'bg-amber-100 text-amber-900 hover:bg-amber-100',
  verifying: 'bg-blue-100 text-blue-900 hover:bg-blue-100',
  error: 'bg-rose-100 text-rose-900 hover:bg-rose-100',
  disabled: 'bg-neutral-200 text-neutral-700 hover:bg-neutral-200',
};

/**
 * A domain is only usable when it is active AND has a certificate — a custom
 * domain with DNS pointed at us but no cert issued will not serve, so showing
 * it as plain "Active" would be misleading.
 */
export function DomainStatusBadge({
  status,
  sslStatus,
  type,
}: {
  status: string;
  sslStatus?: string;
  type?: string;
}) {
  const needsCert = type !== 'platform_subdomain';
  const certMissing = needsCert && sslStatus !== 'issued';

  if (status === 'active' && certMissing) {
    return (
      <Badge variant="secondary" className={cn('shrink-0 font-medium', TONE.pending)}>
        Awaiting certificate
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={cn('shrink-0 font-medium capitalize', TONE[status])}>
      {status}
    </Badge>
  );
}
