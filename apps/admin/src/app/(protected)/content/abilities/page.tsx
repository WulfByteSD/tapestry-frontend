import { createAdminPageMetadata } from '@/app/pageMetadata';
import AbilitiesView from '@/views/content/abilities/AbilitiesView.component';

export const metadata = createAdminPageMetadata({
  title: 'Abilities',
  description: 'Open the ability management route for setting-specific powers, actions, and gameplay hooks.',
});

export default async function ContentPage() {
  return <AbilitiesView />;
}
