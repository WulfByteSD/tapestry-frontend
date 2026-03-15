/**
 * Immutably updates a single nested property in an object using dot notation.
 * Creates new objects along the path while preserving references to unchanged branches.
 *
 * @param obj - The source object to update
 * @param path - Dot-notation path to the property (e.g., "sheet.notes" or "sheet.hp.current")
 * @param value - The new value to set at the path
 * @returns A new object with the specified path updated, original object unchanged
 *
 * @example
 * const updated = setPathImmutable(character, "sheet.notes", "New notes");
 * // Returns new object with character.sheet.notes = "New notes"
 * // Original character object remains unchanged
 */
export default function setPathImmutable<T>(obj: T, path: string, value: any): T {
  const keys = path.split(".");
  const out: any = Array.isArray(obj) ? [...(obj as any)] : { ...(obj as any) };

  let curOut: any = out;
  let curIn: any = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const nextIn = curIn?.[k];
    let nextOut: any;

    if (Array.isArray(nextIn)) nextOut = [...nextIn];
    else if (nextIn && typeof nextIn === "object") nextOut = { ...nextIn };
    else nextOut = {};

    curOut[k] = nextOut;
    curOut = nextOut;
    curIn = nextIn;
  }

  curOut[keys[keys.length - 1]] = value;
  return out;
}
