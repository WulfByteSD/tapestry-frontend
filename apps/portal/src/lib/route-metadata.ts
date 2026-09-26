import type { Metadata } from 'next';

const SITE_NAME = 'Tapestry';

const defaultKeywords = [
  'Tapestry',
  'tabletop roleplaying',
  'TTRPG',
  'RPG',
  'roleplaying game',
  'stories woven together',
  'collaborative storytelling',
  'world-building',
  'character development',
];

const privateRouteRobots: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

type RouteMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  robots?: Metadata['robots'];
};

export const MetadataBase = new URL('https://tapestry-ttrpg.com');

export function createRouteMetadata({
  title,
  description,
  path,
  keywords = [],
  robots = privateRouteRobots,
}: RouteMetadataInput): Metadata {
  return {
    title,
    description,
    applicationName: SITE_NAME,
    category: 'Gaming',
    creator: SITE_NAME,
    publisher: SITE_NAME,
    keywords: [...defaultKeywords, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots,
  };
}
