import type { Metadata } from 'next';
import { PublicCharacterSheet } from '@/features/characters/publicCharacterSheet/PublicCharacterSheet';

export const metadata: Metadata = {
  title: 'Character Sheet | Tapestry',
  description: 'A read-only Tapestry character sheet, shared for the table.',
  robots: { index: false, follow: false },
};

// Keep this route outside both (portal) and (public): neither login nor a
// redirect away from the page is needed, regardless of the viewer's session.
export default async function SharedCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicCharacterSheet key={id} identifier={id} />;
}
