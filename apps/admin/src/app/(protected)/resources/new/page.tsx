import { createAdminPageMetadata } from '@/app/pageMetadata';
import ResourcesWorkspace from '@/features/store/_components/resourcesWorkspace/ResourcesWorkspace.component';

export const metadata = createAdminPageMetadata({
  title: 'New Resource',
  description: 'Create a canonical library resource and attach its Cloudinary-backed release metadata.',
});

export default function NewResourcePage() {
  return <ResourcesWorkspace initialNew />;
}
