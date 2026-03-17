# Tapestry Admin App Guide

This app is the storyweaver/admin-facing interface for Tapestry.

## App Purpose

The admin app supports storyweavers and administrators doing tasks such as:

- creating and managing campaigns
- viewing/editing game-facing content
- managing settings, structure, and player-facing data
- preparing play tools and future system-driven features

This app should feel like a game-management space, not a bland enterprise dashboard.

## Parent Context

Follow the repo-level guidance in:

- `../../AGENTS.md`

Use this file for admin-specific priorities.

## Canon Context

Relevant local docs live at:

- `../../../pdfs/`

Use canon when UI, labels, or workflows touch:

- Storyweaver terminology
- campaign/story structure
- Threads / Weaves / Unwoven concepts
- rules-sensitive content editing

Priority:

1. `../../../pdfs/Rules And Rulings Guide.pdf`
2. `../../../pdfs/Tapestry Players Guide V1.pdf`
3. `../../../pdfs/The Storyweavers Loom.pdf`
4. `../../../pdfs/The Unwoven - Adversary System.pdf`
5. any relevant module/setting docs

## Admin UX Guidance

This interface is for creation, orchestration, and oversight.
Prefer:

- strong information hierarchy
- board/sheet/card patterns over plain CRUD sludge
- clear workflows with low friction
- components that feel game-adjacent, not corporate/admin-template-heavy

Do not overcomplicate flows with unnecessary abstraction.

## Scope Rules

- Prefer app-local changes first.
- Only change shared packages if the improvement truly belongs to both apps.
- Do not leak admin-only assumptions into player-facing shared components.
- Avoid changing global styling or shared UI contracts unless needed.

## Terminology

Use Tapestry-native language where appropriate:

- Storyweaver
- Campaign
- Threads
- Weaves
- Unwoven
- Tone Modules

Avoid replacing established Tapestry terms with generic substitutes unless the UI specifically needs plainer onboarding language.

## Safety Rules

- Do not alter auth, routing architecture, app shell structure, or shared config unless explicitly asked.
- Do not make large visual rewrites while solving focused feature work.
- Do not modify shared types or API clients casually.

## Output Style

When completing a task:

- explain the user-facing result
- note whether shared packages were touched
- mention any player-app implications
- call out canon-sensitive choices
