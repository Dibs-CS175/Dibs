'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/field';
import { Sheet, SheetContent } from '@/components/ui/sheet';

/** Generic confirm sheet for destructive actions. */
export function ConfirmSheet({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  pendingLabel,
  onConfirm,
  pending,
  error,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  pendingLabel: string;
  onConfirm: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={title}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Keep it
            </Button>
            <Button variant="destructive" disabled={pending} onClick={onConfirm}>
              {pending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        }
      >
        <p>{body}</p>
        <div className="mt-3">
          <FormError message={error} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
