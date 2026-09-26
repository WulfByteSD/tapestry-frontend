export type CommunityAction = {
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
};

export type CommunityHighlight = {
  eyebrow: string;
  title: string;
  body: string;
};

export type CommunityPulseItem = {
  label: string;
  title: string;
  body: string;
};

export const communityCta = {
  eyebrow: 'Community',
  title: 'Join the Loom',
  description: 'Tapestry is being built in the open. Join the Discord to follow design updates, catch new downloads, and be close when playtest windows open.',
  logoSrc: 'https://res.cloudinary.com/wulfdev/image/upload/v1780602175/ChatGPT_Image_Jan_11_2026_09_59_05_AM_-_Copy_bxmdqf.png',
  logoAlt: 'Tapestry Discord community mark',
  actions: [
    {
      label: 'Join us on Discord',
      href: 'https://discord.gg/jbc6575Td8',
      variant: 'primary',
    },
  ] satisfies CommunityAction[],
};

export const communityHighlights: CommunityHighlight[] = [
  {
    eyebrow: 'Design updates',
    title: 'See what is being tuned next.',
    body: 'Follow new Dials, book releases, rules cleanup, and platform progress without needing to hunt through scattered posts.',
  },
  {
    eyebrow: 'Playtest signals',
    title: 'Be ready when tables open.',
    body: 'Discord is the cleanest place to announce one-shots, play-by-post tests, feedback windows, and early platform access.',
  },
  {
    eyebrow: 'Shared stories',
    title: 'Help shape the table culture.',
    body: 'Campaign moments, rules questions, Storyweaver ideas, and player feedback can live where the community actually talks.',
  },
];

export const communityPulseItems: CommunityPulseItem[] = [
  {
    label: 'Now',
    title: 'Core books and Dials',
    body: 'The public-facing library is being organized around the books, Dials, and quickstart materials that make the system easy to enter.',
  },
  {
    label: 'Next',
    title: 'Platform playtest path',
    body: 'Character creation, play-by-post games, and Storyweaver tools are the pieces that need the clearest feedback loop.',
  },
  {
    label: 'Later',
    title: 'Community-driven content',
    body: 'The long-term vision is for the community to be able to create and share their own content, from one-shot modules to homebrew Dials.',
  },
];
