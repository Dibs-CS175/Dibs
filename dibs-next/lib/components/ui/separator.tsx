import { cn } from '@/lib/utils';

function Separator({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-line', className)} />;
}

export { Separator };
