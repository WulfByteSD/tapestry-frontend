import { createAdminPageMetadata } from '@/app/pageMetadata';
import SkillEditor from '@/views/content/skills/skillEditor/SkillEditor.component';

export const metadata = createAdminPageMetadata({
  title: 'New Skill',
  description: 'Create a new skill record for a setting and prepare it for broader content authoring.',
});

export default async function Page() {
  return <SkillEditor />;
}
