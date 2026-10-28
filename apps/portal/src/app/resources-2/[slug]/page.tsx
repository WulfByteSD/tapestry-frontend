import { notFound, permanentRedirect } from 'next/navigation';

// Public URLs observed in the WordPress site's navigation.
const destinations: Record<string, string> = {
  'tapestry-players-guide': '/resources?book=tapestry-players-guide#book-details',
  'tapestry-storyweavers': '/resources#run-the-game',
  'tapestry-adversaries': '/resources#build-adversaries',
};

export default async function LegacyResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = destinations[slug];
  if (!Object.hasOwn(destinations, slug) || !destination) notFound();
  permanentRedirect(destination);
}

