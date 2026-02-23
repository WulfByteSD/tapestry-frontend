// apps/player/app/(portal)/characters/[id]/page.tsx
import CharacterSheetScreen from "@/features/characters/characterSheetScreen/CharacterSheetScreen";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "Character Sheet",
};

export default async function CharacterByIdPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const rawMode = searchParams ? await searchParams : undefined;
  const modeValue = Array.isArray(rawMode?.mode) ? rawMode.mode[0] : rawMode?.mode;
  const mode = modeValue === "build" ? "build" : "play";

  return <CharacterSheetScreen characterId={id} mode={mode} />;
}