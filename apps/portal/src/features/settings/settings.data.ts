import type { LibraryResource, SettingDefinition } from '@tapestry/types';

export type PortalLoreResource = Pick<LibraryResource, 'slug' | 'title' | 'summary' | 'description' | 'kind' | 'format' | 'tags'> & {
  eyebrow: string;
  note: string;
  bullets: string[];
};

export const fallbackOfficialSettings: SettingDefinition[] = [
  {
    _id: 'woven-realms-fallback',
    key: 'woven-realms',
    name: 'Woven Realms',
    description:
      'A fate-marked fantasy setting where memory, oaths, and ordinary choices leave visible marks on kingdoms already straining under hunger, rebellion, and old promises.',
    status: 'published',
    tags: ['official setting', 'fantasy frontier', 'fate-marked history'],
    rulesetVersion: 1,
    modules: {
      lore: true,
      maps: true,
      magic: true,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export const wovenRealmsHighlights = [
  'The world remembers every oath, kindness, and failure.',
  'Caltheris is fraying while Lord Draco rises in the gaps.',
  'The same setting can hold frontier hardship, romance, myth, and war.',
] as const;

export const wovenRealmsEntryPoints = [
  {
    title: 'Everpine',
    eyebrow: 'Frontier starting point',
    description:
      'A neutral village in the Greywatch Peaks where caravans, refugees, mercenaries, and local families all meet around the Clearstream.',
    tags: ['neutrality under strain', 'crossroads village', 'Old Spirits ritual'],
  },
  {
    title: 'The Fraying of Caltheris',
    eyebrow: 'Realm tension',
    description:
      'The crown that once steadied the realms is slipping under famine, thin coffers, and rumors that travel faster than royal decrees.',
    tags: ['crown in decline', 'famine pressure', 'political fracture'],
  },
  {
    title: 'Lord Draco and the Frontier',
    eyebrow: 'Conflict line',
    description:
      'Draco promises dignity and fire to the weary while villages like Everpine, Hollowfen, and Greystone are forced to choose who they can afford to anger.',
    tags: ['rebellion pressure', 'border loyalties', 'shadowed frontier'],
  },
] as const;

export const wovenRealmsSourcebooks: PortalLoreResource[] = [
  {
    slug: 'woven-realms-world-lore',
    eyebrow: 'Setting sourcebook',
    title: 'The Woven Realms - World Lore',
    summary: 'The broad setting frame for the realms, their memory, and the political strain pulling the central kingdoms apart.',
    description:
      'Use this when you want the high view: what the realms are, why fate matters here, where Caltheris is breaking, and why even quiet villages sit inside larger patterns.',
    kind: 'guide',
    format: 'pdf',
    tags: ['setting overview', 'Caltheris', 'Lord Draco', 'Shadowed Frontier'],
    note: 'Canonical PDF archive source',
    bullets: ['Fate leaves public memory on the world', 'Caltheris is the knot now coming loose', 'Villages at the frontier survive under constant pressure'],
  },
  {
    slug: 'woven-realms-everpine',
    eyebrow: 'Local dossier',
    title: 'The Woven Realms - Everpine',
    summary: 'A grounded starting location built around trade, neutrality, and survival in the Greywatch Peaks.',
    description:
      'Use this when you want a place to begin play. Everpine is large by border standards, split by the Clearstream, and shaped by rituals, road traffic, and the cost of staying neutral.',
    kind: 'guide',
    format: 'pdf',
    tags: ['Everpine', 'Greywatch Peaks', 'Clearstream', 'frontier play'],
    note: 'Canonical PDF archive source',
    bullets: ['Nearly five hundred souls hold the village together', 'Long-Woven, Stonebound, Hearthkin, and Cursed Thread travelers all leave their mark', 'The yearly pine-effigy ritual remembers the wolves and the bargain with survival'],
  },
];

export function getSettingModuleLabels(setting: SettingDefinition) {
  const modules: string[] = [];

  if (setting.modules?.lore) modules.push('Lore');
  if (setting.modules?.maps) modules.push('Maps');
  if (setting.modules?.magic) modules.push('Magic');
  if (setting.modules?.items) modules.push('Items');

  return modules;
}
