import AdventureEditor from '@/features/adventures/AdventureEditor.component';
import { createAdminPageMetadata } from '@/app/pageMetadata';

export const metadata = createAdminPageMetadata({ title: 'Edit adventure', description: 'Edit and review an adventure working draft.' });
export default async function AdventurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdventureEditor id={id} />;
}
