import { TriangleAlert } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { PROHIBITED_CATEGORIES } from '@/lib/config/app';

/** Lists items Dibs does not allow. The seller confirms before continuing. */
export function ProhibitedNotice({
  confirmed,
  onConfirm,
}: {
  confirmed: boolean;
  onConfirm: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card bg-warning-bg p-4">
      <p className="flex items-center gap-2 font-semibold text-rind">
        <TriangleAlert className="h-4 w-4" aria-hidden /> Not allowed on Dibs
      </p>
      <ul className="grid gap-1 text-sm md:grid-cols-2">
        {PROHIBITED_CATEGORIES.map((p) => (
          <li key={p.id}>
            <strong>{p.label}.</strong> {p.reason}
          </li>
        ))}
      </ul>
      {/* The whole row is the label, so the tap target is 44 px tall, not just the 20 px box. */}
      <label
        htmlFor="not-prohibited"
        className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-ink"
      >
        <Checkbox id="not-prohibited" checked={confirmed} onCheckedChange={(v) => onConfirm(v === true)} />
        My item is not on this list
      </label>
    </div>
  );
}
