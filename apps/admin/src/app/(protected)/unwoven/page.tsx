import UnwovenWorkspace from '@/features/unwoven/UnwovenWorkspace.component';
import { createAdminPageMetadata } from '@/app/pageMetadata';
export const metadata = createAdminPageMetadata({ title: 'Unwoven', description: 'Build and manage the Unwoven catalog.' });
export default function Page() { return <UnwovenWorkspace />; }
