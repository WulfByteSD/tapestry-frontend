import { SettingsFeature } from '@/features/settings/Settings.feature';
import { createRouteMetadata } from '@/lib/route-metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = createRouteMetadata({
  title: 'Tapestry TTRPG | Woven Realms',
  description: 'Explore the official Woven Realms setting, its frontier pressures, and the canon sources that shape play inside the portal.',
  path: '/settings/woven-realms',
});

export default function WovenRealmsPage() {
  return <SettingsFeature />;
}
