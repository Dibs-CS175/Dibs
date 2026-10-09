'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, Clock, Send } from 'lucide-react';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { QUICK_REPLIES } from '@/lib/config/app';
import { formatMoney, formatTime } from '@/lib/format';
import type { Thread } from '@/lib/types';
import { cn } from '@/lib/utils';

export type DeliveryState = 'sending' | 'sent' | 'failed';
export interface ShownMessage {
  key: string;
  body: string;
  mine: boolean;
  at: string;
  delivery?: DeliveryState;
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

export function MessageList({ items, onRetry }: { items: ShownMessage[]; onRetry: (key: string) => void }) {
  const end = useRef<HTMLLIElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [items.length]);
  return (
    <ol className="flex flex-col gap-2" aria-live="polite" aria-relevant="additions text">
      {items.map((m) => (
        <li key={m.key} className={cn('flex flex-col gap-0.5', m.mine ? 'items-end' : 'items-start')}>
          <span
            className={cn(
              'max-w-[80%] whitespace-pre-wrap break-words rounded-sheet px-3 py-2',
              m.mine ? 'rounded-br-sm bg-grove text-on-grove' : 'rounded-bl-sm bg-surface ring-1 ring-line',
            )}
          >
            {m.body}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            {formatTime(m.at)}
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

export function Composer({ onSend, disabled }: { onSend: (body: string) => void; disabled: boolean }) {
  const [body, setBody] = useState('');
  const send = (text: string) => {
    if (!text.trim()) return;
    onSend(text.trim());
    setBody('');
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
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
