import { createAdminPageMetadata } from '@/app/pageMetadata';
import PlayerDetailView from '@/views/players/PlayerDetailView.component';

export const metadata = createAdminPageMetadata({
  title: 'Player Details',
  description: 'View player profile, account information, and associated resources.',
});

type PlayerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const { id } = await params;
  return <PlayerDetailView playerId={id} />;
}
