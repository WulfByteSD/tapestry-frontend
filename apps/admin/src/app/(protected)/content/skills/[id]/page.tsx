import { createAdminPageMetadata } from '@/app/pageMetadata';
import SkillEditor from '@/views/content/skills/skillEditor/SkillEditor.component';

export const metadata = createAdminPageMetadata({
  title: 'Edit Skill',
  description: 'Update a skill record and its supporting gameplay details within the admin workspace.',
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <SkillEditor id={id} />;
}
