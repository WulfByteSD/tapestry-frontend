# Tapestry Frontend Monorepo Guide

This repository contains the frontend applications for Tapestry.

## Monorepo Structure

Typical layout:

- `apps/admin` → storyweaver/admin-facing application
- `apps/player` → player-facing application
- `packages/*` → shared UI, types, utilities, API clients, and other shared modules

Treat this as a shared system, not two unrelated apps taped together.

## Core Rules for Working Here

- Prefer local, scoped changes.
- Avoid monorepo-wide edits unless explicitly required.
- Respect shared packages: a change in `packages/*` may affect both apps.
- Do not casually alter shared types, shared components, or shared client behavior.

## Canon Context

Relevant local docs live at:

- `../pdfs/`

When features or UI text depend on game logic, consult canon first.

Priority:

1. `../pdfs/Rules And Rulings Guide.pdf`
2. `../pdfs/Tapestry Players Guide V1.pdf`
3. `../pdfs/The Unwoven - Adversary System.pdf`
4. any tone/module/setting PDFs relevant to the feature

Do not default to D&D assumptions when naming or modeling gameplay concepts.

## Shared Package Discipline

Before editing `packages/*`, assume both apps may consume that code.
If changing shared code:

- keep the change backwards compatible where possible
- avoid app-specific hacks in shared packages
- prefer extension points over branching behavior
- note which apps are affected

## UI/UX Expectations

Tapestry is a game product, not a sterile business dashboard.
Interfaces should feel:

- readable
- thematic
- lightweight
- clear under real play conditions

Favor strong hierarchy, reusable UI, and terminology that fits the product.

## Boundaries

- Do not change build config, tooling, dependency versions, or monorepo wiring unless explicitly asked.
- Do not rename shared exports or types unless necessary.
- Do not make sweeping visual rewrites while solving a narrow task.

## Working Style

- Prefer 1–3 file changes when possible.
- If a task requires touching shared code plus both apps, explain why.
- If ambiguity is minor, make the safest reasonable assumption and proceed.
- Ask for clarification only when the task impacts architecture, shared contracts, or multiple app flows.

## Output Style

For each task:

- explain what changed
- state whether it affects admin, player, or shared packages
- call out any canon-sensitive wording or behavior
- mention any follow-up the sibling app may need
