# Tapestry Planning Context

## What Tapestry is
Tapestry is a tabletop RPG platform with a monorepo frontend that currently includes:
- `apps/player` for player-facing experiences
- `apps/admin` for admin/content-management experiences
- shared workspace packages for UI, hooks, types, and API client logic

## Product goals
- Build a cohesive platform for campaign play, character interaction, lore access, and admin content management
- Reuse shared packages where possible
- Keep UI and interaction patterns consistent across apps
- Avoid duplicated app-local implementations when a shared package is the better fit

## Architectural expectations
- Shared UI primitives belong in `packages/ui`
- Shared hooks and cross-app logic belong in `packages/hooks`
- Shared contracts and DTOs belong in `packages/types`
- App-specific orchestration belongs in `apps/player` or `apps/admin`

## Planning rules
When suggesting work:
- Prefer the smallest shippable slice over the biggest possible feature
- Distinguish frontend-only work from backend-dependent work
- Call out dependencies, blockers, and unknowns
- Recommend phased delivery when a feature is large
- Prefer maintainable composition over giant one-file implementations

## Current planning focus
We want help deciding:
1. what to build next
2. what the smartest next slice is
3. how to break large features into phased implementation plans

## Example large feature areas
- Game board / campaign board
- Play-by-post campaign feed
- Character action responses
- Grid battlemap
- Lore browsing/search
- Shared admin content workflows