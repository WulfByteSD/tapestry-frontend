# Feature Candidates
---

## 3) Shared Module System
- **Status**: idea
- **Category**: admin feature
- **Value**: medium
- **Complexity**: high
- **Backend dependency**: yes
- **Priority notes**:
  - Interesting long-term storytelling feature
  - Not a current MVP priority
- **Vision**:
  - Create reusable game modules or one-shot story packs
  - Give Storyweavers structured inspiration, lore hooks, location hooks, and adventure scaffolding
- **Open questions**:
  - Are modules content packages, templates, or linked collections?
  - How much of this overlaps with lore, campaigns, and custom content?

---

## 4) Character Equipment Slot System
- **Status**: planned
- **Category**: player feature
- **Value**: high
- **Complexity**: medium
- **Backend dependency**: yes
- **Priority notes**:
  - Makes inventory/equipment feel much more game-like
  - Strong character-sheet improvement with clear gameplay value
- **Vision**:
  - Character sheet displays equippable slots such as chest, head, etc.
  - Clicking a slot allows add/change/remove actions
  - Only valid inventory items for that slot are shown
- **Dependencies**:
  - API validation to prevent invalid multi-slot conflicts such as equipping two chest items
- **Open questions**:
  - How are slots modeled in canonical item definitions?
  - Do we allow multi-slot or layered equipment later?

---

## 5) Purse System
- **Status**: idea
- **Category**: player feature
- **Value**: medium
- **Complexity**: low
- **Backend dependency**: maybe
- **Priority notes**:
  - Useful flavor/mechanics feature
  - Smaller than most items on this list
- **Vision**:
  - Add a purse mechanic to represent character wealth/status
  - Initial version could use clickable boxes or a more expressive visual interaction
- **Open questions**:
  - Is purse strictly presentational or tied to mechanics?
  - Does it belong directly on the sheet overview?

---

## 6) Active Campaigns View
- **Status**: planned
- **Category**: player feature
- **Value**: high
- **Complexity**: medium
- **Backend dependency**: yes
- **Priority notes**:
  - Important stepping stone toward campaign/game board workflows
  - Helps players immediately understand where they belong
- **Vision**:
  - Player can see campaigns they are actively part of
  - Entry point into campaign-specific views and future game board features
- **Open questions**:
  - What campaign summary data is needed?
  - What is the relationship between campaign cards and a future game board?

---

## 7) Guided Character Creation
- **Status**: planned
- **Category**: player feature
- **Value**: high
- **Complexity**: medium
- **Backend dependency**: maybe
- **Priority notes**:
  - Likely one of the highest-value player UX improvements
  - Replaces a weak “blank character” starting flow
- **Vision**:
  - Stepped UI that guides players through character creation
  - Replaces the current freeform “make blank character and figure it out” flow
- **Open questions**:
  - Which steps are mandatory versus optional?
  - How much validation happens per step?
  - Should unfinished creation be saved as draft progress?

---

## 8) Storyweaver Game Boards
- **Status**: idea
- **Category**: storyweaver feature
- **Value**: high
- **Complexity**: high
- **Backend dependency**: yes
- **Priority notes**:
  - Major platform feature
  - Too large to treat as a single deliverable
- **Vision**:
  - Storyweaver can create a game board for a campaign
  - This becomes a central campaign interaction surface
- **Possible slices**:
  - Campaign overview only
  - Campaign activity feed
  - Player responses/actions
  - Richer board tools
- **Open questions**:
  - What is the smallest useful version?
  - Does phase 1 need combat/grid at all?

---

## 9) Storyweaver Custom Content
- **Status**: idea
- **Category**: storyweaver feature
- **Value**: high
- **Complexity**: high
- **Backend dependency**: yes
- **Priority notes**:
  - Valuable, but not ready for MVP
  - Likely depends on patterns proven in admin content tools
- **Vision**:
  - Non-admin Storyweavers can create campaign-level custom content
  - Should borrow heavily from admin content boards
- **Open questions**:
  - What permissions and scoping rules apply?
  - What content types are supported first?

---

## 10) Invite System
- **Status**: idea
- **Category**: storyweaver feature
- **Value**: high
- **Complexity**: medium
- **Backend dependency**: yes
- **Priority notes**:
  - Important for campaign formation and multiplayer flow
- **Vision**:
  - Storyweaver can invite players to games/campaigns
- **Open questions**:
  - Are invites email-based, username-based, or share-link based?
  - What happens to pending invites?

---

## 11) Campaign Overview / News Cards
- **Status**: idea
- **Category**: storyweaver feature
- **Value**: medium
- **Complexity**: medium
- **Backend dependency**: yes
- **Priority notes**:
  - Good phase-1 stepping stone toward a fuller game board
- **Vision**:
  - Storyweaver can post notes, updates, or news cards for a campaign
  - Players see these on their campaign/dashboard surfaces
- **Open questions**:
  - Is this just a campaign feed MVP?
  - Are posts narrative only, or stateful/actionable?

---

## 12) Encounter System
- **Status**: blocked
- **Category**: storyweaver feature
- **Value**: high
- **Complexity**: high
- **Backend dependency**: yes
- **Priority notes**:
  - Important long-term gameplay system
  - API is not ready, so not a near-term frontend target
- **Vision**:
  - Storyweaver can create and run dynamic combat encounters
  - Supports turn order, custom adversaries, and table-derived adversaries
- **Open questions**:
  - What is the minimal data model?
  - What belongs in encounter prep vs live encounter running?

---

## 13) LFG (Looking for Games)
- **Status**: idea
- **Category**: shared player/storyweaver feature
- **Value**: medium
- **Complexity**: medium
- **Backend dependency**: yes
- **Priority notes**:
  - Social growth feature
  - Probably not as foundational as campaign/member flows
- **Vision**:
  - Show open non-private campaigns
  - Allow players to petition/request to join
- **Open questions**:
  - How are applications moderated?
  - What information is public?

---

## 14) Lore Browsing
- **Status**: idea
- **Category**: shared player/storyweaver feature
- **Value**: high
- **Complexity**: high
- **Backend dependency**: yes
- **Priority notes**:
  - Very useful feature with strong worldbuilding value
  - Large enough to require phased delivery
- **Vision**:
  - Browse and query lore nodes by setting
  - Each lore entry shows parent/child relationships and related entities
  - Users can navigate across relationships such as location, faction, NPC, etc.
- **Open questions**:
  - What is the MVP: search results, single-node detail, or relationship traversal?
  - How much graph depth is shown at once?