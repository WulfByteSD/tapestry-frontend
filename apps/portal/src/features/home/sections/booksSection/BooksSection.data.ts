export type FeaturedBook = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  coverSrc: string;
  spineSrc?: string;
  showSpineLabel?: boolean;
};

export const booksPerShelf = 5;

export const featuredBooks: FeaturedBook[] = [
  {
    id: 'players-core-book',
    title: 'Players Core Book',
    eyebrow: 'Start here',
    description: 'The flagship player-facing book for building ordinary people caught in fate’s pull, then watching them become more through play.',
    coverSrc: 'https://res.cloudinary.com/wulfdev/image/upload/v1780602174/ChatGPT_Image_Jan_11_2026_08_39_20_PM_-_Copy_mgah5q.png',
    spineSrc: 'https://res.cloudinary.com/wulfdev/image/upload/v1780683898/Players_Guide_Spine_uhgro4.png',
    showSpineLabel: false,
  },
  {
    id: 'rules-and-rulings-guide',
    title: 'Rules and Rulings Guide',
    eyebrow: 'Table reference',
    description: 'A practical guide for running the core engine, setting stakes, resolving outcomes, and keeping rulings fast at the table.',
    coverSrc: 'https://res.cloudinary.com/wulfdev/image/upload/v1780602173/ChatGPT_Image_Jan_11_2026_08_38_15_PM_-_Copy_js6x3i.png',
  },
  {
    id: 'playtest-packet',
    title: 'Playtest Packet',
    eyebrow: 'Preview release',
    description: 'A lighter entry point for groups that want to test the feel of Tapestry before committing to the full shelf.',
    coverSrc: 'https://res.cloudinary.com/wulfdev/image/upload/v1780602174/ChatGPT_Image_Jan_11_2026_08_41_40_PM_-_Copy_shborj.png',
  },
];

export const bookDisplaySizes = {
  width: 'clamp(13.75rem, 18vw, 17.5rem)',
  height: 'clamp(20rem, 27vw, 25.5rem)',
  spineWidth: 'clamp(3.85rem, 5.25vw, 5.15rem)',
} as const;
