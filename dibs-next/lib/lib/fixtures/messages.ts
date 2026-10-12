import type { Conversation, Message } from '@/lib/types';

const c = (
  id: string,
  listingId: string,
  other: string,
  lastMessageAt: string,
  unreadCount: number,
): Conversation => ({
  id,
  listingId,
  participantIds: ['u_me', other],
  lastMessageAt,
  unreadCount,
});

export const conversations: Conversation[] = [
  c('c1', 'l01', 'u_s01', '2026-10-12T18:55:00Z', 2),
  c('c2', 'l12', 'u_s02', '2026-10-12T17:00:00Z', 1),
  c('c3', 'l29', 'u_s03', '2026-10-12T14:20:00Z', 1),
  c('c4', 'l14', 'u_s04', '2026-10-11T21:00:00Z', 0),
  c('c5', 'l25', 'u_s02', '2026-10-09T19:00:00Z', 0),
  c('c6', 'l26', 'u_s08', '2026-10-06T19:00:00Z', 0),
];

let n = 0;
const m = (
  conversationId: string,
  senderId: string,
  body: string,
  createdAt: string,
  extra: Partial<Message> = {},
): Message => ({
  id: `m${++n}`,
  conversationId,
  senderId,
  body,
  kind: 'text',
  createdAt,
  ...extra,
});

export const messages: Message[] = [
  m('c1', 'u_me', 'Hi! Is the lamp still available?', '2026-10-12T18:40:00Z'),
  m('c1', 'u_s01', 'Yes! I can meet today.', '2026-10-12T18:44:00Z'),
  m('c1', 'u_s01', 'How about this?', '2026-10-12T18:50:00Z', {
    kind: 'meetup_proposal',
    meetupSpotId: 'ms_r2',
    meetupTime: '2026-10-12T22:00:00Z',
  }),
  m('c1', 'u_s01', 'It comes with a USB cable.', '2026-10-12T18:55:00Z'),
  m('c2', 'u_me', 'Would you take a little less for the desk?', '2026-10-12T16:30:00Z'),
  m('c2', 'u_s02', 'I can do a bit less if you pick it up this week.', '2026-10-12T17:00:00Z'),
  m('c3', 'u_s03', 'Hi, I called dibs on your calculator.', '2026-10-12T14:00:00Z'),
  m('c3', 'u_me', 'Great. Transit center at 5?', '2026-10-12T14:10:00Z', {
    kind: 'meetup_proposal',
    meetupSpotId: 'ms_r1',
    meetupTime: '2026-10-13T00:00:00Z',
  }),
  m('c3', 'u_s03', 'Works for me.', '2026-10-12T14:20:00Z'),
  m('c4', 'u_me', 'Does the bookcase come apart?', '2026-10-11T20:30:00Z'),
  m('c4', 'u_s04', 'Yes, the shelves lift out. Easy to carry.', '2026-10-11T21:00:00Z'),
  m('c5', 'u_s02', 'The bike was tuned last month.', '2026-10-09T19:00:00Z'),
  m('c6', 'u_me', 'Is the cruiser still for sale?', '2026-10-06T18:00:00Z'),
  m('c6', 'u_s08', 'Sorry, it just sold.', '2026-10-06T19:00:00Z'),
];

/** Proposals already accepted, as the backend tracks them. */
export const acceptedProposalIds = ['m8'];
