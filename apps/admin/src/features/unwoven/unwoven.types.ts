export type Combatant = {
  _id: string; updatedAt?: string; key: string; name: string; settingKeys: string[];
  category: 'npc' | 'creature' | 'unwoven' | 'boss' | 'ally' | 'hazard';
  disposition: 'hostile' | 'neutral' | 'friendly'; status: 'draft' | 'published' | 'archived';
  sourceType: 'original' | 'derived_from_lore' | 'quick_saved'; loreNodeId: string | null;
  tier: string; origin: string; origins?: string[]; role: string; perks: string[];
  statline: { hp: number; defenseTN: number; harm: string; armor: number; move: string; actions: number; tags: string[] };
  attacks: { name: string; harm: string; range: string; notes: string }[];
  abilities: { name: string; text: string; cooldown: string }[];
  loreCheck: { skill: string; tn: number; villagers: string[]; priests: string[]; scholars: string[]; soldiers: string[] };
  backgroundBehavior: string; whereFound: string[]; tactics: string[]; hooks: string[];
  notes: { public: string; gm: string }; media: { portraitUrl: string; tokenUrl: string; bannerUrl: string };
};
export type CombatantDraft = Omit<Combatant, '_id' | 'updatedAt' | 'statline' | 'loreCheck'> & {
  statline: Omit<Combatant['statline'], 'hp' | 'defenseTN' | 'armor' | 'actions'> & { hp: number | ''; defenseTN: number | ''; armor: number | ''; actions: number | '' };
  loreCheck: Omit<Combatant['loreCheck'], 'tn'> & { tn: number | '' };
};
export type Area = 'identity' | 'battle' | 'moves' | 'lore' | 'review';
export type Issue = { area: Area; field: string; message: string };
export type FormProps = { draft: CombatantDraft; onChange: (draft: CombatantDraft) => void; issues: Issue[]; disabled?: boolean };
export type EditorProps = { id?: string };
export type SessionProps = { initial?: Combatant; userId: string };
export type Recovery = { draft: CombatantDraft; uncertain?: boolean };
export type ConfirmProps = { title: string; children: React.ReactNode; confirm: string; busy?: boolean; disabled?: boolean; danger?: boolean; onConfirm: () => void; onCancel: () => void };

export type HarmFieldProps = { id: string; value: string; onChange: (value: string) => void; label?: string; error?: string };
export type SettingOption = { _id: string; key: string; name: string; status: string };
export type LoreOption = { _id: string; name: string; key: string; settingKey: string; kind: string };
