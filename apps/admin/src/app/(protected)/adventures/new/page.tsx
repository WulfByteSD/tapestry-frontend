import AdventureEditor from '@/features/adventures/AdventureEditor.component';
import { createAdminPageMetadata } from '@/app/pageMetadata';

export const metadata = createAdminPageMetadata({ title: 'Create adventure', description: 'Create a new adventure working draft.' });
export default function NewAdventurePage() { return <AdventureEditor />; }
