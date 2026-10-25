import { PublicSheetState } from '@/features/characters/publicCharacterSheet/PublicSheetState';

export default function SharedCharacterNotFound() {
  return <PublicSheetState title="Character sheet unavailable" message="This character could not be found or is no longer available for public viewing. Check the link or ask the player for their character share link." />;
}
