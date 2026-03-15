import GameOverviewView from "@/views/games/GameOverview.view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return {
    title: `Game ${id} | Tapestry TTRPG`,
    description: "Campaign overview and join request page.",
  };
}

export default async function GameOverviewPage({ params }: PageProps) {
  const { id } = await params;

  return <GameOverviewView gameId={id} />;
}
