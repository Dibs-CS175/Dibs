'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
SheetOverlay.displayName = 'SheetOverlay';

type Side = 'bottom' | 'right';

/** Bottom sheet on phones; on md+ the `right` side becomes a side panel and `bottom` a centered dialog. */
const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: Side;
    title: string;
    description?: string;
    footer?: React.ReactNode;
  }
>(({ side = 'bottom', className, children, title, description, footer, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 flex max-h-[90dvh] flex-col bg-surface text-ink shadow-2 duration-320 data-[state=open]:animate-in data-[state=closed]:animate-out',
        'inset-x-0 bottom-0 rounded-t-sheet data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        side === 'right'
          ? 'md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-[420px] md:rounded-none md:rounded-l-sheet md:data-[state=closed]:slide-out-to-right md:data-[state=open]:slide-in-from-right'
          : 'md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[520px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-sheet md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2 md:px-6">
        <DialogPrimitive.Title className="font-display text-xl font-bold">{title}</DialogPrimitive.Title>
        <DialogPrimitive.Close
          className="grid h-11 w-11 place-items-center rounded-full hover:bg-sunk"
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden />
        </DialogPrimitive.Close>
      </div>
      {description ? (
        <DialogPrimitive.Description className="px-4 pt-3 text-sm text-muted md:px-6">
          {description}
        </DialogPrimitive.Description>
      ) : (
        <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">{children}</div>
      {footer ? (
        <div className="border-t border-line px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-6">
          {footer}
        </div>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';

export { Sheet, SheetTrigger, SheetClose, SheetContent };
