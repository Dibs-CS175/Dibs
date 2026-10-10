/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatMoney } from '@/lib/format';
import { Camera, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FormError } from '@/components/ui/field';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import type { BinView, StorageItem } from '@/lib/types';

export interface CheckInValues {
  photo?: string;
  note: string;
  binId: string;
}

const STATUS_LABEL: Record<StorageItem['status'], string> = {
  pending: 'Waiting',
  checked_in: 'Checked in',
  stored: 'Stored',
  returned: 'Returned',
  refused: 'Refused',
  damaged: 'Damaged',
};

/** One item at check-in: condition photo, note and bin. Full bins are disabled. */
export function CheckInItem({
  item,
  bins,
  onCheckIn,
  onRefuse,
  onDamaged,
  pending,
  error,
}: {
  item: StorageItem;
  bins: BinView[];
  onCheckIn: (v: CheckInValues) => void;
  onRefuse: (reason: string) => void;
  onDamaged: (note: string) => void;
  pending: boolean;
  error: string | null;
}) {
  const [photo, setPhoto] = useState<string | undefined>(item.conditionPhoto);
  const [note, setNote] = useState(item.conditionNote ?? '');
  const [binId, setBinId] = useState(item.binId ?? '');
  const [touched, setTouched] = useState(false);
  const closed = item.status !== 'pending';
  const id = item.id;

  return (
    <article
      className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4"
      aria-labelledby={`${id}-h`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id={`${id}-h`} className="font-sans text-lg font-bold">
          {item.label} <span className="text-sm font-normal text-muted">({item.size})</span>
        </h3>
        <span className="flex flex-wrap justify-end gap-1">
          {item.disposition === 'sell' ? (
            <Badge variant="zest">
              Sell{item.askingPriceCents !== undefined ? ` · ${formatMoney(item.askingPriceCents)}` : ''}
            </Badge>
          ) : null}
          <Badge
            variant={
              item.status === 'checked_in' ? 'success' : item.status === 'pending' ? 'outline' : 'error'
            }
          >
            {STATUS_LABEL[item.status]}
          </Badge>
        </span>
      </div>

      {closed ? (
        <p className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
          {item.status === 'checked_in'
            ? `In bin ${bins.find((b) => b.id === item.binId)?.label ?? ''}.`
            : item.conditionNote}
          {item.status === 'checked_in' && item.disposition === 'sell' ? (
            <Link href="/admin/consignment" className="font-semibold text-rind">
              Create its listing
            </Link>
          ) : null}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Condition photo</span>
            <div className="flex items-center gap-3">
              {photo ? (
                <img
                  src={photo}
                  alt={`Condition photo of ${item.label}`}
                  className="h-20 w-20 rounded-input object-cover"
                />
              ) : (
                <span className="grid h-20 w-20 place-items-center rounded-input bg-sunk text-muted">
                  <Camera className="h-6 w-6" aria-hidden />
                </span>
              )}
              <label className="inline-flex min-h-[44px] cursor-pointer items-center rounded-input border border-line px-4 text-sm font-semibold hover:bg-sunk has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-navel">
                {photo ? 'Retake photo' : 'Take photo'}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setPhoto(URL.createObjectURL(f));
                  }}
                />
              </label>
            </div>
          </div>
          <Field
            id={`${id}-note`}
            label="Condition note"
            hint="Scratches, missing parts, anything worth recording."
          >
            <Textarea
              id={`${id}-note`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              aria-describedby={`${id}-note-msg`}
            />
          </Field>
          <Field id={`${id}-bin`} label="Bin" error={touched && !binId ? 'Pick a bin.' : null}>
            <NativeSelect
              id={`${id}-bin`}
              value={binId}
              onChange={(e) => setBinId(e.target.value)}
              aria-describedby={`${id}-bin-msg`}
              aria-invalid={touched && !binId}
            >
              <option value="">Choose a bin…</option>
              {bins.map((b) => (
                <option key={b.id} value={b.id} disabled={b.isFull}>
                  {b.label} · {b.unit}
                  {b.isFull ? ' (full)' : ` (${b.used}/${b.capacity})`}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <FormError message={error} />
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={pending}
              onClick={() => {
                setTouched(true);
                if (binId) onCheckIn({ photo, note, binId });
              }}
            >
              {pending ? 'Saving…' : 'Check in'}
            </Button>
            <Button
              variant="secondary"
              disabled={pending || !note.trim()}
              onClick={() => onDamaged(note)}
              title={!note.trim() ? 'Add a condition note first' : undefined}
            >
              Mark damaged
            </Button>
            <Button
              variant="destructive"
              disabled={pending || !note.trim()}
              onClick={() => onRefuse(note)}
              title={!note.trim() ? 'Add a reason in the note first' : undefined}
            >
              Refuse
            </Button>
          </div>
          <p className="text-xs text-muted">Mark damaged and Refuse use the note as the reason.</p>
        </>
      )}
    </article>
  );
}
