import type { Conversation, Message } from '@/lib/types';

export const conversations: Conversation[] = [
  {
    id: 'c1',
    listingId: 'l01',
    participantIds: ['u_me', 'u_s01'],
    lastMessageAt: '2026-10-08T18:55:00Z',
    unreadCount: 2,
  },
  {
    id: 'c2',
    listingId: 'l12',
    participantIds: ['u_me', 'u_s02'],
    lastMessageAt: '2026-10-08T17:00:00Z',
    unreadCount: 1,
  },
  {
    id: 'c3',
    listingId: 'l29',
    participantIds: ['u_me', 'u_s03'],
    lastMessageAt: '2026-10-08T14:20:00Z',
    unreadCount: 1,
  },
  {
    id: 'c4',
    listingId: 'l08',
    participantIds: ['u_me', 'u_s12'],
    lastMessageAt: '2026-10-07T21:00:00Z',
    unreadCount: 0,
  },
  {
    id: 'c5',
    listingId: 'l25',
    participantIds: ['u_me', 'u_s02'],
    lastMessageAt: '2026-10-05T19:00:00Z',
    unreadCount: 0,
  },
  {
    id: 'c6',
    listingId: 'l26',
    participantIds: ['u_me', 'u_s12'],
    lastMessageAt: '2026-10-07T23:10:00Z',
    unreadCount: 0,
  },
];

const m = (
  id: string,
  conversationId: string,
  senderId: string,
  body: string,
  createdAt: string,
  readAt?: string,
): Message => ({
  id,
  conversationId,
  senderId,
  body,
  createdAt,
  readAt,
});

export const messages: Message[] = [
  m('m1', 'c1', 'u_s01', 'Hi! The lamp is yours. I can meet today.', '2026-10-08T18:51:00Z'),
  m('m2', 'c1', 'u_me', 'Can we meet at 3?', '2026-10-08T18:52:00Z', '2026-10-08T18:53:00Z'),
  m('m3', 'c1', 'u_s01', '3 works. Library front steps?', '2026-10-08T18:54:00Z'),
  m('m4', 'c1', 'u_s01', 'I will have it in a tote bag.', '2026-10-08T18:55:00Z'),
  m('m5', 'c2', 'u_me', 'Still available?', '2026-10-08T16:30:00Z', '2026-10-08T16:40:00Z'),
  m('m6', 'c2', 'u_s02', 'Yes! You would need a car, it is pretty heavy.', '2026-10-08T17:00:00Z'),
  m('m7', 'c3', 'u_s03', 'Can we meet at the transit center after 4?', '2026-10-08T14:20:00Z'),
  m('m8', 'c4', 'u_me', 'Would you take $60?', '2026-10-07T20:00:00Z', '2026-10-07T20:30:00Z'),
  m('m9', 'c4', 'u_s12', 'I can do $65 if you pick up this week.', '2026-10-07T21:00:00Z'),
  m('m10', 'c5', 'u_me', 'Is the frame 54 cm?', '2026-10-05T18:00:00Z', '2026-10-05T18:30:00Z'),
  m('m11', 'c5', 'u_s02', 'Yep, 54 cm.', '2026-10-05T19:00:00Z'),
  m('m12', 'c6', 'u_s12', 'Thanks for picking it up!', '2026-10-07T23:10:00Z'),
];
