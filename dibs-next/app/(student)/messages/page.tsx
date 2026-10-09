'use client';

import { MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ConversationRow } from '@/components/messages/conversation-row';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/states';
import { useQuery } from '@/lib/hooks';
import { getInbox } from '@/lib/queries/messages';

export default function InboxPage() {
  const { state, retry } = useQuery(() => getInbox(), []);
  return (
    <div className="container flex max-w-[760px] flex-col gap-6 py-8 md:py-12">
      <PageHeader title="Messages" />
      {state.status === 'loading' ? (
        <ListSkeleton rows={6} />
      ) : state.status === 'error' ? (
        <ErrorState message={state.error.message} onRetry={retry} />
      ) : state.data.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          text="No messages yet. Ask a seller about something you like."
          actionLabel="Browse listings"
          href="/browse"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {state.data.map((s) => (
            <li key={s.conversation.id}>
              <ConversationRow summary={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
