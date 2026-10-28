import { ResourcesFeature } from '@/features/resources/Resource.feature';
import { createRouteMetadata } from '@/lib/route-metadata';
import { Metadata } from 'next';

export const metadata: Metadata = createRouteMetadata({
  title: 'Tapestry TTRPG | Resources',
  description: 'Browse published Tapestry books, explore the free guides, and download PDFs for your next tabletop roleplaying session.',
  path: '/resources',
  robots: { index: true, follow: true },
});

export default function Page() {
  return <ResourcesFeature />;
}
