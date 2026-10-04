import type { CharacterSheet, SettingDefinition } from '@tapestry/types';

export type CharacterDetailsProps = {
  open: boolean;
  sheet: CharacterSheet;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => void;
  isSaving?: boolean;
};

export type CharacterDetailsDraft = {
  avatarUrl: string;
  settingKey: string;
  archetypeKey: string;
  weaveLevel: number | string;
  title: string;
  bio: string;
  race: string;
  nationality: string;
  religion: string;
  sex: string;
  height: string;
  weight: string;
  eyes: string;
  hair: string;
  ethnicity: string;
  age: string;
};


export type CharacterDetailsFormProps = {
  draft: CharacterDetailsDraft;
  setField: <K extends keyof CharacterDetailsDraft>(key: K, value: CharacterDetailsDraft[K]) => void;
  settings: SettingDefinition[];
  settingsLoading: boolean;
  settingsError: boolean;
  onRetrySettings: () => void;
};
