---
applyTo: 'apps/**/*.ts,apps/**/*.tsx'
---

When working in app code:

- Treat `packages/ui` as the default source for shared UI primitives.
- Treat app code as feature composition, routing, and app-specific orchestration.
- Before creating a new component, check whether it is:
  1. a shared primitive -> move to `packages/ui`
  2. shared logic -> move to `packages/hooks`
  3. app-specific composition -> keep in the app
- Avoid app-local copies of buttons, tabs, cards, inputs, modals, tables, or other base primitives already available from `@tapestry/ui`.
- Keep feature folders modular. Split large files into sibling files for sections, hooks, mapping utilities, and types.
