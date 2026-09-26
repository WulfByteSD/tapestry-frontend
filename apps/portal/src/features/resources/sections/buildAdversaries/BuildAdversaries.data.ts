import type { LibraryResource } from '@tapestry/types';

type AdversaryResourceCard = {
  eyebrow: string;
  title: string;
  description: string;
  detailList: readonly string[];
  hrefLabel: string;
  pendingLabel: string;
};

export const adversaryResourceSlugs = {
  builder: 'the-unwoven-adversary-system',
  compendium: 'adversary-compendium-creatures-of-the-unwoven',
} as const;

export const adversaryPillars = [
  {
    title: 'Build on the fly',
    body: 'Create a threat quickly without writing a full stat block first.',
  },
  {
    title: 'Pressure before numbers',
    body: 'Type, Role, and Perks should describe how the foe changes the scene.',
  },
  {
    title: 'Scale by Weave',
    body: 'Tiers map to the heroes arcs, from fragile pressure to mythic danger.',
  },
] as const;

export const adversaryBuilderResource: AdversaryResourceCard = {
  eyebrow: 'Build adversaries',
  title: 'The Unwoven - Adversary System',
  description:
    'A modular framework for building unique adversaries across settings and tones. The canon positions Unwoven as story antagonists first, then gives you fast tools to scale their staying power, pressure, and conditions.',
  detailList: ['Type + Role + Perks', 'Conditions over crunch', 'Reskin endlessly across tones'],
  hrefLabel: 'Open the guide',
  pendingLabel: 'Resource publishing soon',
} as const;

export const adversaryCompendiumResource: AdversaryResourceCard = {
  eyebrow: 'Approved drop-ins',
  title: 'Adversary Compendium: Creatures of the Unwoven',
  description:
    'A setting-agnostic toolbox of approved creatures and enemy archetypes that can be dropped into play fast. Use it when you want a finished threat, then reskin it to fit the scene at hand.',
  detailList: ['Quick reference entries', 'Narrative hooks on every foe', 'Scales from fragile to mythic'],
  hrefLabel: 'Open the compendium',
  pendingLabel: 'Compendium resource coming soon',
} as const;

const HTTP_PROTOCOL_PATTERN = /^https?:\/\//i;

function getHttpAssetHref(resource?: LibraryResource) {
  const assetKey = resource?.currentRelease?.assetKey?.trim();

  if (!assetKey || !HTTP_PROTOCOL_PATTERN.test(assetKey)) {
    return undefined;
  }

  return assetKey;
}

export function withFetchedResource(fallback: AdversaryResourceCard, resource?: LibraryResource): AdversaryResourceCard & { href?: string } {
  return {
    ...fallback,
    title: resource?.title || fallback.title,
    description: resource?.description || resource?.summary || fallback.description,
    href: getHttpAssetHref(resource),
  };
}
