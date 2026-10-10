import { Building2, Leaf, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CONDITIONS, HOUSING_FITS } from '@/lib/config/app';
import { labelFor } from '@/lib/format';
import type { Condition, HousingFit, ListingSource } from '@/lib/types';

export function HousingFitBadge({ fit, showExplain = false }: { fit: HousingFit; showExplain?: boolean }) {
  const meta = HOUSING_FITS.find((h) => h.id === fit)!;
  const variant = fit === 'dorm' ? 'success' : fit === 'apartment' ? 'default' : 'warning';
  const Icon = fit === 'dorm' ? Leaf : fit === 'apartment' ? Building2 : TriangleAlert;
  return (
    <span className="inline-flex flex-col gap-1">
      <Badge variant={variant} title={meta.explain}>
        <Icon className="h-3 w-3" aria-hidden /> {meta.label}
      </Badge>
      {showExplain ? <span className="text-sm text-muted">{meta.explain}</span> : null}
    </span>
  );
}

export function ConditionBadge({ condition }: { condition: Condition }) {
  return <Badge variant="outline">{labelFor(CONDITIONS, condition)}</Badge>;
}

export function SourceBadge({ source }: { source: ListingSource }) {
  if (source === 'goods') return <Badge variant="zest">Dibs Goods</Badge>;
  if (source === 'consigned') return <Badge variant="zest">Sold by Dibs</Badge>;
  return null;
}
