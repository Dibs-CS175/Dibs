/* eslint-disable @next/next/no-img-element */
import { NamedIcon } from '@/components/icon';
import { cn } from '@/lib/utils';

const TINTS = ['#f1ece3', '#e8eee9', '#efe8ef', '#f4ebdd', '#e5ecef', '#eeeee4'];

/**
 * Shows a listing photo. Fixture photos use `ph:<Icon>:<n>` keys, drawn as a neutral product-style
 * placeholder on a light backdrop. Real URLs render as images.
 */
export function ListingPhoto({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (!src.startsWith('ph:')) {
    return <img src={src} alt={alt} className={cn('object-cover', className)} />;
  }
  const [, icon = 'Package', n = '0'] = src.split(':');
  const i = Number(n) || 0;
  const transform = ['none', 'rotate(-10deg) scale(.9)', 'scale(1.6) translate(8%, 6%)'][i % 3];
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn('relative overflow-hidden', className)}
      style={{ background: TINTS[(icon.length + i) % TINTS.length] }}
    >
      <div className="absolute inset-x-[18%] bottom-[14%] h-[6%] rounded-[50%] bg-black/10 blur-md" />
      <div className="absolute inset-0 grid place-items-center" style={{ transform }}>
        <NamedIcon name={icon} strokeWidth={1.1} className="h-[46%] w-[46%] text-[#33443a]" />
      </div>
    </div>
  );
}
