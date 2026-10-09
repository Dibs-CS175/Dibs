// Every domain type for Dibs. Money is always integer cents. Times are ISO 8601 strings in UTC.

export type ISODate = string;
export type Cents = number;

/* ---------- Users and marketplace ---------- */

export type HousingType = 'hall' | 'campus_apartment' | 'off_campus' | 'commuter';
export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastInitial: string;
  email: string;
  housingType: HousingType | null;
  role: UserRole;
  verified: boolean;
  rating: number;
  tradesCount: number;
  memberSince: ISODate;
}

export type ListingSource = 'student' | 'goods';
export type Condition = 'new' | 'like_new' | 'good' | 'fair';
export type HousingFit = 'dorm' | 'apartment' | 'not_allowed';
export type ListingStatus = 'active' | 'claimed' | 'sold' | 'removed';
export type Category =
  | 'dorm_essentials'
  | 'furniture'
  | 'kitchen'
  | 'textbooks'
  | 'electronics'
  | 'bikes_boards'
  | 'clothing'
  | 'other';

export interface Listing {
  id: string;
  sellerId: string;
  source: ListingSource;
  title: string;
  description: string;
  priceCents: Cents;
  condition: Condition;
  category: Category;
  housingFit: HousingFit;
  /** Image URLs. Fixtures use `ph:<icon>` keys that render a placeholder. */
  photos: string[];
  status: ListingStatus;
  createdAt: ISODate;
}

export interface QuoteLine {
  label: string;
  cents: Cents;
}

/** Every price shown at checkout comes from a quote. The UI never adds lines up. */
export interface Quote {
  lines: QuoteLine[];
  totalCents: Cents;
}

export type OrderStatus = 'held' | 'released' | 'disputed' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  quote: Quote;
  /** Present only when the signed-in user is the buyer and the order is held. */
  handoffCodeVisibleToBuyer?: string;
  meetupSpot?: string;
  meetupTime?: ISODate;
  createdAt: ISODate;
}

export interface Conversation {
  id: string;
  listingId: string;
  participantIds: string[];
  lastMessageAt: ISODate;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: ISODate;
  readAt?: ISODate;
}

export interface Rating {
  orderId: string;
  fromId: string;
  toId: string;
  stars: number;
  tags: string[];
}

export type ReportStatus = 'open' | 'resolved';

export interface Report {
  id: string;
  orderId?: string;
  listingId?: string;
  reason: string;
  status: ReportStatus;
  createdAt: ISODate;
}

/* ---------- Summer Hold and logistics ---------- */

export type BookingStatus =
  | 'draft'
  | 'deposit_paid'
  | 'paid'
  | 'picked_up'
  | 'stored'
  | 'returned'
  | 'cancelled';

export type ItemSize = 'standard' | 'large';
export type StorageItemStatus = 'pending' | 'checked_in' | 'stored' | 'returned' | 'refused' | 'damaged';

export interface StorageItem {
  id: string;
  bookingId: string;
  label: string;
  size: ItemSize;
  status: StorageItemStatus;
  conditionPhoto?: string;
  conditionNote?: string;
  binId?: string;
}

export interface SummerHoldBooking {
  id: string;
  userId: string;
  status: BookingStatus;
  housingType: HousingType;
  address: string;
  items: StorageItem[];
  pickupSlotId?: string;
  returnSlotId?: string;
  quote: Quote;
  balanceDueAt: ISODate;
}

export type SlotKind = 'pickup' | 'return';

export interface Slot {
  id: string;
  kind: SlotKind;
  startsAt: ISODate;
  endsAt: ISODate;
  capacity: number;
  booked: number;
}

export type RouteStopStatus = 'pending' | 'done' | 'missed';

export interface RouteStop {
  id: string;
  slotId: string;
  bookingId: string;
  building: string;
  address: string;
  itemCount: number;
  status: RouteStopStatus;
}

export interface Bin {
  id: string;
  unit: string;
  label: string;
  capacity: number;
  used: number;
}

/* ---------- Goods and impact ---------- */

export type GoodsStatus = 'intake' | 'holding' | 'listed' | 'sold' | 'disposed';

export interface GoodsItem {
  id: string;
  title: string;
  category: Category;
  photos: string[];
  priceCents: Cents;
  costCents?: Cents;
  serialNumber?: string;
  holdUntil?: ISODate;
  status: GoodsStatus;
  intakeDate: ISODate;
}

export interface ImpactStats {
  itemsKeptInUse: number;
  estimatedPounds: number;
  byCategory: { category: Category; items: number; pounds: number }[];
}

/* ---------- View models returned by queries ---------- */
/* Flags such as `isFull` or `canEditItems` are decided by the backend. The UI only reads them. */

export interface Session {
  user: User;
}

export interface Settings {
  dibsGesture: 'hold' | 'tap';
  housingType: HousingType | null;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export interface ListingSearch {
  q?: string;
  category?: Category;
  minCents?: Cents;
  maxCents?: Cents;
  conditions?: Condition[];
  fits?: HousingFit[];
  source?: ListingSource;
  freeOnly?: boolean;
  sort?: SortOption;
  cursor?: string;
}

export interface ListingCardView {
  listing: Listing;
  seller: Pick<User, 'id' | 'firstName' | 'lastInitial' | 'verified'>;
  saved: boolean;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ListingDetail {
  listing: Listing;
  seller: User;
  saved: boolean;
  /** True when the signed-in user is the seller. */
  isOwn: boolean;
}

export interface ListingDraftInput {
  photos: string[];
  title: string;
  category: Category | '';
  condition: Condition | '';
  housingFit: HousingFit | '';
  description: string;
  priceCents: Cents | null;
}

export interface ListingDraft extends ListingDraftInput {
  id: string;
  savedAt: ISODate;
}

export interface TimelineStep {
  label: string;
  at?: ISODate;
  state: 'done' | 'current' | 'upcoming';
}

export interface OrderSummary {
  order: Order;
  listing: Pick<Listing, 'id' | 'title' | 'photos'>;
  viewerRole: 'buyer' | 'seller';
  counterpart: Pick<User, 'id' | 'firstName' | 'lastInitial'>;
}

export interface OrderDetail extends OrderSummary {
  timeline: TimelineStep[];
  canCancel: boolean;
  canReport: boolean;
  needsRating: boolean;
}

export interface ConversationSummary {
  conversation: Conversation;
  listing: Pick<Listing, 'id' | 'title' | 'photos' | 'priceCents' | 'status'>;
  otherUser: Pick<User, 'id' | 'firstName' | 'lastInitial'>;
  lastMessagePreview: string;
}

export interface Thread {
  conversation: Conversation;
  listing: Pick<Listing, 'id' | 'title' | 'photos' | 'priceCents' | 'status'>;
  otherUser: Pick<User, 'id' | 'firstName' | 'lastInitial'>;
  messages: Message[];
  viewerId: string;
  listingSold: boolean;
}

export interface SlotView extends Slot {
  isFull: boolean;
}

export interface MyBooking {
  booking: SummerHoldBooking;
  pickupSlot: SlotView | null;
  returnSlot: SlotView | null;
  canEditItems: boolean;
  itemEditDeadline: ISODate;
  canPayBalance: boolean;
  canCancel: boolean;
}

export interface StorageItemInput {
  label: string;
  size: ItemSize;
}

export interface RouteStopView extends RouteStop {
  items: StorageItem[];
  window: { startsAt: ISODate; endsAt: ISODate };
}

export interface StopDetail {
  stop: RouteStopView;
  bins: BinView[];
}

export interface BinView extends Bin {
  isFull: boolean;
  items: StorageItem[];
}

export interface GoodsIntakeInput {
  title: string;
  category: Category | '';
  photos: string[];
  priceCents: Cents | null;
  costCents: Cents | null;
  serialNumber: string;
}

export interface ReportView {
  report: Report;
  subject: string;
}
