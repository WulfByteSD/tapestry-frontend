# Tapestry Portal

Public-facing Next.js app for the Tapestry frontend monorepo.

## Scripts

- `pnpm --filter @tapestry/portal dev`
- `pnpm --filter @tapestry/portal build`
- `pnpm --filter @tapestry/portal lint`

## Shared character sheets

`/characters/:id` is a public, read-only character card. It reads the latest saved
sheet from `GET /api/v1/game/characters/:id/public` without cookies or authorization
headers. Deploy the matching `tapestry-api` endpoint alongside this route.

Anyone with a character ID can view the card; there is no sharing toggle or public
character directory. The API excludes player/campaign references, internal metadata,
and journal cards. Existing edit and list endpoints remain authenticated.

The viewer includes copy-link and refresh controls, and refreshes successful reads
every 30 seconds while the tab is active. Search indexing is disabled. Missing or
deleted characters show an unavailable state. Network failures retain previously
loaded values with a stale-data message.

The route accepts a string identifier, but the API currently resolves only MongoDB
character IDs. Friendly slugs will require an API lookup change; the route shape can
stay the same.

Until the portal is deployed, the player app also hosts this viewer at
`/share/characters/:id`. Its character-card Public link action uses the current
player-app domain. Keep the two app-local viewers in sync when changing their
display or public response handling; they use the same API endpoint.

## Free-resource storefront release checks

This release exposes the homepage, public PDF library, individual published book
pages, the Woven Realms introduction and the public Commerce-backed catalogue.
Catalogue/product showcases are public; account acquisition is not yet integrated.
Cart, checkout and shared character views remain noindex. Do not change the root
indexing default.

### Public API configuration

`NEXT_PUBLIC_API_ORIGIN` is a public, build-time value used by both server-rendered
book pages and browser requests. Set the intended origin explicitly before building.
The tracked Next config defaults to `https://api.tapestry-ttrpg.com` in production
and `http://localhost:5000` in development. Never put credentials in this value.
Changing it after a build does not replace the value compiled into browser code.

Public canonicals, social-image URLs and robots/sitemap use
`https://tapestry-ttrpg.com`. The target host must serve the scene image, public
assets and manifest at their existing paths. Preview/staging indexing must be
controlled by the hosting environment; do not change private-route noindex to
enable public landing pages.

The API must allow the portal origin through CORS and expose anonymous GETs:
- `/api/v1/library/resources` — published catalogue, public/PDF filter, pagination
- `/api/v1/library/resources/:slug` — public book metadata
- `/api/v1/library/resources/:id/stream` — anonymous public PDF bytes

Only published, public PDFs become download links. Provider/asset keys are
intentionally absent from public metadata; delivery remains owned by the API.
Do not substitute local reference PDFs or direct storage URLs when delivery fails.

Woven Realms is a curated, server-rendered introduction based on the local World
Lore and Everpine canon. It does not query the authenticated settings API or
represent a fallback object as a live publication record.

### Local validation (no deployment)

From the monorepo root:
```text
pnpm --filter @tapestry/portal lint
pnpm --filter @tapestry/portal exec tsc --noEmit
pnpm build:portal
```

The app uses Next's standalone output. A packaged deployment must include the
portal's `public` assets and `.next/static` alongside the generated standalone
server at their corresponding app paths. The standalone server uses `PORT` and
`HOSTNAME`; development uses port 3002. No deployment target is configured by
this checklist.

Before release:
- Verify the real Player's Guide and Quickstart records, versions and public policy.
- Download complete PDFs anonymously; verify readable bytes, CORS and retry behavior.
- Check desktop/mobile book selection, keyboard focus, Escape, browser history and reduced motion.
- Check canonical/social metadata, robots, the sitemap and missing-book/page recovery.
- Confirm legacy public redirects and review any additional WordPress URLs that need migration.
- Check the Discord invite and contact destination without sending or joining.
- Keep production-connected API startup separate from frontend checks: its current
  worker startup may mutate delivery queues and send Discord messages.

The verified WordPress player, Storyweaver and adversary URLs under
/resources-2/ have permanent redirects to the new resource experience. Unknown
legacy resource slugs return the public missing-page recovery screen.


### Player application destinations

The canonical player application is https://app.tapestry-ttrpg.com. Storefront
handoffs are centralized in src/config/player-app.ts. NEXT_PUBLIC_PLAYER_APP_ORIGIN
is an optional public build-time origin override for an explicitly configured
developer/staging player app (for example http://localhost:3000). It must contain
only an HTTP(S) origin, without credentials, path, query or fragment. Without an
override the canonical production origin is used. This is separate from
NEXT_PUBLIC_API_ORIGIN and the marketing canonical https://tapestry-ttrpg.com.

Verified player paths: /, /login, /register, /characters/new and
/storyweaver/campaigns. AuthGate redirects protected app paths to login with a
local next pathname. Registration does not retain that return target. No player
/library or product-claim page is assumed, and an app-launch link is not a claim.
