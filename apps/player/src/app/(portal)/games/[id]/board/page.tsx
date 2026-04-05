import GameBoardView from '@/views/games/board/GameBoard.view';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `Game Board | Tapestry TTRPG`,
    description: 'Campaign game board where the adventure unfolds.',
  };
}

export default async function GameBoardPage({ params }: PageProps) {
  const { id } = await params;

  return <GameBoardView campaignId={id} />;
}
