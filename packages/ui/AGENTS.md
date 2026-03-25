# AGENTS.md

You are in the shared UI layer.

Rules:

- No app-specific business logic.
- No router logic.
- No API calls.
- No feature-specific naming if the component can be generic.
- Add exports through `src/index.ts`.
- Prefer flexible composition over app-specific branching.
