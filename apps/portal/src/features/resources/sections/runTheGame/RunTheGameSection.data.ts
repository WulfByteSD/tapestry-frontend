const rulesGuideFileId = '1SmvWAF9ntcrzoEn7YqXkO64w9933Au2m';
const storyweaversLoomFileId = '11wI4hmsOzIx_ohvJOYIPXb1GGAgMlojv';
const threadBuilderFileId = '1NWuvovqJkQqAHmpRaV25EA_7Dds5O668';

export const rulesGuideResource = {
  eyebrow: '01 — Make the call',
  title: 'Rules & Rulings Guide',
  description:
    'Set clear stakes, choose fair Target Numbers, resolve consequences, manage Threads, and keep combat moving without stopping play to search through complicated rules.',
  coverSrc: 'https://res.cloudinary.com/wulfdev/image/upload/v1780602173/ChatGPT_Image_Jan_11_2026_08_38_15_PM_-_Copy_js6x3i.png',
  tags: ['Core engine', 'Stakes and Target Numbers', 'Threads and outcomes', 'Combat and Conditions', 'At-table reference'],
  previewHref: `https://drive.google.com/file/d/${rulesGuideFileId}/view`,
  downloadHref: `https://drive.google.com/uc?export=download&id=${rulesGuideFileId}`,
} as const;

export const storyweaverWorkspace = {
  eyebrow: 'Digital Storyweaver workspace',
  title: 'Your campaign, gathered in one place.',
  description:
    'The Tapestry player app gives Storyweavers a shared digital space for organizing campaigns, connecting players, viewing characters, and bringing campaign activity together.',
  href: 'https://app.tapestry-ttrpg.com/storyweaver/campaigns',
  actionLabel: 'Explore the Storyweaver workspace',
  accessNote: 'Free account required · Features actively changing',
  features: ['Create and manage campaigns', 'Invite players and manage the roster', 'View connected player characters', 'Open shared campaign boards'],
} as const;

export const storyweaversLoomResource = {
  eyebrow: '02 — Shape the story',
  title: 'The Storyweaver’s Loom',
  description:
    'Build stories around pressure and player choice instead of predetermined endings. Prepare flexible structures that remain useful when the players take the story somewhere unexpected.',
  flow: ['Thread', 'Strand', 'Weave', 'Knot', 'Pattern'],
  previewHref: `https://drive.google.com/file/d/${storyweaversLoomFileId}/view`,
  downloadHref: `https://drive.google.com/uc?export=download&id=${storyweaversLoomFileId}`,
} as const;

export const threadBuilderResource = {
  eyebrow: '03 — Build the next adventure',
  title: 'Thread-Builder Framework',
  description: 'Turn a single idea into a playable Loom with a repeatable process for hooks, branching paths, discoveries, climaxes, consequences, and Loose Threads.',
  meta: 'Quick planning tool · 5-page framework',
  previewHref: `https://drive.google.com/file/d/${threadBuilderFileId}/view`,
  downloadHref: `https://drive.google.com/uc?export=download&id=${threadBuilderFileId}`,
} as const;
