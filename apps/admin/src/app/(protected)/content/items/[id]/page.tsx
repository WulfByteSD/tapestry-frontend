import { createAdminPageMetadata } from '@/app/pageMetadata';
import ItemEditor from '@/views/content/items/itemEditor/ItemEditor.component';

export const metadata = createAdminPageMetadata({
  title: 'Edit Item',
  description: 'Update an item record and its connected gameplay details within the admin workspace.',
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ItemEditor id={id} />;
}
