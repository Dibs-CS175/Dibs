'use client';

import Link from 'next/link';
import { ListingPhoto } from '@/components/listing/listing-photo';
import { shortName, timeAgo } from '@/lib/format';
import type { ConversationSummary } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTimeZone } from '@/lib/campus';

export function ConversationRow({ summary }: { summary: ConversationSummary }) {
  const tz = useTimeZone();
  const { conversation: c, listing, otherUser, lastMessagePreview } = summary;
  const unread = c.unreadCount > 0;
  return (
    <Link
      href={`/messages/${c.id}`}
      className="flex items-center gap-3 rounded-card border border-line bg-surface p-3 hover:bg-sunk"
    >
      <ListingPhoto
        src={listing.photos[0] ?? 'ph:Package:0'}
        alt=""
        className="h-14 w-14 shrink-0 rounded-input"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cn('truncate', unread ? 'font-bold' : 'font-semibold')}>
            {shortName(otherUser)}
          </span>
          <span className="shrink-0 text-xs text-muted">{timeAgo(c.lastMessageAt, tz)}</span>
        </div>
        <span className="truncate text-sm text-muted">{listing.title}</span>
        <span className={cn('truncate text-sm', unread ? 'font-semibold text-ink' : 'text-muted')}>
          {lastMessagePreview}
        </span>
      </div>
      {unread ? (
        <span
          className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-navel px-1.5 text-xs font-bold text-on-accent"
          aria-label={`${c.unreadCount} unread`}
        >
          {c.unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
