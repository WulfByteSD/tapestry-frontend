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
