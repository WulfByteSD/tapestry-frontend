export type AdventureStatus = 'draft' | 'published' | 'archived';
export type MaterialKind = 'map' | 'handout' | 'story_text' | 'storyweaver_note';
export interface StorySection {
  id: string; title: string; storyText: string; storyweaverNotes: string; context: string; sortOrder: number;
  resourceIds: string[]; encounterIds: string[];
  links: { sectionId: string; label: string; context: string }[];
}
export interface Material {
  id: string; title: string; kind: MaterialKind; visibility: 'players' | 'storyweaver'; text: string; tags: string[];
  hasAsset?: boolean; asset?: { contentType: string; bytes: number };
}
export interface Encounter {
  id: string; title: string; notes: string; combatants: { combatantId: string; quantity: number }[];
}
export interface AdventureContent {
  title: string; summary: string; sections: StorySection[]; resources: Material[]; encounters: Encounter[];
}
export interface Adventure extends AdventureContent {
  id: string; libraryResourceId: string; revision: number; status: AdventureStatus;
}
export interface AdventureSummary { _id: string; title: string; summary: string; status: AdventureStatus; revision: number; libraryResourceId: string }
export interface Combatant { _id: string; name: string; status: AdventureStatus; category?: string; tier?: string }
export type Area = 'basics' | 'story' | 'resources' | 'encounters' | 'review';
export interface Issue { area: Area; message: string }
