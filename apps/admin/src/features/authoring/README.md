# Admin authoring controls

App-local adapters reuse existing `@tapestry/ui` primitives without changing the shared package. Rich prose, structured string lists, and accessible multi-selection are shared by the adventure and Unwoven editors.

## Prose contract

Existing plain strings remain plain, including literal HTML. Deliberate rich edits are stored as a string beginning with `<!--tapestry:richtext:v1-->`, followed by allowlisted HTML. This is not JSON and the marker is not a trust signal. `prose.helpers.ts` parses in an inert template, discards unsafe elements/attributes/protocols, and serializes only supported content. `AuthoringProse` creates React elements from the restricted tree; it never injects stored HTML. `AuthoringRichField` also sanitizes before loading Tiptap and ignores equivalent editor updates, including updates caused by enabling/disabling editing, so opening/saving an unrelated field does not convert plain strings.

The API's `middleware/authoringProse.ts` preserves only known authoring prose fields through the existing generic HTML encoder. Labels, identifiers, query strings, and unrelated bodies retain normal sanitization. The API stores these strings as untrusted content. Every future consumer must render plain strings as text and marked strings through an equivalent allowlist. Current player/portal code has no adventure/combatant prose consumer to update.

## Origins and harm

Origin suggestions combine The Unwoven guide with the admin-only `GET /game/content/combatants/origins` vocabulary. Saved tags remain available during lookup failures. Custom additions trim outer whitespace and deduplicate case-insensitively while preserving the first spelling. An optional `origins` array stores individual tags; the existing `origin` string remains their ` / `-joined display/search value. Legacy strings are treated as one tag, never guessed/split. If a legacy writer changes `origin` without updating `origins`, authoring and vocabulary lookup prefer the newer legacy text.

Attack harm uses the Rules and Rulings bands and an explicit fixed amount. Legacy notation remains available unchanged. Existing top-level `statline.harm` is preserved; a new blank summary uses the first attack's exact harm string. A zero-attack entry must supply the summary explicitly. No numeric conversion or schema removal occurs.

Sources: repository `pdfs/Rules And Rulings Guide.pdf`, PDF pages 15-16 and 38 (harm), 21 (tiers); `pdfs/The Unwoven - Adversary System.pdf`, PDF pages 7 and 15 (tiers/Origin suggestions), 4 (hybrids).
