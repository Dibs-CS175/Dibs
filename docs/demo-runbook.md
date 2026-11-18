# Class demo runbook

The demo runs on https://dibs-two.vercel.app on Live data, with a laptop and a phone signed in as two different Riverside students.

## Before the demo

Do these in order, about 15 minutes ahead.

- [ ] **Wake the database.** Open the Supabase dashboard for the project and confirm it is running. A paused or sleeping project makes the first page load fail.
- [ ] **Check `DIBS_AS_OF` in Vercel.** It pins the date the prices use. The $25 early tier, and so the "$221" line, applies to any date up to April 15, 2027, including today's real date. If it is set, it must be an ISO timestamp with an offset, such as `2027-04-01T12:00:00-07:00`; an invalid value breaks every price. A change only takes effect after a redeploy.
- [ ] **Sign in on both devices.** Laptop as one student, phone as another, both with Riverside campus emails. Sign-in codes are rate limited, so do this early and do not sign out.
- [ ] **Reload both devices after signing in.** The header reads the session once per page load. Until a reload it can still show "Verify".
- [ ] **Put the phone on a hotspot**, not the room Wi-Fi. Photo upload needs a steady connection.
- [ ] **Laptop: open Browse and leave that tab in front.** Browse checks for new listings every 4 seconds and pauses while its tab is hidden.
- [ ] **Have three items ready to photograph.**

## The steps

| # | Device | Do this | You should see |
|---|---|---|---|
| 1 | Laptop | Open Browse. | "Browse Riverside", the header showing the signed-in name, listing cards with a green verified check next to the seller's name. |
| 2 | Phone | Sell: add a photo, fill in Details, set a price, Publish listing. | The photo shows "Uploading", then a Cover label. After Publish, a "Listed!" toast and the new listing's page. |
| 3 | Laptop | Watch Browse. Do not reload. | Within about 4 seconds the new card appears first, with a highlight outline and a "New" tag for 30 seconds. Repeat steps 2 and 3 until there are 3 new listings. |
| 4 | Phone | Open Summer Hold. | "4 items from $221" under What's included. |
| 5 | Phone | Sign up. Where: pick housing, enter an address. Items: 4 standard. Options: leave everything as it is. | From the Items step on, a banner with "Early registration: $25" and a countdown. On Options, the Full Service card at $449 and every add-on unchecked. "Your total" reads $221. |
| 6 | Phone | Next to Review and pay, then Pay registration. | "You're registered." and the balance due date. |
| 7 | Phone | View my booking. | A "Registered" badge, 4 standard items, and "Free cancellation until" a date 14 days after the registration date. |

Notes on what you will see:

- The countdown in step 5 counts from the device's real clock to April 15, 2027. It does not follow `DIBS_AS_OF`.
- The free cancel date in step 7 is 14 days after "now" as the server sees it, so it follows `DIBS_AS_OF` when that is set.
- Do not open Orders, Make an offer, or a parent pay link. They are cut and hidden on Live.

## If something goes wrong

- **A page shows an error with Retry:** tap Retry once. If the database was asleep, the second try works.
- **The new card does not appear on the laptop:** make sure the Browse tab is in front, then reload it. The listing is saved; only the live update was missed.
- **A photo fails to upload:** tap Retry on the photo, or remove it and pick a smaller one.
- **The header shows "Verify" while signed in:** reload the page.
- **Pay registration says the price has ended:** the tier changed between Options and Pay. Go Back one step and press Next again to rebook at the current price.

## Fallback: Demo data

Demo data runs from fixtures in the browser. It needs no database and no sign-in, and every screen is filled in.

- **On the deployed site:** this only works if `NEXT_PUBLIC_DEV_TOOLBAR=true` is set in Vercel. Open the dev toolbar, switch the data source to "Demo (mockup data)", and set the role to Student. Check before the demo whether the toolbar is there.
- **On the laptop, always available:** run `npm install` and `npm run dev` in the repo beforehand, and open http://localhost:3000. Local development starts on Demo data with the toolbar on.

On Demo data nothing is saved and the two devices do not see each other, so step 3 cannot be shown live. Walk through Browse, Sell and Summer Hold on one device instead.
