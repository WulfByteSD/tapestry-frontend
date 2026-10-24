import AdventuresWorkspace from '@/features/adventures/AdventuresWorkspace.component';
import { createAdminPageMetadata } from '@/app/pageMetadata';

export const metadata = createAdminPageMetadata({ title: 'Adventures', description: 'Author adventure modules, story sections, resources and encounter recommendations.' });
export default function AdventuresPage() { return <AdventuresWorkspace />; }
