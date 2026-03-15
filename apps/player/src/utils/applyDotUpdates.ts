import { UpdatePayload } from "@tapestry/api-client";
import setPathImmutable from "./setPathImmutable";
 
/**
 * Applies multiple dot-notation updates to an object immutably.
 * Sequentially applies each update using setPathImmutable to create a new object
 * with all specified properties updated.
 *
 * @param obj - The source object to update
 * @param updates - Object mapping dot-notation paths to new values
 * @returns A new object with all updates applied, original object unchanged
 *
 * @example
 * const result = applyDotUpdates(character, {
 *   "name": "New Name",
 *   "sheet.notes": "Updated notes",
 *   "sheet.hp.current": 10
 * });
 * // Returns new object with all three properties updated
 */
export default function applyDotUpdates<T>(obj: T, updates: UpdatePayload): T {
  let next = obj;
  for (const [path, value] of Object.entries(updates)) {
    next = setPathImmutable(next, path, value);
  }
  return next;
}
