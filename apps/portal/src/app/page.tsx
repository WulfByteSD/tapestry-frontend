import type { Metadata } from 'next';
import { HomeFeature } from '@/features/home/Home.feature';

const title = 'Tapestry | A Narrative Tabletop Roleplaying Game';
const description = 'Ordinary people. Extraordinary stories. Discover Tapestry, a narrative tabletop RPG where choices shape characters and Threads turn failure into possibility. Explore the free guides.';
const siteUrl = 'https://tapestry-ttrpg.com';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: `${siteUrl}/` },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/`,
    siteName: 'Tapestry',
    type: 'website',
    images: [{ url: `${siteUrl}/images/tapestry-story-scene.webp`, width: 1600, height: 900, alt: 'Golden Threads rising from a storyteller’s open book' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [`${siteUrl}/images/tapestry-story-scene.webp`] },
};

export default function Home() {
  return <HomeFeature />;
}
