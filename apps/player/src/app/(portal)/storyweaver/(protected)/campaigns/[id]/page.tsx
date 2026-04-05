// apps/player/src/app/(portal)/storyweaver/campaigns/[id]/page.tsx
import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignByIdPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/games/${id}/board`);
}
