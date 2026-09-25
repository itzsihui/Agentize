# World ID — one person, one storefront

## Trust moment
A merchant (or their seller agent) asks to **list a storefront** on `/market`
and the agent registry (`/llms.txt`, `/registry.json`). Without a check, one
seller can create many accounts and flood buyer agents' results with clone
stores. Listing is the point where we need to know: *is this account backed by
a person who doesn't already run a store here?*

## Why Passport / NFC (minimum sufficient assurance)
| Credential | Verdict |
|---|---|
| **Passport / eID / My Number Card (NFC)** | **Chosen.** One document ↔ one World ID, so the app-scoped nullifier gives one-store-per-person. No Orb visit, which suits online seller signup. My Number Card covers Japanese sellers. |
| Proof of Human (Orb) | Stronger uniqueness but requires an Orb visit — too much friction for merchant onboarding. |
| Selfie Check | Probabilistic (Sybil score); weaker than document uniqueness for a commercial listing. Candidate low-trust tier later. |

We only use the nullifier. No name, nationality or document number is requested.
This proves uniqueness, **not** KYC or business legitimacy.

## Flow
1. Merchant signs up → **Setup** shows "Seller verification · World ID".
2. `POST /api/world/rp-signature` (Firebase token required) signs the
   `publish-storefront` action server-side and returns the merchant uid as the signal.
3. IDKit widget with `passport({ signal: uid })` → World App / Simulator.
4. `POST /api/world/verify` (server): checks action, `signal_hash == hashSignal(uid)`,
   accepted document credential, World's `/api/v4/verify/{rp_id}`, then binds
   the nullifier to the uid. The same nullifier on a different uid → **409**.
5. `/api/merchant-agent` and `/api/merchant-inventory` only set
   `listOnMarket: true` when the **token** uid is verified. Otherwise the
   store saves as an unlisted draft.

## Alternative paths (demo these)
- **Cancel** in the widget → "stays an unlisted draft until you verify".
- **Same passport, second account** → rejected: "One person, one storefront".
- **Wrong credential** (e.g. Orb only) → 403 `credential_not_accepted`.
- **Publish while unverified** → store saved, unlisted, with a notice on Onboard.

## Setup
Set `NEXT_PUBLIC_WORLD_APP_ID`, `NEXT_PUBLIC_WORLD_RP_ID`, `WORLD_RP_SIGNING_KEY`,
`NEXT_PUBLIC_WORLD_ENV=staging` (use https://simulator.worldcoin.org) and create
the `publish-storefront` action in the Developer Portal.

## Known limitation
Server Firestore uses the client SDK, and the rules block client writes to
`world_*` collections, so the nullifier registry is enforced in memory per
server process. For multi-instance deploys (Vercel) switch the registry to
`firebase-admin` with a service account.

## Integration debrief (fill in after first successful run)
- Time to first success:
- Friction encountered:
- Missing capability / docs:
- One improvement with the greatest impact:
