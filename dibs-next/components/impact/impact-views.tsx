import { Leaf, Repeat } from 'lucide-react';
import { CATEGORIES } from '@/lib/config/app';
import { labelFor } from '@/lib/format';
import type { ImpactStats } from '@/lib/types';

export function ImpactTotals({ stats }: { stats: ImpactStats }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      <li className="flex flex-col gap-2 rounded-card border border-line bg-surface p-6">
        <Repeat className="h-5 w-5 text-success" aria-hidden />
        <span className="tabular font-display text-5xl font-extrabold leading-none">
          {stats.itemsKeptInUse.toLocaleString()}
        </span>
        <span className="text-muted">items kept in use</span>
      </li>
      <li className="flex flex-col gap-2 rounded-card border border-line bg-surface p-6">
        <Leaf className="h-5 w-5 text-success" aria-hidden />
        <span className="tabular font-display text-5xl font-extrabold leading-none">
          {stats.estimatedPounds.toLocaleString()} lbs
        </span>
        <span className="text-muted">kept out of landfill (estimated)</span>
      </li>
    </ul>
  );
}

/** Horizontal bars by category. Bar lengths are drawn relative to the largest value in the data returned. */
export function CategoryBars({ stats }: { stats: ImpactStats }) {
  const top = Math.max(1, ...stats.byCategory.map((c) => c.pounds));
  return (
    <figure className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <figcaption className="flex flex-col">
        <span className="font-display text-xl font-bold">Pounds kept out of landfill by category</span>
        <span className="text-sm text-muted">All pound figures are estimated.</span>
      </figcaption>
      <ul className="flex flex-col gap-3">
        {stats.byCategory.map((c) => (
          <li
            key={c.category}
            className="grid grid-cols-[minmax(0,7rem)_1fr] items-center gap-3 md:grid-cols-[10rem_1fr]"
          >
            <span className="truncate text-sm">{labelFor(CATEGORIES, c.category)}</span>
            <div className="flex min-w-0 flex-col gap-1 md:flex-row md:items-center md:gap-2">
              <div
                className="h-3 rounded-r-[4px] bg-success"
                style={{ width: `${(c.pounds / top) * 100}%`, minWidth: 4 }}
                aria-hidden
              />
              <span className="tabular whitespace-nowrap text-xs md:text-sm">
                {c.pounds.toLocaleString()} lbs (estimated) · {c.items.toLocaleString()} items
              </span>
            </div>
          </li>
        ))}
      </ul>
      <details className="text-sm">
        <summary className="min-h-[44px] cursor-pointer py-2 font-semibold">View as table</summary>
        <div className="overflow-x-auto">
          <table className="tabular mt-2 w-full">
            <thead>
              <tr className="text-left text-muted">
                <th scope="col" className="py-1">
                  Category
                </th>
                <th scope="col" className="py-1 text-right">
                  Items
                </th>
                <th scope="col" className="py-1 text-right">
                  Pounds (estimated)
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.byCategory.map((c) => (
                <tr key={c.category} className="border-t border-line">
                  <td className="py-1">{labelFor(CATEGORIES, c.category)}</td>
                  <td className="py-1 text-right">{c.items.toLocaleString()}</td>
                  <td className="py-1 text-right">{c.pounds.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
