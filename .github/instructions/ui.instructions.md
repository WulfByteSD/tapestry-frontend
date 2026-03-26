---
applyTo: 'packages/ui/**/*.ts,packages/ui/**/*.tsx'
---

When working in `packages/ui`:

- Components must stay generic and reusable across apps.
- Do not add app-specific business terms, route logic, or API calls.
- Prefer composition and extension points over one-off variants for a single screen.
- Export new components through `packages/ui/src/index.ts`.
- Keep each component folder focused and small.
- If a component grows large, split it into sibling files for sections, hooks, mapping utilities, and types.
- the Shared UI package is designed to be reused across multiple applications. Avoid adding app-specific logic, routes, or API calls. Instead, focus on creating generic, composable components that can be easily extended or customized by individual apps. If you find yourself needing to add app-specific behavior, consider whether it belongs in a shared hook or if it should be implemented within the app itself using the primitives from `packages/ui`.