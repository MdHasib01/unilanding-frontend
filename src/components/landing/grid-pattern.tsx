import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * The reference's faint grid behind the hero, loader and order form, in the
 * brand colour and faded toward the edges.
 *
 * The pattern id is per-instance (useId): two grids of the same size on one
 * page would otherwise share an id and the second would reference the first.
 */
export function GridPattern({
  className,
  size = 32,
  patternType = 'lines',
}: {
  className?: string;
  size?: number;
  patternType?: 'lines' | 'dots';
}) {
  const id = `grid-${useId().replace(/:/g, '')}`;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]',
        className
      )}
    >
      <svg className="h-full w-full fill-primary/20 stroke-primary/20">
        <defs>
          <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" x="-1" y="-1">
            {patternType === 'lines' ? (
              <path d={`M.5 ${size}V.5H${size}`} fill="none" />
            ) : (
              <circle cx={size / 2} cy={size / 2} r="1.5" strokeWidth="0" />
            )}
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
