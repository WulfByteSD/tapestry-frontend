import { createAdminPageMetadata } from '@/app/pageMetadata';
import ResourcesWorkspace from '@/features/store/_components/resourcesWorkspace/ResourcesWorkspace.component';

export const metadata = createAdminPageMetadata({
  title: 'Resources',
  description: 'Browse and manage canonical library resources used by the store and entitlement flows.',
});

export default function ResourcesPage() {
  return <ResourcesWorkspace />;
}
