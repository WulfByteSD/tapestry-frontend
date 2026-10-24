import UnwovenEditor from '@/features/unwoven/UnwovenEditor.component';
import { createAdminPageMetadata } from '@/app/pageMetadata';
export const metadata = createAdminPageMetadata({ title: 'Edit Unwoven', description: 'Edit an existing Unwoven.' });
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <UnwovenEditor id={id} />; }
