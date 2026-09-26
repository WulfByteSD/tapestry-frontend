export const timeDifference = (current: number | Date, previous: number | Date): string => {
  const c = typeof current === 'number' ? current : current.getTime();
  const p = typeof previous === 'number' ? previous : previous.getTime();

  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const elapsed = c - p;

  switch (true) {
    case elapsed < msPerMinute:
      return elapsed / 1000 < 30 ? 'Just now' : `${Math.round(elapsed / 1000)} seconds ago`;

    case elapsed < msPerHour:
      return `${Math.round(elapsed / msPerMinute)} minutes ago`;

    case elapsed < msPerDay:
      return `${Math.round(elapsed / msPerHour)} hours ago`;

    default:
      return new Date(p).toLocaleDateString();
  }
};
