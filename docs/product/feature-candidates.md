# Feature Candidates

Use this file as the source of truth for candidate work. Keep rough ideas here even if they are not fully defined yet.

## How to read this file
Each feature should include:
- **Status**: idea | researching | planned | in progress | blocked
- **Category**: player feature | admin feature | shared package | refactor | infrastructure
- **Value**: high | medium | low
- **Complexity**: high | medium | low
- **Backend dependency**: yes | no | unknown
- **Priority notes**: why this matters now
- **Open questions**: unknowns that affect planning

---

## 1) Campaign Game Board
- **Status**: idea
- **Category**: player feature
- **Value**: high
- **Complexity**: high
- **Backend dependency**: yes
- **Priority notes**:
  - This feels like a core product differentiator
  - Could become the main surface for campaign interaction
- **Vision**:
  - A player logs into a campaign and sees a campaign board
  - The board shows campaign posts, updates, and what happens next
  - Players can respond in character
  - Players can submit actions
  - Over time this may include a battlemap with a grid
- **Possible slices**:
  - Campaign activity feed only
  - Feed + player responses
  - Structured action submission
  - Battlemap/grid
- **Open questions**:
  - Is phase 1 frontend-only with mock data?
  - What role does admin/GM have in posting or moderating entries?
  - Are posts purely narrative or can they represent turn/state transitions?
### Suggested likely MVP path
1. Campaign activity feed
2. Readable post detail
3. Player in-character responses
4. Structured action submission
5. GM/admin posting tools
6. Battlemap/grid as a later phase

---

## 2) Lore Browsing
- **Status**: idea
- **Category**: player feature
- **Value**: medium
- **Complexity**: medium
- **Backend dependency**: yes
- **Priority notes**:
  - Supports immersion and setting discovery
  - May pair well with campaign gameplay later
- **Vision**:
  - Players can browse and search lore by setting, region, faction, NPC, etc.
- **Open questions**:
  - Is this tree-based, node-based, or category-based?
  - Does it need permissions/unlock states?

---

## 3) Admin Content Bulk Seeding Improvements
- **Status**: researching
- **Category**: admin feature
- **Value**: high
- **Complexity**: medium
- **Backend dependency**: yes
- **Priority notes**:
  - Speeds up content creation significantly
- **Vision**:
  - Upload CSV and bulk create/update content definitions cleanly
- **Open questions**:
  - Validation strategy?
  - Preview/dry-run support?

---

## 4) Shared Form Architecture Cleanup
- **Status**: idea
- **Category**: refactor
- **Value**: medium
- **Complexity**: medium
- **Backend dependency**: no
- **Priority notes**:
  - Reduces messy form implementations and repeated patterns
- **Vision**:
  - Shared form composition patterns and mapping utilities
- **Open questions**:
  - What belongs in `packages/ui` vs app-level forms?

---

## 5) Character Sheet UX Expansion
- **Status**: idea
- **Category**: player feature
- **Value**: medium
- **Complexity**: medium
- **Backend dependency**: maybe
- **Priority notes**:
  - Supports everyday player use
- **Vision**:
  - Better quick actions, summary views, and gameplay interactions from the sheet
- **Open questions**:
  - Which workflows are most frequent during sessions?