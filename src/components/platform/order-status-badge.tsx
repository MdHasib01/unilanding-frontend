import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_TONE, type OrderStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn('shrink-0 font-medium capitalize', ORDER_STATUS_TONE[status as OrderStatus])}
    >
      {status}
    </Badge>
  );
}
