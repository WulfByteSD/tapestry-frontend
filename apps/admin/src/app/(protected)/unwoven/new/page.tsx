import UnwovenEditor from '@/features/unwoven/UnwovenEditor.component';
import { createAdminPageMetadata } from '@/app/pageMetadata';
export const metadata = createAdminPageMetadata({ title: 'Create Unwoven', description: 'Build a new Unwoven.' });
export default function Page() { return <UnwovenEditor />; }
