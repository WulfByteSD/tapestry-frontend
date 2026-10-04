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
- Respect shared packages: a change in `packages/*` may affect all apps.
- Do not casually alter shared types, shared components, or shared client behavior.

## Multi-agent context-efficiency policy

When using frontend subagents, optimize for context reuse rather than
independent rediscovery.

Use dependent agents sequentially, not in parallel:

1. ui_architect performs bounded discovery and returns a concise implementation brief.
2. The coordinator compresses those findings into a targeted implementation assignment.
3. frontend_builder receives that targeted assignment. Do not give it the original
   broad discovery prompt or ask it to repeat the architecture audit.
4. After implementation, ui_reviewer receives the approved requirements and should
   inspect the git diff / changed files first.
5. Send only actionable reviewer findings back to the existing frontend_builder
   for a targeted correction pass.

Do not ask multiple agents to independently establish the same repository context.

Only the ui_architect may perform broad frontend discovery.
Builder and reviewer exploration must remain local to the files and dependencies
necessary for their assigned work.

If a downstream agent lacks required information, it should request that specific
information from the coordinator rather than broadening its own exploration.

Prefer passing concise findings, file paths, symbols, constraints, and acceptance
criteria between agents instead of passing raw research or asking agents to rediscover it.

Do not spawn all agents simultaneously when later work depends on earlier findings.

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
