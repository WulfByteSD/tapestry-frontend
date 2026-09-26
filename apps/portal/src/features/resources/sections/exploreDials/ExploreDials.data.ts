export const dialTypes = [
  {
    title: 'Tone dial',
    eyebrow: 'Lightweight tint',
    body: 'Colors narration, bargains, fallout, and scene pressure without replacing the core loop, Threads, or Weave ladder.',
  },
  {
    title: 'System dial',
    eyebrow: 'Rules layer',
    body: 'Adds a focused subsystem, fresh levers, or new rewards when the table wants tone to carry mechanical weight.',
  },
] as const;

export const dialLevers = [
  {
    title: 'Threads flow',
    body: 'A dial can make Threads scarce, abundant, or tied to a particular kind of risk.',
  },
  {
    title: 'Failure texture',
    body: 'It can change whether fallout feels comic, intimate, harsh, mythic, or politically dangerous.',
  },
  {
    title: 'Scene spotlight',
    body: 'It tells the table what matters right now: romance, legacy, mystery, survival, rivalry, or awe.',
  },
] as const;

export const featuredDials = [
  {
    title: 'Origins',
    designation: 'System dial showcase',
    description:
      'A character-forward dial that puts beginnings, inherited obligations, and the echoes of earlier lives at the center of play.',
    tags: ['background pressure', 'old ties', 'who you were before this Thread'],
  },
  {
    title: 'Love & Romance',
    designation: 'System dial',
    description:
      'A bond-focused dial where love matters mechanically. Confessions, rivals, yearning, and vulnerable promises all become meaningful ways for fate to answer back.',
    tags: ['bond tracks', 'romantic rivals', 'love leaves marks'],
  },
  {
    title: 'Dragon Dial',
    designation: 'Mythic pressure dial',
    description:
      'A legend-weight dial built around mythic gravity, remembered deeds, and the cost of standing against something larger than yourself.',
    tags: ['mythic gravity', 'deeds remembered', 'Defy the Colossus'],
  },
] as const;
