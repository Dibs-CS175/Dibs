'use client';

import { useState } from 'react';
import { CheckCircle2, LinkIcon, ShieldCheck } from 'lucide-react';
import { QuoteLines } from '@/components/listing/quote-lines';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import { payAsParent } from '@/lib/actions/summerHold';
import { errorMessage } from '@/lib/errorMessages';
import { useAction, useQuery } from '@/lib/hooks';
import { getParentPayView } from '@/lib/queries/summerHold';
import type { ParentPayView } from '@/lib/types';

/** Public page a parent opens from a pay link. No sign-in. */
export default function ParentPayPage({ params }: { params: { token: string } }) {
  const { state, retry } = useQuery(() => getParentPayView(params.token), [params.token]);
  const pay = useAction(payAsParent);
  const [done, setDone] = useState<ParentPayView | null>(null);

  if (state.status === 'loading') return <PageSkeleton />;
  if (state.status === 'error') {
    return (
      <div className="container max-w-[640px] py-16">
        {state.error.code === 'NOT_FOUND' ? (
          <EmptyState
            icon={LinkIcon}
            text="This pay link isn’t valid. Ask the student to send a new one."
            actionLabel="Go to Dibs"
            href="/"
          />
        ) : (
          <ErrorState message={errorMessage(state.error)} onRetry={retry} />
        )}
      </div>
    );
  }

  const v = done ?? state.data;
  return (
    <div className="container flex max-w-[640px] flex-col gap-6 py-10 md:py-16">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-rind">Summer Hold · {v.campusName}</p>
        <h1 className="text-3xl font-extrabold md:text-4xl">Pay for {v.studentFirstName}’s Summer Hold</h1>
        <p className="text-muted">
          {v.studentFirstName} is storing {v.standardCount} standard and {v.largeCount} large items over
          summer
          {v.fullService ? ', with Full Service packing' : ''}.
        </p>
      </div>
      <QuoteLines quote={v.quote} />
      {v.paid ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-card bg-success-bg p-4 font-semibold text-success"
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden /> Paid. Thank you. {v.studentFirstName} will get a
          confirmation email.
        </p>
      ) : (
        <>
          <p className="flex items-start gap-2 text-sm text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> Dibs Protect holds
            the payment for the booking.
          </p>
          <FormError
            message={
              pay.error
                ? errorMessage(pay.error, { NOT_FOUND: 'This pay link expired. Ask for a new one.' })
                : null
            }
          />
          <Button
            size="lg"
            variant="dibs"
            disabled={pay.pending}
            onClick={async () => {
              const r = await pay.run(v);
              if (r?.ok) setDone(r.data);
            }}
          >
            {pay.pending ? 'Paying…' : 'Pay now'}
          </Button>
        </>
      )}
    </div>
  );
}
