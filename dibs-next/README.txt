# DISCLAIMER:

This entire folder is purely a frontend build for Dibs. It was AI-Generated using Claude Design, with permission
from the Professor, Professor Michail Faloutsos. So long as the documents for the project are handwritten, the 
coding part is allowed to be AI-Generated is a paraphrasing stated on October 6th, 2026 for Fall 2026, CS 175
after class.

However, the initial build is made with over 60 stub functions that require implementation, testing, and user 
testing. That being said, our team of 5 founders took on this responsibility in order to both learn and take on
the burden of developing the code. Although this too could have been generated, we agreed that by developing the 
backend functionality, that we could get our hands dirty, and add more features without having to worry about the 
frontend side looking bare.

That being said, all items outside and inside of this folder will be edited by hand. To determine the starting
point for this project, consider identifying the first commit history titled "Starting Frontend Repository".

The prompt used to create this folder and frontend (We found the colors and ideas, and simply created this prompt
to get the desired output through curated review and AI-assisted fixes) are below.

---

# Dibs: Frontend Generation Prompt (v2)

Run this in a generator inside an empty repository. Paste everything below the line.

---

Build the frontend for **Dibs**, a verified-student marketplace and move-out storage service for college students in Riverside, CA.

This is the visual layer of a class prototype. The team writes all real logic and the backend by hand afterward. The generated code must therefore:

- keep every action and every piece of data behind typed stub functions, so the team can replace them one at a time;
- contain no business logic and no business money values.

## 0. Hard constraints

1. **Independence.** Never use "UC," "UCR," "University of California," university seals, mascots, or a blue-and-gold color pairing.
   - Verification copy says "Verify with your campus email."
   - The email field placeholder is `you@ucr.edu`.
   - Footer: "Dibs is an independent student marketplace. Not affiliated with or endorsed by any university."
2. **Business money values come from one config file.** Every fee, Summer Hold price, deposit and surcharge lives in `lib/config/pricing.ts`.
   - Each constant is set to `0`, marked `// TODO: set from team research`.
   - Do not invent values for them.
   - Listing prices in fixtures are fine; those are sellers' asking prices, not business values.
3. **Payment holding is called "Dibs Protect."** Never use the word escrow.
4. **Housing Fit badge on every listing:** `Dorm-friendly`, `Apartment / off-campus`, or `Not allowed in campus housing`. Residence halls already include a bed, desk, chair, mini-fridge and microwave.
5. **Fictional data only.** No real people, businesses or campus programs.
6. **No documentation files.** Do not write a README, docs folder, architecture notes or any project write-up. The team writes those by hand. Code comments are fine.
7. **No external services.** No Supabase, Stripe, analytics or network calls. Everything runs on fixtures.

## 1. Architecture (the most important section)

Next.js App Router, TypeScript strict mode, Tailwind CSS, shadcn/ui, lucide-react, ESLint and Prettier.

```
app/                 routes only; pages compose components
components/          presentational components; no data access, no business rules
lib/types.ts         every domain type (section 2)
lib/result.ts        Result type and error codes
lib/queries/         read functions, one file per area
lib/actions/         write functions, one file per area
lib/fixtures/        typed sample data, used only by stubs
lib/config/          pricing.ts (placeholders), app.ts (dates, flags)
lib/dev/             stub mode and dev toolbar state
scripts/count-stubs  prints the number of remaining stubs per area
```

Areas: `users`, `listings`, `orders`, `messages`, `ratings`, `reports`, `pricing`, `summerHold`, `logistics`, `goods`, `impact`.

### Rules for every query and action

1. **Signature.** `async` and fully typed. Returns `Result<T>`, defined in `lib/result.ts`:
   ```ts
   type Result<T> = { ok: true; data: T } | { ok: false; error: { code: ErrorCode; message: string } };
   type ErrorCode =
     | 'NOT_SIGNED_IN' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT'
     | 'RATE_LIMITED' | 'PAYMENT_FAILED' | 'SLOT_FULL' | 'DEADLINE_PASSED'
     | 'CAPACITY_FULL' | 'CODE_INVALID' | 'UNKNOWN';
   ```
2. **The body is a stub and nothing else.** It contains:
   - first line: `// STUB(<area>): replace with real implementation`;
   - a call to `simulate()` from `lib/dev`, which applies the current stub mode;
   - a return of fixture data or a plausible success object.
3. **No business logic anywhere,** in stubs or in components. Specifically, the code must not:
   - calculate a price, fee or total;
   - check a deadline or capacity;
   - generate or verify a handoff code;
   - compute a hold date.
   The UI only displays what queries return.
4. **Prices and totals come from quote functions.** Checkout and the Summer Hold calculator call `getCheckoutQuote(listingId)` and `getSummerHoldQuote(items, housingType)` in `lib/queries/pricing.ts`.
   - Each returns `{ lines: { label: string; cents: number }[]; totalCents: number }`.
   - The stubs fill fee lines from the `lib/config/pricing.ts` placeholders.
5. **Money is always integer cents.** Display it only through `formatMoney(cents)`.
6. **`npm run stubs`** runs `scripts/count-stubs`, which counts `// STUB(` lines per area.

### Rules for every screen

1. **Four states on every data view:** loading (skeleton), empty (icon, one sentence, one action), error (message plus Retry) and data.
2. **Every action handles `ok: false`.** Map each relevant error code to a specific message on that screen, for example `CONFLICT` on Hold to Dibs shows "Someone called dibs first."
3. **Forms:**
   - client-side checks only for required fields and formats;
   - server errors from `Result` are shown inline;
   - the submit button is disabled while pending, so a double click cannot submit twice.
4. **Protected routes** use a guard that calls `getSession()`.
   - Signed-out users are redirected to Verify, then sent back afterward.
   - `/admin` routes require the `admin` role.

### Dev toolbar

Shown only when `NEXT_PUBLIC_DEV_TOOLBAR=true`; a small fixed panel bottom-left. It sets:

- **Role:** signed out, student, admin.
- **Stub mode:** normal, empty, error, slow (3 s).
- **Error code:** used when stub mode is error.

`simulate()` reads these, so the team can see every state on every screen before any backend exists.

## 2. Types (`lib/types.ts`)

**Users and marketplace**

- **User:** `id, firstName, lastInitial, email, housingType ('hall'|'campus_apartment'|'off_campus'|'commuter'), role ('student'|'admin'), verified, rating, tradesCount, memberSince`
- **Listing:** `id, sellerId, source ('student'|'goods'), title, description, priceCents, condition ('new'|'like_new'|'good'|'fair'), category, housingFit ('dorm'|'apartment'|'not_allowed'), photos: string[], status ('active'|'claimed'|'sold'|'removed'), createdAt`
- **Order:** `id, listingId, buyerId, sellerId, status ('held'|'released'|'disputed'|'cancelled'|'refunded'), quote, handoffCodeVisibleToBuyer?, meetupSpot?, meetupTime?, createdAt`
- **Conversation:** `id, listingId, participantIds, lastMessageAt, unreadCount`
- **Message:** `id, conversationId, senderId, body, createdAt, readAt?`
- **Rating:** `orderId, fromId, toId, stars, tags`
- **Report:** `id, orderId?, listingId?, reason, status ('open'|'resolved'), createdAt`

**Summer Hold and logistics**

- **SummerHoldBooking:** `id, userId, status ('draft'|'deposit_paid'|'paid'|'picked_up'|'stored'|'returned'|'cancelled'), housingType, address, items: StorageItem[], pickupSlotId?, returnSlotId?, quote, balanceDueAt`
- **StorageItem:** `id, bookingId, label, size ('standard'|'large'), status ('pending'|'checked_in'|'stored'|'returned'|'refused'|'damaged'), conditionPhoto?, conditionNote?, binId?`
- **Slot:** `id, kind ('pickup'|'return'), startsAt, endsAt, capacity, booked`. Times are ISO strings in UTC, displayed in America/Los_Angeles.
- **RouteStop:** `id, slotId, bookingId, building, address, itemCount, status ('pending'|'done'|'missed')`
- **Bin:** `id, unit, label, capacity, used`

**Goods and impact**

- **GoodsItem:** `id, title, category, photos, priceCents, costCents?, serialNumber?, holdUntil?, status ('intake'|'holding'|'listed'|'sold'|'disposed'), intakeDate`
- **ImpactStats:** `itemsKeptInUse, estimatedPounds, byCategory: { category, items, pounds }[]`

## 3. Brand

**Colors** (CSS variables, light):

| Token | Hex | Use |
|---|---|---|
| peel | #FBF7F0 | background |
| surface | #FFFFFF | cards |
| ink | #14201A | text |
| muted | #5B6660 | secondary text |
| grove | #1F3D2B | primary, white text |
| navel | #F27A1A | Dibs action; text on it is ink |
| rind | #A34A06 | orange text and links |
| zest | #F7C948 | badges |
| success | #2F7A4A | |
| error | #B42318 | |
| line | #E6DFD3 | borders |

Dark mode: background #0F1712, surface #17221B, text #EEF2EC, navel #FF8A2A.

**Type:** Bricolage Grotesque 700/800 for headings, Inter for UI, tabular numerals for money.

**Shape and motion:**

- 4px spacing grid.
- Radii: 10px inputs, 12px cards, 16px sheets.
- Motion: 120, 200 and 320 ms.
- `prefers-reduced-motion` respected.

**Logo:** a rounded price tag in navel with a small grove leaf at the string hole, beside a lowercase "dibs" wordmark whose i-dot is a small orange cross-section. Inline SVG; also used as the favicon.

## 4. Pages

### Student side

1. **Landing (signed out)**
   - Hero "Called it." with a "Verify with your campus email" call to action.
   - Trust band: verified students, Dibs Protect, public meetup spots, ratings.
   - How it works in 3 steps.
   - Summer Hold teaser with a countdown to `MOVE_OUT_DATE` in `lib/config/app.ts`.
   - Impact counter from `getImpactStats()`.
   - Independence footer.
2. **Verify**
   - Email field.
   - 6-digit code input: auto-advance, paste support, 30-second resend timer.
   - Errors: `VALIDATION`, `CODE_INVALID`, `RATE_LIMITED`.
   - Then a step to pick housing type.
3. **Browse**
   - Search box; category chips.
   - Filter drawer: price range slider plus numeric inputs, condition, Housing Fit, source (Students or Goods), free only.
   - Sort; listing grid with saved hearts; a "Load more" button.
4. **Listing detail**
   - Photo gallery, details, Housing Fit badge, seller card.
   - **Hold to Dibs:** press and hold 600 ms with a filling ring; a tap-then-confirm fallback for keyboard and reduced motion. It opens a confirmation sheet showing the quote lines and total from `getCheckoutQuote`. `CONFLICT` and `PAYMENT_FAILED` states.
   - Make an offer sheet; Message seller; Report listing.
5. **Sell flow** (4 steps)
   - Photos, with drag to reorder plus up/down buttons as the non-drag alternative.
   - Details: title, category, condition, Housing Fit.
   - Price.
   - Review.
   - Save draft. A prohibited-item warning for categories listed in `lib/config/app.ts`.
6. **Orders**
   - List of my orders; order detail with a status timeline.
   - Buyer sees the handoff code; seller enters it (`CODE_INVALID` with remaining attempts from the error message).
   - Cancel; Report a problem; a rating sheet after release.
7. **Messages**
   - Inbox; thread with the listing pinned on top; quick replies.
   - Each message shows sending, sent or failed with Retry.
   - A banner when the listing has sold.
8. **Summer Hold (student)**
   - Explainer.
   - Booking wizard:
     - housing type and address;
     - add items (standard or large, each with a label);
     - quote from `getSummerHoldQuote`;
     - pickup slot picker (full slots disabled; `SLOT_FULL`);
     - pay deposit (Dibs Protect wording);
     - confirmation.
   - **My booking:**
     - status tracker; items with their statuses;
     - edit items until the deadline (`DEADLINE_PASSED`);
     - pick a return slot; pay balance by the due date; cancel.
9. **Impact:** totals and a by-category chart from `getImpactStats()`, with every pound figure labeled "estimated."
10. **Profile:** tabs for Listings, Orders, Saved, Summer Hold and Settings (Hold to Dibs or tap to confirm, housing type).

### Admin side (`/admin`, admin role)

11. **Pickup routes**
    - Day picker for pickup week.
    - Stops grouped by building; each stop shows its items, with Done and Missed buttons and a link to check-in.
12. **Check-in**, for each item:
    - condition photo upload (file input with preview);
    - note;
    - bin selector showing capacity (full bins disabled; `CAPACITY_FULL`);
    - Refuse with a reason; Mark damaged.
13. **Bins:** capacity bars per storage unit, and the items in each bin.
14. **Returns:** return slots and a return route list, built like pickup routes.
15. **Goods inventory**
    - Table with status filters.
    - Intake form: title, category, photos, price, cost, optional serial number.
    - Shows the hold-until date returned by the action.
    - Buttons: List, Mark sold, Dispose.
16. **Reports queue:** open problem reports with Resolve.

**Do not build:** deals, sponsors, sweepstakes, consignment, a campuses or partners page, pre-claim, or any multi-campus feature.

## 5. Fixtures

Realistic, fictional records, consistent with each other:

- **Marketplace:** 40 listings (Students and Goods mixed), 12 sellers, 8 orders covering every order status, 6 conversations.
- **Summer Hold:** 3 Summer Hold bookings in different statuses, 10 pickup slots and 6 return slots (some full).
- **Logistics:** 20 route stops; 12 bins across 2 storage units (some full).
- **Goods and impact:** 25 Goods items covering every status; impact stats.
- **Listing asking prices:** realistic student prices, for example desk lamp $8, desk $40, office chair $35, TI-84 $55, road bike $120.
- **Business values:** no fees, Summer Hold prices or deposits in fixtures; they come only from the config placeholders.

## 6. Accessibility and layout

- Mobile first. No horizontal scroll at 390px. Desktop max width 1200px.
- WCAG 2.2 AA contrast; 44px tap targets; visible focus rings; full keyboard navigation.
- `aria-label` on icon buttons; `aria-live` on toasts and totals.
- A non-drag alternative for every drag interaction.
- Sticky headers never cover a focused element.

## 7. Done means

- `npm run dev` runs with no errors.
- `npm run lint` and `npx tsc --noEmit` pass.
- `npm run stubs` lists every stub.
- Every button calls an action.
- Every data view shows all four states through the dev toolbar.
- No business money value appears anywhere except `lib/config/pricing.ts`.