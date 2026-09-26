export type DifferenceCard = {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  metric: {
    value: string;
    label: string;
  };
};

export const resultTrack = [
  {
    label: 'Strong Hit',
    detail: 'Success with momentum, flourish, or a cleaner position.',
  },
  {
    label: 'Hit',
    detail: 'You do what you set out to do and the scene moves forward.',
  },
  {
    label: 'Weak Hit',
    detail: 'You succeed, but the table pays a cost or accepts a complication.',
  },
  {
    label: 'Miss',
    detail: 'The world pushes back, the story twists, and you gain a Thread.',
  },
] as const;

export const differenceCards: DifferenceCard[] = [
  {
    eyebrow: 'Core engine',
    title: 'One roll carries combat, intrigue, exploration, and weird magic.',
    body: 'Tapestry does not ask the table to memorize a new subsystem every time the fiction changes. Set the stakes, choose an approach, roll, and let the result reshape the scene.',
    bullets: ['3d6 + Approach + Skill', 'Four clear outcomes', 'Fiction-first TNs'],
    metric: {
      value: '3d6',
      label: 'one core roll',
    },
  },
  {
    eyebrow: 'Failure economy',
    title: 'Bad rolls do not stall the story. They load the spring.',
    body: 'Misses create pressure and hand players Threads, turning setbacks into the fuel for later desperate choices, bold reversals, and mythic table moments.',
    bullets: ['Misses create Threads', 'Costs become hooks', 'Momentum survives failure'],
    metric: {
      value: '+1',
      label: 'Thread on a miss',
    },
  },
  {
    eyebrow: 'Tone dials',
    title: 'Genre changes without rebuilding the whole game.',
    body: 'Dials let the same campaign engine lean romantic, grim, mythic, cozy, dangerous, or strange without throwing away the character sheet or rewriting the core loop.',
    bullets: ['Tint or system layer', 'Rules stay recognizable', 'Genre has teeth'],
    metric: {
      value: 'Dial',
      label: 'not a reskin',
    },
  },
  {
    eyebrow: 'Story structure',
    title: 'Storyweavers prep pressure, not rails.',
    body: 'The Loom model gives Storyweavers modular hooks, branches, climaxes, fallout, and loose ends. It supports real choice without leaving the person running the game empty-handed.',
    bullets: ['Threads and Strands', 'Knots and Patterns', 'Loose ends return'],
    metric: {
      value: 'Loom',
      label: 'not a railroad',
    },
  },
  {
    eyebrow: 'Character growth',
    title: 'Ordinary people become legendary because the story marks them.',
    body: 'Characters begin grounded, then grow through Weaves. Advancement is not just bigger numbers; it is proof that the table changed this person and the world noticed.',
    bullets: ['Grounded starts', 'Milestone Weaves', 'Stats gain memory'],
    metric: {
      value: '0→20+',
      label: 'fragile to mythic',
    },
  },
  {
    eyebrow: 'Platform ready',
    title: 'The rules are designed for the table, the shelf, and the session between sessions.',
    body: 'Tapestry is being shaped as both a tabletop system and a digital play space, with room for player tools, Storyweaver views, campaign continuity, and future play-by-post support.',
    bullets: ['Player-focused tools', 'Storyweaver support', 'Persistent campaign context'],
    metric: {
      value: 'P/SW',
      label: 'role-aware tools',
    },
  },
];
