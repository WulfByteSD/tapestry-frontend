import { ResourcesFeature } from '@/features/resources/Resource.feature';
import { createRouteMetadata } from '@/lib/route-metadata';
import { Metadata } from 'next';

export const metadata: Metadata = createRouteMetadata({
  title: 'Tapestry TTRPG | Resources',
  description: 'A collection of resources for Tapestry players, including guides, character sheets, and more.',
  path: '/resources',
});

export default function Page() {
  return <ResourcesFeature />;
}
