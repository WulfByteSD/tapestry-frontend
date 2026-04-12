import type { AspectGroup } from '@tapestry/types';

export type AspectDraft = Record<AspectGroup, Record<string, number>>;

export type CharacterDraft = {
  // Identity
  name: string;
  archetypeKey: string;
  settingKey: string;
  avatarUrl: string;

  // Heritage / profile
  title: string;
  bio: string;
  race: string;
  nationality: string;
  sex: string;
  age: string;
  height: string;
  weight: string;
  eyes: string;
  hair: string;
  ethnicity: string;
  religion: string;

  // Aspects
  aspects: {
    might: { strength: number; presence: number };
    finesse: { agility: number; charm: number };
    wit: { instinct: number; knowledge: number };
    resolve: { willpower: number; empathy: number };
  };
};

/** Universal props passed to every wizard step component. */
export type WizardStepProps = {
  draft: CharacterDraft;
  setField: <K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) => void;
  setAspect: (group: string, key: string, value: number) => void;
};

export function defaultDraft(): CharacterDraft {
  return {
    name: '',
    archetypeKey: '',
    settingKey: '',
    avatarUrl: '',
    title: '',
    bio: '',
    race: '',
    nationality: '',
    sex: '',
    age: '',
    height: '',
    weight: '',
    eyes: '',
    hair: '',
    ethnicity: '',
    religion: '',
    aspects: {
      might: { strength: 0, presence: 0 },
      finesse: { agility: 0, charm: 0 },
      wit: { instinct: 0, knowledge: 0 },
      resolve: { willpower: 0, empathy: 0 },
    },
  };
}
