import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TONE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-100',
  pending: 'bg-amber-100 text-amber-900 hover:bg-amber-100',
  suspended: 'bg-rose-100 text-rose-900 hover:bg-rose-100',
  archived: 'bg-neutral-200 text-neutral-700 hover:bg-neutral-200',
};

const LABEL: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
  archived: 'Archived',
};

export function TenantStatusBadge({
  status,
  expiresAt,
}: {
  status: string;
  expiresAt?: string | null;
}) {
  // A lapsed plan reads as suspended to visitors, so say so here rather than
  // showing "Active" next to a landing page that is actually dark.
  const lapsed = Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
  const effective = lapsed && status === 'active' ? 'suspended' : status;

  return (
    <Badge variant="secondary" className={cn('shrink-0 font-medium', TONE[effective])}>
      {lapsed && status === 'active' ? 'Expired' : (LABEL[effective] ?? effective)}
    </Badge>
  );
}
