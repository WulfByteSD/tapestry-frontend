'use client';

import { TextField, TextAreaField } from '@tapestry/ui';
import type { CharacterDraft } from '../characterCreator.types';
import styles from './steps.module.scss';

type Props = {
  draft: CharacterDraft;
  setField: <K extends keyof CharacterDraft>(key: K, value: CharacterDraft[K]) => void;
};

export function HeritageStep({ draft, setField }: Props) {
  function bind(key: keyof CharacterDraft) {
    return {
      value: draft[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setField(key, e.target.value as any),
    };
  }

  return (
    <div className={styles.stepBody}>
      <TextField label="Hero Title" floatingLabel hint="An epithet or honorific — e.g. The Unyielding, Voice of the Loom." {...bind('title')} />

      <TextAreaField label="Bio" floatingLabel hint="A short description of who your character is. Flavor only — no mechanical weight." rows={4} {...bind('bio')} />

      <div className={styles.grid2}>
        <TextField label="Race / Ancestry" floatingLabel hint="Your character's ancestry or species in this setting." {...bind('race')} />
        <TextField label="Nationality" floatingLabel hint="Where your character is from." {...bind('nationality')} />
        <TextField label="Sex" floatingLabel {...bind('sex')} />
        <TextField label="Age" floatingLabel {...bind('age')} />
        <TextField label="Height" floatingLabel {...bind('height')} />
        <TextField label="Weight" floatingLabel {...bind('weight')} />
        <TextField label="Eyes" floatingLabel {...bind('eyes')} />
        <TextField label="Hair" floatingLabel {...bind('hair')} />
        <TextField label="Ethnicity" floatingLabel {...bind('ethnicity')} />
        <TextField label="Religion" floatingLabel hint="Your character's faith or spiritual practice, if any." {...bind('religion')} />
      </div>
    </div>
  );
}
