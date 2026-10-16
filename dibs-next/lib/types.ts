// Every domain type for Dibs. Money is integer cents. Times are ISO 8601 strings in UTC, displayed in
// the campus time zone. Every record that belongs to a campus carries campusId.

export type ISODate = string;
export type Cents = number;

/* ---------- Campus and pricing ---------- */

export interface Campus {
  id: string;
  name: string;
  emailDomain: string;
  /** IANA time zone used to display this campus's dates. */
  timezone: string;
}

export type RegistrationTierKey = string;

export interface RegistrationTier {
  key: RegistrationTierKey;
  label: string;
  cents: Cents;
  endsAt: ISODate | null;
}

export type AddOnKey = 'protect_plus' | 'priority_window' | 'delivery';

export interface AddOn {
  key: AddOnKey;
  label: string;
  cents: Cents;
  note: string;
}

/** One row per campus. Every business value the product uses lives here. */
export interface PriceTable {
  campusId: string;
  startsAt: ISODate | null;
  endsAt: ISODate | null;
  itemStandardCents: Cents;
  itemLargeCents: Cents;
  standardBoxRule: { maxInches: [number, number, number]; maxPounds: number };
  registrationTiers: RegistrationTier[];
  cancelWindowDays: number;
  balanceDueDate: ISODate | null;
  fullService: { cents: Cents; maxItems: number };
  addOns: AddOn[];
  fees: {
    overweightCents: Cents;
    repackCents: Cents;
    changeOrNoShowCents: Cents;
    offCampusPickupCents: Cents;
  };
  coveragePerItemCents: Cents;
  marketplace: { buyerPct: number; buyerFlatCents: Cents; sellerPct: number };
  salesTaxRate: number;
}

export type QuoteLineKind = 'item' | 'fee' | 'tax' | 'addon' | 'credit';

export interface QuoteLine {
  label: string;
  kind: QuoteLineKind;
  cents: Cents;
}

/** Every price shown comes from a quote. The UI never adds lines up. */
export interface Quote {
  lines: QuoteLine[];
  totalCents: Cents;
}

/* ---------- Users and marketplace ---------- */

export type HousingType = 'hall' | 'campus_apartment' | 'off_campus' | 'commuter';
export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  campusId: string;
  firstName: string;
  lastInitial: string;
  email: string;
  housingType: HousingType | null;
  role: UserRole;
  verified: boolean;
  tradesCount: number;
  memberSince: ISODate;
  referralCode: string;
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
  campusId: string;
  sellerId: string;
  source: ListingSource;
  title: string;
  description: string;
  priceCents: Cents;
  condition: Condition;
  category: Category;
  housingFit: HousingFit;
  /** Image URLs. Fixtures use `ph:<Icon>:<n>` keys that render a placeholder. */
  photos: string[];
  status: ListingStatus;
  createdAt: ISODate;
}

export type OrderStatus = 'pending_payment' | 'held' | 'released' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  campusId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  /** What the buyer pays. */
  quote: Quote;
  /** What the seller receives. */
  payoutQuote: Quote;
  /** Present only when the signed-in user is the buyer and payment is held. */
  handoffCodeVisibleToBuyer?: string;
  /** Present for the seller while payment is held. */
  attemptsRemaining?: number;
  meetupSpotId?: string;
  meetupTime?: ISODate;
  createdAt: ISODate;
}

export interface MeetupSpot {
  id: string;
  campusId: string;
  name: string;
  description: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  participantIds: string[];
  lastMessageAt: ISODate;
  unreadCount: number;
}

export type MessageKind = 'text' | 'meetup_proposal';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  kind: MessageKind;
  meetupSpotId?: string;
  meetupTime?: ISODate;
  createdAt: ISODate;
  readAt?: ISODate;
}

/* ---------- Summer Hold ---------- */

export type BookingStatus = 'draft' | 'registered' | 'balance_paid' | 'cancelled';

export interface SummerHoldBooking {
  id: string; //
  campusId: string; //Connects to Campus.id + PriceTable.campusId
  userId: string; //Connects to User.id
  status: BookingStatus;
  housingType: HousingType;
  address: string;
  standardCount: number; //Priced from PriceTable.itemStandardCents
  largeCount: number; //Priced from PriceTable.itemLargeCents
  registrationTierKey: RegistrationTierKey; //Connects to PriceTable.registrationTiers.key
  fullService: boolean; //Connects to PriceTable.fullService
  packingSlotId?: string; //Connects to Slot.id
  addOnKeys: AddOnKey[]; //Connects to PriceTable.addOns.key
  referralCode?: string; //Connects to User.referralCode + CreditLedgerEntry
  parentPayToken?: string; //Connects to ParentPayView.token
  quote: Quote;
  registeredAt?: ISODate;
  /** Set by the backend from the registration date and the campus cancel window. */
  freeCancelUntil?: ISODate | null;
  balanceDueAt: ISODate | null; //From PriceTable.balanceDueDate
}

export type SlotKind = 'packing' | 'pickup';

export interface Slot {
  id: string;
  campusId: string;
  kind: SlotKind;
  startsAt: ISODate;
  endsAt: ISODate;
  capacity: number;
  booked: number;
}

/* ---------- Goods, referrals and offers ---------- */

export type GoodsStatus = 'intake' | 'holding' | 'listed' | 'sold' | 'disposed';

export interface GoodsItem {
  id: string;
  campusId: string; //Connects to Campus.id
  listingId?: string; //Connects to Listing.id when listed
  title: string; //Copied to Listing.title when listed
  category: Category; //Copied to Listing.category when listed
  condition?: Condition; //Connects to Listing.condition when listed
  housingFit?: HousingFit; //Connects to Listing.housingFit when listed
  description?: string; //Connects to Listing.description when listed
  photos: string[]; //Copied to Listing.photos when listed
  priceCents: Cents;
  costCents?: Cents;
  serialNumber?: string;
  holdUntil?: ISODate;
  status: GoodsStatus;
  intakeDate: ISODate;
}

export interface CreditLedgerEntry {
  id: string;
  userId: string;
  cents: Cents;
  reason: 'referral_given' | 'referral_received';
  createdAt: ISODate;
}

export interface OfferEvent {
  id: string;
  userId: string;
  campusId: string;
  offerKey: string;
  shownAt: ISODate;
  chosen?: boolean;
}

/* ---------- View models returned by queries ---------- */
/* Flags such as `isFull` or `canCancel` are decided by the backend. The UI only reads them. */

export interface Session {
  user: User;
  campus: Campus;
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
  meetupSpot: MeetupSpot | null;
  canCancel: boolean;
}

export interface ConversationSummary {
  conversation: Conversation;
  listing: Pick<Listing, 'id' | 'title' | 'photos' | 'priceCents' | 'status'>;
  otherUser: Pick<User, 'id' | 'firstName' | 'lastInitial'>;
  lastMessagePreview: string;
}

export interface Thread {
  conversation: Conversation;
  campusId: string;
  listing: Pick<Listing, 'id' | 'title' | 'photos' | 'priceCents' | 'status'>;
  otherUser: Pick<User, 'id' | 'firstName' | 'lastInitial'>;
  messages: Message[];
  viewerId: string;
  /** Message ids of meetup proposals that have been accepted. */
  acceptedProposalIds: string[];
  listingSold: boolean;
}

export interface SlotView extends Slot {
  isFull: boolean;
}

/** Everything the Summer Hold screens show about the campus offer, straight from the price table. */
export interface SummerHoldOffers {
  campusId: string;
  /** The tier in effect now. The backend picks it. */
  currentTier: RegistrationTier;
  itemStandardCents: Cents;
  itemLargeCents: Cents;
  standardBoxRule: PriceTable['standardBoxRule'];
  fullService: PriceTable['fullService'];
  addOns: AddOn[];
  coveragePerItemCents: Cents;
  cancelWindowDays: number;
  balanceDueDate: ISODate | null;
}

export interface SummerHoldTeaser {
  itemCount: number;
  totalCents: Cents;
}

export interface SummerHoldInput {
  campusId: string;
  housingType: HousingType | '';
  standardCount: number;
  largeCount: number;
  fullService: boolean;
  addOnKeys: AddOnKey[];
  referralCode: string;
}

export interface BookingDraftInput extends SummerHoldInput {
  address: string;
  packingSlotId: string | null;
}

export interface MyBooking {
  booking: SummerHoldBooking;
  packingSlot: SlotView | null;
  canCancel: boolean;
  canPayBalance: boolean;
}

export interface ParentPayView {
  token: string;
  studentFirstName: string;
  campusName: string;
  standardCount: number;
  largeCount: number;
  fullService: boolean;
  quote: Quote;
  paid: boolean;
}

export interface ReferralCheck {
  code: string;
  /** Short description of the credit, written by the backend. */
  description: string;
}

export interface OfferChoice {
  offerKey: string;
  chosen: boolean;
}

export interface GoodsIntakeInput {
  title: string;
  category: Category | '';
  photos: string[];
  priceCents: Cents | null;
  costCents: Cents | null;
  serialNumber: string;
}
