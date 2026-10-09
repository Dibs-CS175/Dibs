import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-input font-semibold transition-colors duration-200 ease-dibs disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:brightness-110',
        dibs: 'bg-navel text-on-accent hover:brightness-105',
        secondary: 'border border-line bg-surface text-ink hover:bg-sunk',
        ghost: 'text-ink hover:bg-sunk',
        destructive: 'border border-line bg-surface text-error hover:bg-error-bg',
        link: 'text-rind underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-[44px] px-4 text-base',
        sm: 'min-h-[44px] px-3 text-sm',
        lg: 'min-h-[52px] px-6 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={asChild ? undefined : (type ?? 'button')}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
