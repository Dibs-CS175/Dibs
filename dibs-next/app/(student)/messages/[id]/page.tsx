'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import {
  Composer,
  MeetupSheet,
  MessageList,
  PinnedListing,
  SoldBanner,
  type ShownMessage,
} from '@/components/messages/thread-view';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { acceptMeetup, proposeMeetup, sendMessage } from '@/lib/actions/messages';
import { errorMessage } from '@/lib/errorMessages';
import { shortName } from '@/lib/format';
import { useQuery } from '@/lib/hooks';
import { getMeetupSpots } from '@/lib/queries/campus';
import { getThread } from '@/lib/queries/messages';
import { ok } from '@/lib/result';
import type { MeetupSpot, Message } from '@/lib/types';

interface Outgoing {
  key: string;
  body: string;
  at: string;
  delivery: 'sending' | 'sent' | 'failed';
  /** Meetup proposals keep their spot and time so Retry can resend them. */
  meetup?: { spotId: string; time: string };
}

export default function ThreadPage({ params }: { params: { id: string } }) {
  const { state, retry } = useQuery(() => getThread(params.id), [params.id]);
  const campusId = state.status === 'data' ? state.data.campusId : null;
  const spots = useQuery(
    () => (campusId ? getMeetupSpots(campusId) : Promise.resolve(ok<MeetupSpot[]>([]))),
    [campusId],
  );
  const [outgoing, setOutgoing] = useState<Outgoing[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [meetupOpen, setMeetupOpen] = useState(false);
  const [acceptingKey, setAcceptingKey] = useState<string | null>(null);

  // Each message sends on its own so several can be in flight; a failed one keeps its content for Retry.
  const deliver = async (m: Outgoing) => {
    setOutgoing((o) => o.map((x) => (x.key === m.key ? { ...x, delivery: 'sending' } : x)));
    const r = m.meetup
      ? await proposeMeetup(params.id, m.meetup.spotId, m.meetup.time)
      : await sendMessage(params.id, m.body);
    setOutgoing((o) =>
      o.map((x) =>
        x.key === m.key
          ? { ...x, delivery: r.ok ? 'sent' : 'failed', at: r.ok ? r.data.createdAt : x.at }
          : x,
      ),
    );
  };

  const queue = (m: Omit<Outgoing, 'key' | 'at' | 'delivery'>) => {
    const item: Outgoing = {
      ...m,
      key: `local-${Date.now()}-${outgoing.length}`,
      at: new Date().toISOString(),
      delivery: 'sending',
    };
    setOutgoing((o) => [...o, item]);
    void deliver(item);
  };

  if (state.status === 'loading') {
    return (
      <div className="container max-w-[760px] py-8">
        <ListSkeleton rows={6} />
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="container max-w-[760px] py-16">
        {state.error.code === 'NOT_FOUND' ? (
          <EmptyState
            icon={MessageCircle}
            text="This conversation is gone."
            actionLabel="Back to messages"
            href="/messages"
          />
        ) : (
          <ErrorState message={errorMessage(state.error)} onRetry={retry} />
        )}
      </div>
    );
  }

  const t = state.data;
  const spotList = spots.state.status === 'data' ? spots.state.data : [];
  const spotName = (id?: string) => spotList.find((s) => s.id === id)?.name ?? 'Meetup spot';
  const shown = (m: Message): ShownMessage => ({
    key: m.id,
    body: m.body,
    mine: m.senderId === t.viewerId,
    at: m.createdAt,
    meetup:
      m.kind === 'meetup_proposal' && m.meetupTime
        ? {
            spotName: spotName(m.meetupSpotId),
            time: m.meetupTime,
            accepted: t.acceptedProposalIds.includes(m.id) || accepted.includes(m.id),
          }
        : undefined,
  });
  const items: ShownMessage[] = [
    ...t.messages.map(shown),
    ...outgoing.map((m) => ({
      key: m.key,
      body: m.body,
      mine: true,
      at: m.at,
      delivery: m.delivery,
      meetup: m.meetup
        ? { spotName: spotName(m.meetup.spotId), time: m.meetup.time, accepted: false }
        : undefined,
    })),
  ];

  return (
    <div className="container flex min-h-[calc(100dvh-var(--header-h))] max-w-[760px] flex-col gap-3 py-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Back to messages">
          <Link href="/messages">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">{shortName(t.otherUser)}</h1>
      </div>
      <div className="sticky top-[var(--header-h)] z-10 -mx-4 bg-peel px-4 py-2">
        <PinnedListing listing={t.listing} />
      </div>
      {t.listingSold ? <SoldBanner /> : null}
      <div className="flex-1 py-2">
        {items.length === 0 ? (
          <p className="py-10 text-center text-muted">Say hi. Ask a question or suggest a meetup spot.</p>
        ) : (
          <MessageList
            items={items}
            acceptingKey={acceptingKey}
            onRetry={(key) => {
              const m = outgoing.find((x) => x.key === key);
              if (m) void deliver(m);
            }}
            onAccept={async (key) => {
              setAcceptingKey(key);
              const r = await acceptMeetup(key);
              setAcceptingKey(null);
              if (r.ok) {
                setAccepted((a) => [...a, key]);
                toast.success('Meetup accepted');
              } else {
                toast.error(errorMessage(r.error, { CONFLICT: 'A newer suggestion replaced this one.' }));
              }
            }}
          />
        )}
      </div>
      <div className="sticky bottom-0 -mx-4 border-t border-line bg-peel px-4 py-3">
        <Composer
          onSend={(body) => queue({ body })}
          onSuggestMeetup={() => setMeetupOpen(true)}
          disabled={t.listingSold}
        />
      </div>
      <MeetupSheet
        open={meetupOpen}
        onOpenChange={setMeetupOpen}
        spots={spots.state}
        onRetrySpots={spots.retry}
        pending={false}
        onPropose={(spotId, time) => {
          setMeetupOpen(false);
          queue({ body: 'Suggested a meetup', meetup: { spotId, time } });
        }}
      />
    </div>
  );
}
