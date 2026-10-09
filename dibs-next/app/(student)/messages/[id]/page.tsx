'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, MessageCircle } from 'lucide-react';
import {
  Composer,
  MessageList,
  PinnedListing,
  SoldBanner,
  type ShownMessage,
} from '@/components/messages/thread-view';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { Button } from '@/components/ui/button';
import { sendMessage } from '@/lib/actions/messages';
import { shortName } from '@/lib/format';
import { useQuery } from '@/lib/hooks';
import { getThread } from '@/lib/queries/messages';

interface Outgoing {
  key: string;
  body: string;
  at: string;
  delivery: 'sending' | 'sent' | 'failed';
}

export default function ThreadPage({ params }: { params: { id: string } }) {
  const { state, retry } = useQuery(() => getThread(params.id), [params.id]);
  const [outgoing, setOutgoing] = useState<Outgoing[]>([]);

  // Each message sends on its own so several can be in flight; a failed one keeps its text for Retry.
  const deliver = async (key: string, body: string) => {
    setOutgoing((o) => o.map((m) => (m.key === key ? { ...m, delivery: 'sending' } : m)));
    const r = await sendMessage(params.id, body);
    setOutgoing((o) =>
      o.map((m) =>
        m.key === key ? { ...m, delivery: r.ok ? 'sent' : 'failed', at: r.ok ? r.data.createdAt : m.at } : m,
      ),
    );
  };

  const send = (body: string) => {
    const key = `local-${Date.now()}-${outgoing.length}`;
    setOutgoing((o) => [...o, { key, body, at: new Date().toISOString(), delivery: 'sending' }]);
    void deliver(key, body);
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
          <ErrorState message={state.error.message} onRetry={retry} />
        )}
      </div>
    );
  }

  const t = state.data;
  const items: ShownMessage[] = [
    ...t.messages.map((m) => ({ key: m.id, body: m.body, mine: m.senderId === t.viewerId, at: m.createdAt })),
    ...outgoing.map((m) => ({ key: m.key, body: m.body, mine: true, at: m.at, delivery: m.delivery })),
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
      <PinnedListing listing={t.listing} />
      {t.listingSold ? <SoldBanner /> : null}
      <div className="flex-1 py-2">
        {items.length === 0 ? (
          <p className="py-10 text-center text-muted">Say hi. Ask a question or suggest a meetup spot.</p>
        ) : (
          <MessageList
            items={items}
            onRetry={(key) => {
              const m = outgoing.find((x) => x.key === key);
              if (m) void deliver(key, m.body);
            }}
          />
        )}
      </div>
      <div className="sticky bottom-0 -mx-4 border-t border-line bg-peel px-4 py-3">
        <Composer onSend={send} disabled={t.listingSold} />
      </div>
    </div>
  );
}
