import { createAdminPageMetadata } from '@/app/pageMetadata';
import SkillsView from '@/views/content/skills/SkillsView.component';

export const metadata = createAdminPageMetadata({
  title: 'Skills',
  description: 'Open the skill management route for setting-specific proficiencies and progression data.',
});

export default async function ContentPage() {
  return <SkillsView />;
}
