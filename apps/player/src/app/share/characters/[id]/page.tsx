import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicCharacterSheet } from '@/features/characters/publicCharacterSheet/PublicCharacterSheet';
import { CharacterLoadError, fetchPublicCharacter } from '@/features/characters/publicCharacterSheet/public-character';

// Render fresh character data into the initial HTML, including for readers without JavaScript.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Character Sheet | Tapestry',
  description: 'A read-only Tapestry character sheet, shared for the table.',
  robots: { index: false, follow: false },
};

// Keep this route outside both (portal) and (public): neither login nor a
// redirect away from the page is needed, regardless of the viewer's session.
export default async function SharedCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let character;
  try {
    character = await fetchPublicCharacter(id);
  } catch (error) {
    if (error instanceof CharacterLoadError && [400, 401, 403, 404].includes(error.status)) {
      notFound();
    }
    throw error;
  }
  return <PublicCharacterSheet character={character} identifier={id} />;
}
