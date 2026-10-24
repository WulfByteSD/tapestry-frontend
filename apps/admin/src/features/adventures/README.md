# Adventure authoring (admin only)

Routes: `/adventures`, `/adventures/new`, `/adventures/[id]`.

The feature uses the existing authenticated admin API instance and unchanged `@tapestry/ui` controls. Its API/types remain app-local. The current backend contract is `tapestry-api/src/modules/game/adventures/README.md` and its routes/services/handlers.

## Behavior

- Basics, story, resources, encounters, and review are freely switchable. Optional collections may remain empty.
- Section identities never depend on displayed order. Reordering changes `sortOrder`, retains selection and unsaved text, and preserves links and associations. Appending normalizes order values without changing IDs.
- Save replaces the working draft with an allowlisted content shape and revision. Publishing is a separate explicit action. No published-edition diff/date is invented: admin detail does not expose publication metadata or the published snapshot.
- Resource attachments use the protected raw-byte API, never the public upload helper. Save the material first, then explicitly upload. Attachment responses update revision and resource metadata. Only maps/handouts accept files; all map attachments are checked before publication.
- Mutation locks cover rapid/repeated actions. Conflicts and uncertain outcomes retain edits and block blind retries. A fresh server read allows explicit replacement, or retention of local edits if the server revision is unchanged.
- Recovery copies are account- and adventure-scoped in sessionStorage. They survive same-tab navigation/reload, not necessarily closing the tab. Storage failures are surfaced; JSON download provides a separate copy. Local copies are never silently merged across revisions. A new adventure with uncertain creation must be checked in the collection before another create.
- Library Resource selection uses existing library pagination and filters. A Resource is uniquely bound to one adventure; the backend enforces this. Adventure list filters are explicitly page-local because its API exposes only fixed-size pages.
- Recommended combatants are references with suggested quantities. No combatant or runtime roster is created or changed.

## Verification

From `apps/admin`:

```sh
pnpm exec node --test src/features/adventures/adventure.helpers.test.mjs
pnpm exec eslint src/features/adventures 'src/app/(protected)/adventures' src/components/adminShell/AdminShell.component.tsx
pnpm exec tsc --noEmit --incremental false
pnpm build
```

The dependency-free Node test runner loads the TypeScript helpers through the app's existing TypeScript compiler. Tests cover reorder identity/association invariants and serialization round-trip, metadata allowlisting, association cleanup, optional content, limits, visibility, and uncertain-write classification. No database or storage calls occur.

Browser QA used a temporary development-only synthetic API adapter, removed before delivery. It rejected unmocked requests and exercised the real feature components and routes at desktop and 390px mobile widths. The task artifacts include screenshots and a detailed QA report. Live database/provider integration was not exercised; no live content or assets were published/uploaded.

## Rich authoring revision

Story, context, Storyweaver notes, link context, summary, resource text, and encounter notes use the existing shared RichTextEditor through the app-local authoring adapter. Structured resource tags use add/edit/remove rows. Draft status and the accessible download icon sit above the heading. See `../authoring/README.md` for the backward-compatible string format and rendering requirements. The latest browser QA intercepts all API requests in a separate browser; no adapter route or QA page is installed in the app.
