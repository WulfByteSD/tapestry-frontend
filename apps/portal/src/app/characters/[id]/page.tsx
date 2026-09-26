import type { Metadata } from 'next';
import { PublicCharacterSheet } from '@/features/characters/PublicCharacterSheet';

export const metadata: Metadata = {
  title: 'Character Sheet | Tapestry',
  description: 'A read-only Tapestry character sheet, shared for the table.',
  robots: { index: false, follow: false },
};

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Keep the route identifier opaque so a future API slug lookup needs no URL change.
  return <PublicCharacterSheet key={id} identifier={id} />;
}
