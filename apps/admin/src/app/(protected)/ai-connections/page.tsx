import { createAdminPageMetadata } from '@/app/pageMetadata';
import AiConnectionsView from '@/views/ai-connections/AiConnectionsView.component';

export const metadata = createAdminPageMetadata({ title: 'AI connections', description: 'Manage registered AI applications, scoped content grants, human proposal review and connection audit history.' });
export default function AiConnectionsPage() { return <AiConnectionsView />; }
