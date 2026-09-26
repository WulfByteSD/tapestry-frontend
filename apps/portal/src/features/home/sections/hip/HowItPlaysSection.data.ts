export const outcomeBands = [
  {
    name: 'Strong Hit',
    range: 'TN + 3',
    detail: 'You succeed with flourish, leverage, or a clean opening.',
  },
  {
    name: 'Hit',
    range: '≥ TN',
    detail: 'You do what you said and the scene moves forward.',
  },
  {
    name: 'Weak Hit',
    range: 'TN - 1 / -2',
    detail: 'You succeed, but the table adds cost, pressure, or exposure.',
  },
  {
    name: 'Miss',
    range: '< TN - 2',
    detail: 'The world twists against you, and you gain a Thread.',
  },
];

export const howItPlaysSteps = [
  {
    kicker: 'Frame the fiction',
    title: 'The Storyweaver paints the situation, not the solution.',
    body: 'Every important moment starts with visible stakes: what is happening, what can be seen, and what pressure is closing in. Players are not handed a menu of approved actions. They decide what their characters actually do.',
    cue: '“The satchel is almost through the side door. Fast is loud. Quiet is risky. What do you do?”',
    tags: ['Stakes first', 'No option menu', 'Player agency'],
  },
  {
    kicker: 'Choose an approach',
    title: 'Players describe the action before the dice hit the table.',
    body: 'The player says what they attempt and how they attempt it. If the moment is uncertain and consequential, they roll 3d6 plus an Approach, adding a Skill only when the fiction supports it.',
    cue: '“I sprint up the fallen beam and shoulder-check him before he reaches the fog.”',
    tags: ['Declare intent', '3d6 + Approach', 'Skills must fit'],
  },
  {
    kicker: 'Resolve with motion',
    title: 'The result changes the scene instead of stopping play.',
    body: 'Strong Hits create clean momentum. Hits land as stated. Weak Hits succeed with a cost. Misses introduce twists, worse positions, or new threats while handing the player a Thread to push back later.',
    cue: '“You pin him, but the lantern swings. The room sees you. Take Exposed.”',
    tags: ['Four outcomes', 'Costs matter', 'Misses fuel fate'],
  },
  {
    kicker: 'Tune the pressure',
    title: 'Dials change the feel without replacing the engine.',
    body: 'The same loop can run combat, mystery, romance, horror, politics, or mythic fantasy. A Dial adjusts what the table emphasizes: how Threads flow, how hard fallout lands, and what kinds of choices get spotlight.',
    cue: '“For this arc, romance is active pressure. Vulnerability can build Bond, but failure creates distance.”',
    tags: ['Modular tone', 'Same core rules', 'Arc-ready play'],
  },
];

export const playLoopStats = [
  {
    label: 'Core roll',
    value: '3d6',
    description: 'One roll shape for combat, intrigue, travel, and strange magic.',
  },
  {
    label: 'Result bands',
    value: '4',
    description: 'Strong Hit, Hit, Weak Hit, and Miss all push the fiction forward.',
  },
  {
    label: 'Failure reward',
    value: '+1 Thread',
    description: 'A miss creates pressure now and gives players fuel for later.',
  },
  {
    label: 'Tone control',
    value: 'Dials',
    description: 'Plug-in rules tune genre, consequence, and emotional focus.',
  },
];
