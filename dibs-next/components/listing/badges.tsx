import { BadgeCheck, Building2, Leaf, TriangleAlert } from 'lucide-react';
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

/**
 * Shown next to a name when the account was verified with a campus email.
 * Renders nothing for unverified accounts, so screens can pass `verified` straight from the user.
 * `label` adds the words (profile header); without it the icon carries an aria-label.
 */
export function VerifiedBadge({
  verified,
  label,
  size = 'md',
}: {
  verified: boolean;
  label?: string;
  size?: 'sm' | 'md';
}) {
  if (!verified) return null;
  const icon = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  if (label) {
    return (
      <span className="inline-flex items-center gap-1 text-success">
        <BadgeCheck className={`${icon} shrink-0`} aria-hidden /> {label}
      </span>
    );
  }
  return <BadgeCheck className={`${icon} shrink-0 text-success`} role="img" aria-label="Verified student" />;
}

export function SourceBadge({ source }: { source: ListingSource }) {
  if (source === 'goods') return <Badge variant="zest">Dibs Goods</Badge>;
  return null;
}
