import GamesView from "@/views/games/Games.view";

export const metadata = {
  title: "Games | Tapestry TTRPG",
  description: "Discover active campaigns and request to join.",
};

export default function GamesPage() {
  return <GamesView />;
}