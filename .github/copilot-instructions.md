# .github/copilot-instructions.md

This repository is a pnpm monorepo with shared workspace packages.

Architecture rules:

- Always inspect `packages/ui`, `packages/hooks`, `packages/types`, and `packages/api-client` before creating new app-local code.
- Prefer extending or composing an existing shared primitive over duplicating UI in `apps/admin` or `apps/player`.
- If code is likely to be reused across apps, move it into a workspace package instead of leaving it app-local.
- Do not create a new design-system primitive inside an app when it belongs in `packages/ui`.

React/Next structure:

- Keep route/page/view files focused on orchestration.
- Extract sections, hooks, mappers, helpers, and types into sibling files as complexity grows.
- Avoid giant multi-purpose files that mix fetching, normalization, state wiring, form setup, rendering, and helpers together.
- Prefer composition over prop drilling. If data must pass through several layers, refactor to context, a child container, or a shared hook.

Forms:

- Do not initialize one field at a time with long chains of `setState` or `setValue` calls in `useEffect`.
- Prefer one form model, one API-to-form mapper, and one form-to-payload mapper.
- Keep form-specific schema, defaults, and transforms near the form, not buried in the page file.

Shared package rules:

- Reusable visual primitives belong in `packages/ui`.
- Shared view logic belongs in `packages/hooks`.
- Shared DTOs and contracts belong in `packages/types`.
- API interaction logic belongs in `packages/api-client`.

Output expectations:

- Prefer small, maintainable files over single-file dumps.
- When making changes, explain what was reused, what was extracted, and whether anything should be promoted into a shared package.
- If you find yourself writing a lot of new code in an app, ask if it belongs in a shared package instead.
