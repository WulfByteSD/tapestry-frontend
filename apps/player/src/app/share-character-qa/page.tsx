'use client';
import SheetCard from '@/components/sheetCard/SheetCard.component';
import CampaignCharacterCard from '@/features/gameBoard/zones/character/CampaignCharacterCard';
import type { CharacterSheet } from '@tapestry/types';
import { useLogout } from '@/lib/auth-hooks';
const fixture = ({
  "_id": "507f1f77bcf86cd799439011",
  "name": "Ash of Everpine",
  "player": "private-player",
  "status": "active",
  "tags": ["Wayfinder"],
  "createdAt": "2026-09-26T12:00:00Z",
  "updatedAt": "2026-09-26T12:00:00Z",
  "sheet": {
    "weaveLevel": 3,
    "dtn": 14,
    "archetypeKey": "wayfinder",
    "profile": {"title": "Keeper of the northern trail", "bio": "A quiet guide following the last lights of Everpine."},
    "aspects": {"might": {"strength": 1, "presence": 0}, "finesse": {"agility": 2, "charm": -1}, "wit": {"instinct": 2, "knowledge": 1}, "resolve": {"willpower": 1, "empathy": 0}},
    "resources": {"hp": {"current": 9, "max": 13, "temp": 2}, "threads": {"current": 0, "max": 3}, "other": {"armor": 2}},
    "skills": {"survival": 2},
    "features": [], "inventory": [], "conditions": [], "learnedAbilities": [],
    "noteCards": [{"id": "private", "title": "PRIVATE-JOURNAL", "body": "not public", "kind": "general", "createdAt": "2026-09-26T12:00:00Z", "updatedAt": "2026-09-26T12:00:00Z"}]
  }
}
) as CharacterSheet;
export default function QaPage() {
  const logout = useLogout();
  return <main style={{maxWidth: 480, margin: '24px auto', padding: 16, display: 'grid', gap: 24}}>
    <h1>Local character-card check</h1>
    <SheetCard character={fixture} />
    <CampaignCharacterCard character={fixture} canDetach={false} onDetach={() => {}} />
    <button type="button" onClick={logout}>End test session</button>
  </main>;
}
