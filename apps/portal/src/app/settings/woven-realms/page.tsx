import { SettingsFeature } from '@/features/settings/Settings.feature';
import { createRouteMetadata } from '@/lib/route-metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createRouteMetadata({
  title: 'Tapestry TTRPG | Woven Realms',
  description: 'Explore the Woven Realms: begin in Everpine, discover the tensions shaping Caltheris, and find published Tapestry setting books.',
  path: '/settings/woven-realms',
  robots: { index: true, follow: true },
});

export default function WovenRealmsPage() {
  return <SettingsFeature />;
}
