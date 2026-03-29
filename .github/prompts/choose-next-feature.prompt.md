# Choose the smartest next feature for Tapestry

Your job is to act as a product planning partner for the Tapestry frontend monorepo.

Read and use these files first:
- [Planning Context](../../docs/product/planning-context.md)
- [Feature Candidates](../../docs/product/feature-candidates.md)

Also inspect the repository structure and relevant code before making recommendations, especially:
- `apps/player`
- `apps/admin`
- `packages/ui`
- `packages/hooks`
- `packages/types`
- `packages/api-client`

## Goal
Recommend the smartest next thing to work on based on:
- current repository structure
- current shared packages
- feature candidates in the product docs
- likely implementation risk
- smallest valuable slice

## Rules
- Do not give generic product advice
- Do not suggest vague items like "improve UX" unless tied to a specific workflow
- Distinguish between:
  - frontend-only work
  - backend-dependent work
  - shared package opportunity
  - app-specific implementation
- Prefer the smallest shippable slice over a giant feature
- If a candidate is too large, propose the best phase 1 instead
- Call out assumptions and unknowns clearly

## Scoring criteria
Score each candidate on:
1. user value
2. strategic value
3. implementation complexity
4. dependency risk
5. fit with current architecture
6. smallest shippable increment

## Output format
Return:
1. **Repository understanding**
   - what the platform appears to do today
   - what the frontend architecture appears optimized for

2. **Ranked feature recommendations**
   For each top candidate include:
   - title
   - category
   - why it matters
   - likely packages/apps affected
   - blockers/dependencies
   - recommended first slice
   - confidence

3. **Decision**
   - best next quick win
   - best next strategic investment
   - best shared-package extraction opportunity

4. **Recommendation**
   - name the single best next task to work on now
   - explain why this beats the other options
   - describe the exact scope boundary for phase 1

Be opinionated. Do not sit on the fence.