'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CalendarClock, Check, Clock, MapPin, Send } from 'lucide-react';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { QUICK_REPLIES } from '@/lib/config/app';
import { formatDateTime, formatMoney, formatTime } from '@/lib/format';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormError } from '@/components/ui/field';
import type { MeetupSpot } from '@/lib/types';
import type { Thread } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTimeZone } from '@/lib/campus';

export type DeliveryState = 'sending' | 'sent' | 'failed';
export interface ShownMessage {
  key: string;
  body: string;
  mine: boolean;
  at: string;
  delivery?: DeliveryState;
  /** Present for meetup proposals. */
  meetup?: { spotName: string; time: string; accepted: boolean };
}

export function PinnedListing({ listing }: { listing: Thread['listing'] }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex items-center gap-3 rounded-card border border-line bg-surface p-2 pr-4 hover:bg-sunk"
    >
      <ListingPhoto
        src={listing.photos[0] ?? 'ph:Package:0'}
        alt=""
        className="h-12 w-12 shrink-0 rounded-input"
      />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{listing.title}</span>
      <span className="tabular shrink-0 font-semibold">
        {listing.priceCents === 0 ? 'Free' : formatMoney(listing.priceCents)}
      </span>
    </Link>
  );
}

export function SoldBanner() {
  return (
    <p role="status" className="rounded-card bg-warning-bg px-4 py-3 text-sm font-semibold text-rind">
      This item sold. You can still read the conversation.
    </p>
  );
}

export function MessageList({
  items,
  onRetry,
  onAccept,
  acceptingKey,
}: {
  items: ShownMessage[];
  onRetry: (key: string) => void;
  onAccept: (key: string) => void;
  acceptingKey: string | null;
}) {
  const tz = useTimeZone();
  const end = useRef<HTMLLIElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [items.length]);
  return (
    <ol className="flex flex-col gap-2" aria-live="polite" aria-relevant="additions text">
      {items.map((m) => (
        <li key={m.key} className={cn('flex flex-col gap-0.5', m.mine ? 'items-end' : 'items-start')}>
          {m.meetup ? (
            <div className="flex max-w-[85%] flex-col gap-2 rounded-sheet bg-surface p-3 ring-2 ring-navel">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 shrink-0 text-rind" aria-hidden /> Meetup suggested
              </span>
              <span className="font-semibold">{m.meetup.spotName}</span>
              <span className="text-sm">{formatDateTime(m.meetup.time, tz)}</span>
              {m.meetup.accepted ? (
                <span className="flex items-center gap-1 text-sm font-semibold text-success">
                  <Check className="h-4 w-4" aria-hidden /> Accepted
                </span>
              ) : !m.mine ? (
                <Button
                  size="sm"
                  className="w-fit"
                  disabled={acceptingKey === m.key}
                  onClick={() => onAccept(m.key)}
                >
                  {acceptingKey === m.key ? 'Accepting…' : 'Accept'}
                </Button>
              ) : (
                <span className="text-sm text-muted">Waiting for a reply</span>
              )}
            </div>
          ) : (
            <span
              className={cn(
                'max-w-[80%] whitespace-pre-wrap break-words rounded-sheet px-3 py-2',
                m.mine ? 'rounded-br-sm bg-grove text-on-grove' : 'rounded-bl-sm bg-surface ring-1 ring-line',
              )}
            >
              {m.body}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted">
            {formatTime(m.at, tz)}
            {m.delivery === 'sending' ? (
              <>
                <Clock className="h-3 w-3" aria-hidden /> Sending
              </>
            ) : m.delivery === 'sent' ? (
              <>
                <Check className="h-3 w-3" aria-hidden /> Sent
              </>
            ) : m.delivery === 'failed' ? (
              <span className="flex items-center gap-1 text-error">
                <AlertCircle className="h-3 w-3" aria-hidden /> Not sent
                <Button
                  variant="link"
                  size="sm"
                  className="min-h-[44px] px-1 text-error"
                  onClick={() => onRetry(m.key)}
                >
                  Retry
                </Button>
              </span>
            ) : null}
          </span>
        </li>
      ))}
      <li ref={end} aria-hidden />
    </ol>
  );
}

export function Composer({
  onSend,
  onSuggestMeetup,
  disabled,
}: {
  onSend: (body: string) => void;
  onSuggestMeetup: () => void;
  disabled: boolean;
}) {
  const [body, setBody] = useState('');
  const send = (text: string) => {
    if (!text.trim()) return;
    onSend(text.trim());
    setBody('');
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 rounded-full"
          disabled={disabled}
          onClick={onSuggestMeetup}
        >
          <CalendarClock className="h-4 w-4" aria-hidden /> Suggest a meetup
        </Button>
        {QUICK_REPLIES.map((q) => (
          <Button
            key={q}
            variant="secondary"
            size="sm"
            className="shrink-0 rounded-full"
            disabled={disabled}
            onClick={() => send(q)}
          >
            {q}
          </Button>
        ))}
      </div>
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(body);
        }}
      >
        <label htmlFor="composer" className="sr-only">
          Message
        </label>
        <Textarea
          id="composer"
          rows={1}
          value={body}
          disabled={disabled}
          placeholder={disabled ? 'This conversation is closed' : 'Write a message'}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(body);
            }
          }}
          className="max-h-32 min-h-[44px] flex-1 resize-none"
        />
        <Button type="submit" size="icon" aria-label="Send" disabled={disabled || !body.trim()}>
          <Send className="h-5 w-5" aria-hidden />
        </Button>
      </form>
    </div>
  );
}

/** Pick a public meetup spot and a time. Spots come from getMeetupSpots for the campus. */
export function MeetupSheet({
  open,
  onOpenChange,
  spots,
  onPropose,
  pending,
  error,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  spots: MeetupSpot[];
  onPropose: (spotId: string, isoTime: string) => void;
  pending: boolean;
  error: string | null;
}) {
  const [spotId, setSpotId] = useState<string | null>(null);
  const [time, setTime] = useState('');
  const valid = spotId !== null && time !== '' && !Number.isNaN(new Date(time).getTime());
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title="Suggest a meetup"
        footer={
          <Button
            className="w-full"
            disabled={!valid || pending}
            onClick={() => valid && onPropose(spotId, new Date(time).toISOString())}
          >
            {pending ? 'Sending…' : 'Send suggestion'}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 font-semibold">Public spot</legend>
            <div className="flex flex-wrap gap-2">
              {spots.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={spotId === s.id}
                  onClick={() => setSpotId(s.id)}
                  className={cn(
                    'min-h-[44px] rounded-full border px-4 text-left text-sm font-semibold',
                    spotId === s.id ? 'border-grove bg-grove text-on-grove' : 'border-line bg-surface',
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {spotId ? (
              <p className="text-sm text-muted">{spots.find((s) => s.id === spotId)?.description}</p>
            ) : null}
          </fieldset>
          <div className="flex flex-col gap-1">
            <Label htmlFor="meetup-time">Day and time</Label>
            <Input
              id="meetup-time"
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <FormError message={error} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
