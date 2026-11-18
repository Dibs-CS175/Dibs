# Dibs

Dibs is a campus marketplace for verified students, with a summer storage service called Summer Hold. Students sign in with a campus email code, list items with photos, browse listings from their own campus, message sellers, and book Summer Hold pickup and storage.

This is a class project. Feature work ended at the freeze on Nov 13, 2026; from here the team only fixes and refines. The live site is https://dibs-two.vercel.app.

## Stack

- Next.js 16 (App Router, Turbopack), React 18, TypeScript strict, Tailwind 3
- Supabase: email-code auth, Postgres with row-level security, Storage
- Vitest for unit tests
- Node 24 (see `.nvmrc`)

The web app lives in `dibs-next/`. Database migrations and seeds live in `supabase/`.

## Setup

```bash
nvm use            # Node 24
npm install        # also installs dibs-next
npm run dev        # http://localhost:3000
```

`dibs-next/.env.development` is committed and starts the app on Demo data with the dev toolbar on, so it runs with no further setup. It also holds the hosted Supabase URL and publishable key. Both are public values that are safe in the browser. To override anything locally, copy `dibs-next/.env.example` to `dibs-next/.env.local`.

## Commands

Run these from the repo root.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run stubs -- --list` | Counts the unbuilt Live functions and shows where they are |

Formatting is Prettier: `npx prettier --check .` inside `dibs-next`.

## Environment variables

These five are the only variables the code reads.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_DATA_SOURCE` | `demo` or `live`. The data source on first load. Anything other than `live` means Demo. |
| `NEXT_PUBLIC_DEV_TOOLBAR` | `true` shows the dev toolbar and the preview panel at `/dev`. |
| `NEXT_PUBLIC_SUPABASE_URL` | The Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | The Supabase publishable key. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is read as a fallback. |
| `DIBS_AS_OF` | Optional, server only. Pins "now" for prices, tiers and deadlines. An ISO timestamp with an offset, such as `2027-04-01T12:00:00-07:00`. |

## Demo and Live data

Pages never talk to the database directly. They import from `lib/queries/*` and `lib/actions/*`. Each function there pairs two versions and runs one of them:

- **Demo** (`lib/demo/*`): fixtures from `lib/fixtures`. Read only, no sign-in, every feature works.
- **Live** (`lib/live/*`): the real code. Server actions that use Supabase.

`NEXT_PUBLIC_DATA_SOURCE` picks the version on first load. When the dev toolbar is on, the preview panel at `/dev` switches it per browser, and the choice is saved in that browser.

Some Live functions are still stubs that return "Not built yet". These features were cut from the class demo and stay unbuilt: Hold to Dibs checkout, handoff codes, orders, offers, referral redemption, parent pay, pay balance, and cancel booking. `lib/config/features.ts` hides every way into them on Live data. Demo data still shows them.

## Conventions

- Money is integer cents. Times are `timestamptz` in UTC. Every table row has a `campus_id`.
- `dibs-next/lib/fixtures/priceTable.json` is the source of truth for prices, fees, tiers and business dates. Do not put prices anywhere else.
- Payments use the mock provider in `lib/payments.ts`. There is no real payment processor.
- Payment holding is called Dibs Protect. Lint rejects the older term for it.
- Keep every `lib/live` function signature as it is. `lib/queries` and `lib/actions` check each one against its Demo version.
- New tables need explicit `GRANT`s as well as RLS policies. The hosted project does not expose new tables automatically.

## Contributing

- Never push to `main`. Every change goes on its own branch as a pull request.
- A PR needs green CI and one teammate approval. CI runs ESLint, the typecheck, Vitest and the stubs check. Do not rename those jobs in `.github/workflows/main.yml`; they are required checks.
- A PR whose code depends on a new migration must not merge until someone with access has applied that migration to the hosted project. Open it as a draft titled "NEEDS DB PUSH FIRST".

## Deployment

The site is hosted on Vercel.

- Root Directory: `dibs-next`
- Node 24, from `engines` in `dibs-next/package.json`
- Environment variables: `NEXT_PUBLIC_DATA_SOURCE=live`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and optionally `DIBS_AS_OF` and `NEXT_PUBLIC_DEV_TOOLBAR`
- Every PR gets a preview deployment. Merging to `main` deploys production.

Changing an environment variable in Vercel takes effect on the next deployment, not on the running one.

## Class demo

The demo runs on the live site with two signed-in accounts, a laptop and a phone:

1. Laptop: Browse for Riverside, signed in, verified badge visible.
2. Phone: Sell, take a photo, publish.
3. Laptop: the new card appears within about 4 seconds, highlighted, with no reload. Repeat to 3 listings.
4. Phone: the Summer Hold page shows "4 items from $221".
5. Sign-up with 4 standard items: tier countdown, add-ons unchecked, Full Service card at $449.
6. Book, then pay the $25 registration on the mock provider.
7. The booking page shows the booking as Registered with the 14-day free cancel date.

The checklist, what each step should show, and the fallback are in [docs/demo-runbook.md](docs/demo-runbook.md).
