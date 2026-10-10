import { Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import type { PayoutMethod } from '@/lib/types';

/** Where consignment payouts go. Setup happens with the payment provider; Dibs never sees account numbers. */
export function PayoutMethodCard({
  method,
  onSetup,
  pending,
  error,
}: {
  method: PayoutMethod;
  onSetup: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <section
      aria-labelledby="payout-h"
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
    >
      <h3 id="payout-h" className="flex items-center gap-2 font-sans text-base font-bold">
        <Landmark className="h-4 w-4" aria-hidden /> Payout method
      </h3>
      {method.status === 'set' ? (
        <p>
          Payouts go to <strong>{method.label}</strong>.
        </p>
      ) : (
        <p className="text-sm">Add a payout method so we can pay you when your items sell.</p>
      )}
      <FormError message={error} />
      <Button
        variant={method.status === 'set' ? 'secondary' : 'default'}
        className="w-fit"
        disabled={pending}
        onClick={onSetup}
      >
        {pending ? 'Opening…' : method.status === 'set' ? 'Change payout method' : 'Set up payouts'}
      </Button>
    </section>
  );
}
