import { HandCoins } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PROHIBITED_CATEGORIES } from '@/lib/config/app';
import { formatDate, formatMoney, formatPercent } from '@/lib/format';
import type { ConsignmentTerms } from '@/lib/types';

/** Consignment terms as the backend states them. Shown wherever a student marks an item to sell. */
export function ConsignmentTermsSummary({ terms }: { terms: ConsignmentTerms }) {
  return (
    <ul className="flex flex-col gap-1 text-sm">
      <li>
        You get <strong>{formatPercent(terms.ownerShareBps)}</strong> of the sale price. Dibs keeps{' '}
        {formatPercent(terms.commissionBps)} and is the seller.
      </li>
      <li>The buyer pays the Dibs Protect fee. It never comes out of your share.</li>
      <li>Minimum asking price: {formatMoney(terms.minAskingPriceCents)}.</li>
      <li>Buyers collect from the storage unit during set pickup windows. You don’t need to meet anyone.</li>
      <li>
        Listed until {formatDate(terms.listUntil, { month: 'long', day: 'numeric', year: 'numeric' })}.{' '}
        {terms.unsoldPolicy}
      </li>
      <li>{terms.damagePolicy}</li>
    </ul>
  );
}

export function ConsignmentTermsAgreement({
  terms,
  accepted,
  onAccept,
  showError,
}: {
  terms: ConsignmentTerms;
  accepted: boolean;
  onAccept: (v: boolean) => void;
  showError?: boolean;
}) {
  return (
    <section aria-labelledby="consign-h" className="flex flex-col gap-3 rounded-card bg-warning-bg p-4">
      <h3 id="consign-h" className="flex items-center gap-2 font-sans text-base font-bold text-rind">
        <HandCoins className="h-4 w-4" aria-hidden /> Selling with Dibs
      </h3>
      <ConsignmentTermsSummary terms={terms} />
      <p className="text-sm">
        <strong>Not accepted for sale:</strong>{' '}
        {PROHIBITED_CATEGORIES.map((p) => p.label.toLowerCase()).join(', ')}.
      </p>
      <div className="flex min-h-[44px] items-center gap-3">
        <Checkbox
          id="consign-accept"
          checked={accepted}
          onCheckedChange={(v) => onAccept(v === true)}
          aria-describedby="consign-msg"
        />
        <Label htmlFor="consign-accept">
          I agree to these terms, and nothing I’m selling is on the not-accepted list.
        </Label>
      </div>
      {showError && !accepted ? (
        <p id="consign-msg" role="alert" className="text-sm text-error">
          Agree to the terms to sell items, or switch them to Return in fall.
        </p>
      ) : null}
    </section>
  );
}
