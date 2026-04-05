

# Plan a feature MVP for Tapestry

You are planning an implementation for the Tapestry frontend monorepo.

Read and use these files first:
- [Planning Context](../../docs/product/planning-context.md)
- [Feature Candidates](../../docs/product/feature-candidates.md)

Inspect the repository before planning, especially:
- `apps/player`
- `apps/admin`
- `packages/ui`
- `packages/hooks`
- `packages/types`
- `packages/api-client`

## Feature to plan
{{FEATURE_NAME}}

## Optional additional context
{{ADDITIONAL_CONTEXT}}

## Goal
Break the chosen feature into a sane MVP and phased implementation plan that fits the current monorepo.

## Planning rules
- Prefer a thin vertical slice over a broad incomplete system
- Separate:
  - frontend-only work
  - backend-dependent work
  - shared-package work
  - app-specific work
- If the feature is large, propose a phase 1, phase 2, and later expansion path
- Call out what should be mocked if backend support is missing
- Recommend when code should live in a shared package versus an app
- Avoid giant all-in-one files and overstuffed components
- Prefer maintainable composition and extraction points

## Output format
Return:

1. **Feature summary**
   - what this feature is
   - who it serves
   - why it matters

2. **MVP definition**
   - what is explicitly in scope
   - what is explicitly out of scope
   - what makes the MVP "done"

3. **Architecture placement**
   - what belongs in `apps/player`
   - what belongs in `apps/admin`
   - what belongs in `packages/ui`
   - what belongs in `packages/hooks`
   - what belongs in `packages/types`
   - what belongs in `packages/api-client`

4. **Phased breakdown**
   For each phase include:
   - goal
   - deliverables
   - dependencies
   - risk level

5. **Implementation slices**
   Break phase 1 into concrete steps.
   For each step include:
   - title
   - purpose
   - likely files/folders affected
   - whether backend support is required
   - whether the work is reusable/shared

6. **Risks and unknowns**
   - technical risks
   - product risks
   - missing decisions
   - recommended assumptions to unblock progress

7. **Recommended starting point**
   - the first coding task to perform
   - why this is the correct first move