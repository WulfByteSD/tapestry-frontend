import type { AdventureContent, Area, Issue, MaterialKind } from './adventure.types';

export const areas: { key: Area; label: string }[] = [{ key: 'basics', label: 'Basics' }, { key: 'story', label: 'Story' }, { key: 'resources', label: 'Resources' }, { key: 'encounters', label: 'Encounters' }, { key: 'review', label: 'Review & publish' }];
export const kinds: { value: MaterialKind; label: string }[] = [{ value: 'map', label: 'Map' }, { value: 'handout', label: 'Handout' }, { value: 'story_text', label: 'Story text' }, { value: 'storyweaver_note', label: 'Storyweaver note' }];
export const emptyContent = (): AdventureContent => ({ title: '', summary: '', sections: [], resources: [], encounters: [] });
export const newId = (prefix: string) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;

/** Explicit write shape: read-only attachment metadata must never reach strict API validation. */
export function writeContent(content: AdventureContent): AdventureContent {
  return {
    title: content.title, summary: content.summary,
    sections: content.sections.map(s => ({ id: s.id, title: s.title, storyText: s.storyText, storyweaverNotes: s.storyweaverNotes, context: s.context, sortOrder: s.sortOrder, resourceIds: [...s.resourceIds], encounterIds: [...s.encounterIds], links: s.links.map(l => ({ sectionId: l.sectionId, label: l.label, context: l.context })) })),
    resources: content.resources.map(r => ({ id: r.id, title: r.title, kind: r.kind, visibility: r.visibility, text: r.text, tags: [...r.tags] })),
    encounters: content.encounters.map(e => ({ id: e.id, title: e.title, notes: e.notes, combatants: e.combatants.map(c => ({ combatantId: c.combatantId, quantity: c.quantity })) })),
  };
}
export const fingerprint = (content: AdventureContent) => JSON.stringify(writeContent(content));

export function moveSection(content: AdventureContent, id: string, direction: -1 | 1): AdventureContent {
  const sections = [...content.sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const index = sections.findIndex(s => s.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= sections.length) return content;
  [sections[index], sections[target]] = [sections[target], sections[index]];
  return { ...content, sections: sections.map((section, sortOrder) => ({ ...section, sortOrder })) };
}

export function validateContent(content: AdventureContent): Issue[] {
  const issues: Issue[] = [];
  const add = (area: Area, message: string) => issues.push({ area, message });
  const title = (value: string, area: Area, label: string) => { if (!value.trim() || value.trim().length > 200) add(area, `${label}: enter a title of 1–200 characters.`); };
  const long = (values: string[], area: Area, label: string) => { if (values.some(v => v.length > 100_000)) add(area, `${label}: text fields must be at most 100,000 characters.`); };
  title(content.title, 'basics', 'Adventure');
  if (content.summary.length > 4000) add('basics', 'Summary must be at most 4,000 characters.');
  const collections = [{ items: content.sections, area: 'story' as Area, limit: 200 }, { items: content.resources, area: 'resources' as Area, limit: 200 }, { items: content.encounters, area: 'encounters' as Area, limit: 100 }];
  collections.forEach(({ items, area, limit }) => {
    if (items.length > limit) add(area, `This collection is limited to ${limit} entries.`);
    if (new Set(items.map(i => i.id)).size !== items.length || items.some(i => !/^[a-z0-9][a-z0-9_-]{0,79}$/.test(i.id))) add(area, 'Entries need unique valid IDs.');
    items.forEach(i => title(i.title, area, i.title || 'Untitled entry'));
  });
  content.sections.forEach(s => {
    long([s.storyText, s.context, s.storyweaverNotes, ...s.links.map(l => l.context)], 'story', s.title);
    if (!Number.isInteger(s.sortOrder) || s.sortOrder < 0 || s.sortOrder > 100_000) add('story', `${s.title}: invalid section order.`);
    if (s.links.length > 200 || s.resourceIds.length > 200 || s.encounterIds.length > 200) add('story', `${s.title}: associations are limited to 200 per collection.`);
    s.links.forEach(l => title(l.label, 'story', 'Link label'));
    if (s.links.some(l => !content.sections.some(t => t.id === l.sectionId)) || s.resourceIds.some(id => !content.resources.some(r => r.id === id)) || s.encounterIds.some(id => !content.encounters.some(e => e.id === id))) add('story', `${s.title}: an association no longer exists in this adventure.`);
  });
  content.resources.forEach(r => {
    long([r.text], 'resources', r.title);
    if (r.tags.length > 30 || r.tags.some(t => !t.trim() || t.trim().length > 80)) add('resources', `${r.title}: use up to 30 tags of 1–80 characters.`);
    if (r.kind === 'storyweaver_note' && r.visibility !== 'storyweaver') add('resources', `${r.title}: Storyweaver notes must stay private.`);
  });
  content.encounters.forEach(e => {
    long([e.notes], 'encounters', e.title);
    if (e.combatants.length > 100) add('encounters', `${e.title}: use up to 100 combatant entries.`);
    if (e.combatants.some(c => !/^[a-fA-F0-9]{24}$/.test(c.combatantId) || !Number.isInteger(c.quantity) || c.quantity < 1 || c.quantity > 1000)) add('encounters', `${e.title}: choose valid combatants with whole quantities from 1 to 1,000.`);
  });
  if (new TextEncoder().encode(fingerprint(content)).length > 2_000_000) add('review', 'Adventure content exceeds the 2 MB limit. Shorten text before saving.');
  return issues;
}
export function removeEntry(content: AdventureContent, collection: 'sections' | 'resources' | 'encounters', id: string): AdventureContent {
  const next = { ...content, [collection]: content[collection].filter(i => i.id !== id) };
  next.sections = next.sections.map(s => ({ ...s, links: collection === 'sections' ? s.links.filter(l => l.sectionId !== id) : s.links, resourceIds: collection === 'resources' ? s.resourceIds.filter(r => r !== id) : s.resourceIds, encounterIds: collection === 'encounters' ? s.encounterIds.filter(e => e !== id) : s.encounterIds }));
  return next;
}
export function errorMessage(error: unknown) {
  const e = error as { response?: { status?: number; data?: { message?: string; error?: string } }; message?: string };
  if (e.response?.status === 403) return 'Administrator permission is required.';
  if (e.response?.status === 401) return 'Your session has expired. Sign in again; keep a copy of your draft first.';
  if (e.response?.status === 404) return 'This resource is no longer available.';
  if (e.response?.status === 409) return 'The server draft changed. Your local edits are preserved. Reload the server version before writing again.';
  return e.response?.data?.message || e.response?.data?.error || 'The request could not be completed. Check your connection and try again.';
}
export function uncertainWrite(error: unknown) {
  const status = (error as { response?: { status?: number } }).response?.status;
  return !status || status === 409 || status >= 500;
}
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
