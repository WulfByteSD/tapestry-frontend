import { createAdminPageMetadata } from '@/app/pageMetadata';
import ResourcesWorkspace from '@/features/store/_components/resourcesWorkspace/ResourcesWorkspace.component';

export const metadata = createAdminPageMetadata({
  title: 'Edit Resource',
  description: 'Update a canonical library resource record, release metadata, and presentation assets.',
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResourceDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ResourcesWorkspace initialResourceId={id} />;
}
