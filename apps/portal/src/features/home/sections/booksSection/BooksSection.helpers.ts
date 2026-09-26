export function chunkBooksIntoShelves<T>(items: readonly T[], shelfSize: number): T[][] {
  if (!items.length) {
    return [];
  }

  const normalizedShelfSize = Math.max(1, Math.floor(shelfSize));
  const shelves: T[][] = [];

  for (let index = 0; index < items.length; index += normalizedShelfSize) {
    shelves.push(items.slice(index, index + normalizedShelfSize));
  }

  return shelves;
}
