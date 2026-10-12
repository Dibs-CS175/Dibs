import * as React from 'react';
import { cn } from '@/lib/utils';

const NativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'min-h-[44px] w-full rounded-input border border-line bg-surface px-3 text-base text-ink disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
