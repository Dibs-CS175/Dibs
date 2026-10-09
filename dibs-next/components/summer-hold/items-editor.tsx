'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import type { ItemSize, StorageItemInput } from '@/lib/types';

/** Add, rename and size items. Standard fits in a box or bin; large is furniture, bikes and similar. */
export function ItemsEditor({
  items,
  onChange,
  showErrors,
}: {
  items: StorageItemInput[];
  onChange: (i: StorageItemInput[]) => void;
  showErrors?: boolean;
}) {
  const update = (i: number, patch: Partial<StorageItemInput>) =>
    onChange(items.map((it, n) => (n === i ? { ...it, ...patch } : it)));
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {items.map((it, i) => {
          const missing = showErrors && !it.label.trim();
          return (
            <li key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label htmlFor={`item-${i}`} className="sr-only">
                  Item {i + 1} name
                </label>
                <Input
                  id={`item-${i}`}
                  value={it.label}
                  placeholder="e.g. Box of books"
                  onChange={(e) => update(i, { label: e.target.value })}
                  aria-invalid={missing}
                  className="min-w-0 flex-1"
                />
                <label htmlFor={`size-${i}`} className="sr-only">
                  Item {i + 1} size
                </label>
                <NativeSelect
                  id={`size-${i}`}
                  value={it.size}
                  onChange={(e) => update(i, { size: e.target.value as ItemSize })}
                  className="w-[120px]"
                >
                  <option value="standard">Standard</option>
                  <option value="large">Large</option>
                </NativeSelect>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove item ${i + 1}`}
                  disabled={items.length === 1}
                  onClick={() => onChange(items.filter((_, n) => n !== i))}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              {missing ? (
                <p role="alert" className="text-sm text-error">
                  Name this item.
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Button
        variant="secondary"
        className="w-fit"
        onClick={() => onChange([...items, { label: '', size: 'standard' }])}
      >
        <Plus className="h-4 w-4" aria-hidden /> Add item
      </Button>
      <p className="text-sm text-muted">
        Standard: fits in a box or bin. Large: furniture, bikes, mini-fridges.
      </p>
    </div>
  );
}
