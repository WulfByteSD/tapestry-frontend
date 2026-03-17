# Tapestry Player App Guide

This app is the player-facing portal for Tapestry.

## App Purpose

The player app should help players:

- view and manage their characters
- interact with campaigns they belong to
- engage with game content in a way that feels clear, immersive, and easy to use
- access rules-aware systems without being buried in admin complexity

The player experience should feel welcoming, game-like, and focused.

## Parent Context

Follow the repo-level guidance in:

- `../../AGENTS.md`

Use this file for player-specific priorities.

## Canon Context

Relevant local docs live at:

- `../../../pdfs/`

Consult canon when building anything tied to:

- characters
- Threads / Weaves / growth
- player-facing terminology
- rules-sensitive UI
- inventory, stats, conditions, or similar mechanics

Priority:

1. `../../../pdfs/Tapestry Players Guide V1.pdf`
2. `../../../pdfs/Rules And Rulings Guide.pdf`
3. `../../../pdfs/The Unwoven - Adversary System.pdf`
4. relevant setting/module docs as needed

If a UI choice conflicts with canon, preserve canon and explain the issue.

## Player UX Guidance

This app should prioritize:

- clarity first
- thematic presentation
- fast scanning on smaller screens
- easy interaction with character and campaign information
- game-native visuals rather than business-app patterns

Keep the player focused on "my character, my campaign, my options."

## Boundaries

- Prefer app-local changes before touching shared packages.
- Only move logic into shared code when both apps truly benefit.
- Do not expose admin-only language or workflows in the player app.
- Avoid unnecessary complexity in forms, navigation, or state flow.

## Terminology

Prefer player-friendly Tapestry language:

- Character
- Campaign
- Threads
- Weaves
- Storyweaver
- Unwoven

Use canonical names for mechanics. Do not casually translate them into D&D-ish stand-ins.

## Safety Rules

- Do not change auth, routing, build config, shared contracts, or global monorepo setup unless explicitly asked.
- Do not rewrite broad UI areas while solving a narrow player task.
- Be careful with shared types and API clients, since changes may affect admin too.

## Output Style

When completing a task:

- explain the player-visible result
- note whether shared code was touched
- mention any admin or API follow-up that may be needed
- call out canon-sensitive wording or mechanics
