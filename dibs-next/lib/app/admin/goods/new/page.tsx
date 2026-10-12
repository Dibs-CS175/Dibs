/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronLeft, ImagePlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Field, FormError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { intakeGoods } from '@/lib/actions/goods';
import { CATEGORIES } from '@/lib/config/app';
import { formatDate } from '@/lib/format';
import { useAction } from '@/lib/hooks';
import { errorMessage } from '@/lib/errorMessages';
import { useTimeZone } from '@/lib/campus';
import type { GoodsIntakeInput, GoodsItem } from '@/lib/types';

const MONEY_RE = /^\d+(\.\d{1,2})?$/;
const toCents = (v: string) => (v === '' ? null : Math.round(Number(v) * 100));

export default function GoodsIntakePage() {
  const tz = useTimeZone();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoodsIntakeInput['category']>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [serial, setSerial] = useState('');
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState<GoodsItem | null>(null);
  const intake = useAction(intakeGoods);

  const priceBad = price !== '' && !MONEY_RE.test(price);
  const costBad = cost !== '' && !MONEY_RE.test(cost);
  const valid = title.trim() !== '' && category !== '' && price !== '' && !priceBad && !costBad;

  if (saved) {
    return (
      <div
        className="flex max-w-[560px] flex-col gap-4 rounded-card border border-line bg-surface p-6"
        role="status"
      >
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
        <h1 className="text-3xl font-extrabold">{saved.title} recorded</h1>
        {saved.holdUntil ? (
          <p>
            Hold until{' '}
            <strong>
              {formatDate(saved.holdUntil, tz, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </strong>
            . It stays unlisted until then.
          </p>
        ) : (
          <p>No hold period. It can be listed now.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setSaved(null);
              setTitle('');
              setCategory('');
              setPhotos([]);
              setPrice('');
              setCost('');
              setSerial('');
              setTouched(false);
            }}
          >
            Add another
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/goods">Back to inventory</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Button asChild variant="link" className="w-fit px-0">
        <Link href="/admin/goods">
          <ChevronLeft className="h-4 w-4" aria-hidden /> Inventory
        </Link>
      </Button>
      <PageHeader
        title="New Goods intake"
        subtitle="Record what came in. The hold-until date comes back after saving."
      />
      <form
        noValidate
        className="flex max-w-[640px] flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setTouched(true);
          if (!valid) return;
          const r = await intake.run({
            title,
            category,
            photos,
            priceCents: toCents(price),
            costCents: toCents(cost),
            serialNumber: serial.trim(),
          });
          if (r?.ok) setSaved(r.data);
        }}
      >
        <Field id="g-title" label="Title" error={touched && !title.trim() ? 'Add a title.' : null}>
          <Input
            id="g-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={touched && !title.trim()}
            aria-describedby="g-title-msg"
          />
        </Field>
        <Field id="g-cat" label="Category" error={touched && !category ? 'Pick a category.' : null}>
          <NativeSelect
            id="g-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value as GoodsIntakeInput['category'])}
            aria-describedby="g-cat-msg"
          >
            <option value="">Choose…</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Photos</span>
          <div className="flex flex-wrap items-center gap-2">
            {photos.map((p, i) => (
              <img key={p} src={p} alt={`Photo ${i + 1}`} className="h-20 w-20 rounded-input object-cover" />
            ))}
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-input border border-line bg-surface px-4 text-sm font-semibold hover:bg-sunk has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-navel">
              <ImagePlus className="h-4 w-4" aria-hidden /> Add photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  setPhotos([
                    ...photos,
                    ...Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)),
                  ]);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="g-price"
            label="Resale price ($)"
            error={priceBad ? 'Enter an amount like 15 or 15.50.' : touched && !price ? 'Add a price.' : null}
          >
            <Input
              id="g-price"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              aria-invalid={priceBad}
              aria-describedby="g-price-msg"
              className="tabular"
            />
          </Field>
          <Field
            id="g-cost"
            label="Acquisition cost ($)"
            hint="Optional."
            error={costBad ? 'Enter an amount like 4 or 4.25.' : null}
          >
            <Input
              id="g-cost"
              inputMode="decimal"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              aria-invalid={costBad}
              aria-describedby="g-cost-msg"
              className="tabular"
            />
          </Field>
        </div>
        <Field id="g-serial" label="Serial number" hint="Optional. Record it for electronics and bikes.">
          <Input
            id="g-serial"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            aria-describedby="g-serial-msg"
          />
        </Field>
        <FormError
          message={
            intake.error
              ? errorMessage(intake.error, { VALIDATION: 'Check the fields and try again.' })
              : null
          }
        />
        <Button type="submit" className="w-fit" disabled={intake.pending}>
          {intake.pending ? 'Saving…' : 'Record intake'}
        </Button>
      </form>
    </>
  );
}
