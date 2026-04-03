import { createAdminPageMetadata } from '@/app/pageMetadata';
import PlayersView from '@/views/players/PlayersView.component';

export const metadata = createAdminPageMetadata({
  title: 'Players',
  description: 'Browse and manage player accounts, profiles, and resources.',
});

export default function PlayersPage() {
  return <PlayersView />;
}
