'use client';
import { SelectField, TextField } from '@tapestry/ui';
import { numeric } from './unwoven.helpers';
import type { FormProps } from './unwoven.types';
import AuthoringRichField from '@/features/authoring/AuthoringRichField.component';
import AuthoringListField from '@/features/authoring/AuthoringListField.component';
import { LorePicker } from './UnwovenPickers.component';
import styles from './Unwoven.module.scss';
export default function UnwovenLore({ draft, onChange, issues, disabled }: FormProps) {
  return (
    <div className={styles.fields}>
      <div className={styles.sectionHeading}>
        <h2>Make it part of the world</h2>
        <p>Optional context for the Storyweaver, from first impressions to hidden knowledge.</p>
      </div>
      <AuthoringRichField
        id="backgroundBehavior"
        label="Background & behavior"
        value={draft.backgroundBehavior}
        onChange={(backgroundBehavior) => onChange({ ...draft, backgroundBehavior })}
      />
      {(['whereFound', 'tactics', 'hooks'] as const).map((key, i) => (
        <AuthoringListField key={key} id={key} label={['Where found', 'Tactics', 'Story hooks'][i]} value={draft[key]} onChange={(value) => onChange({ ...draft, [key]: value })} />
      ))}
      <section className={styles.divider}>
        <h3>Lore check</h3>
        <div className={styles.grid}>
          <TextField
            id="lore-skill"
            label="Skill"
            value={draft.loreCheck.skill}
            onChange={(e) => onChange({ ...draft, loreCheck: { ...draft.loreCheck, skill: e.target.value } })}
          />
          <TextField
            id="lore-tn"
            label="Target number"
            type="number"
            step="any"
            value={draft.loreCheck.tn}
            error={issues.find((i) => i.field === 'lore-tn')?.message}
            onChange={(e) => onChange({ ...draft, loreCheck: { ...draft.loreCheck, tn: numeric(e.target.value) } })}
          />
        </div>
        {(['villagers', 'priests', 'scholars', 'soldiers'] as const).map((key) => (
          <AuthoringListField
            key={key}
            id={key}
            label={`What ${key} know`}
            value={draft.loreCheck[key]}
            onChange={(value) => onChange({ ...draft, loreCheck: { ...draft.loreCheck, [key]: value } })}
          />
        ))}
      </section>
      <section className={styles.divider}>
        <h3>Notes</h3>
        <AuthoringRichField
          id="public-notes"
          label="Public notes"
          value={draft.notes.public}
          onChange={(value) => onChange({ ...draft, notes: { ...draft.notes, public: value } })}
        />
        <AuthoringRichField
          id="gm-notes"
          label="Storyweaver notes"
          hint="Stored in the existing gm field. The combatant API controls access to this content."
          value={draft.notes.gm}
          onChange={(value) => onChange({ ...draft, notes: { ...draft.notes, gm: value } })}
        />
      </section>
      <section className={styles.divider}>
        <h3>Media</h3>
        <p>Link existing hosted images. No files are uploaded here.</p>
        {(['portraitUrl', 'tokenUrl', 'bannerUrl'] as const).map((key, i) => (
          <TextField
            key={key}
            id={key}
            label={['Portrait URL', 'Token URL', 'Banner URL'][i]}
            type="url"
            value={draft.media[key]}
            error={issues.find((issue) => issue.field === key)?.message}
            onChange={(e) => onChange({ ...draft, media: { ...draft.media, [key]: e.target.value } })}
          />
        ))}
      </section>
      <details className={styles.divider}>
        <summary>Source & lore connection</summary>
        <LorePicker draft={draft} onChange={onChange} issues={issues} disabled={disabled} />
        <SelectField
          id="sourceType"
          label="Source"
          value={draft.sourceType}
          options={[
            { value: 'original', label: 'Original' },
            { value: 'derived_from_lore', label: 'Derived from lore' },
            { value: 'quick_saved', label: 'Quick saved' },
          ]}
          onChange={(e) => onChange({ ...draft, sourceType: e.target.value as typeof draft.sourceType })}
        />
      </details>
    </div>
  );
}
