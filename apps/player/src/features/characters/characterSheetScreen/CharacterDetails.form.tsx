import { Button, Input, SelectField } from '@tapestry/ui';
import type { CharacterDetailsFormProps } from './CharacterDetails.types';
import styles from './CharacterDetails.module.scss';

export function CharacterDetailsForm({ draft, setField, settings, settingsLoading, settingsError, onRetrySettings }: CharacterDetailsFormProps) {
  return (
      <div className={styles.root}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>World & growth</h3>
        <SelectField label="Setting" disabled={settingsLoading} value={draft.settingKey} onChange={(e) => setField('settingKey', e.target.value)}>
          <option value="">No Setting</option>
          {settings.map((setting) => (
            <option key={setting.key} value={setting.key}>
              {setting.name}
            </option>
          ))}
        </SelectField>
        <p className={styles.settingHint}>
          Changing a setting does not automatically remove old items, skills, or notes. Forking is usually the cleaner option when porting a character into another world.
        </p>
          {settingsError && <div role="alert" className={styles.settingHint}>Settings could not be loaded. <Button variant="ghost" onClick={onRetrySettings}>Try again</Button></div>}
          <div className={styles.grid}>
          <Input label="Archetype" value={draft.archetypeKey} onChange={(e) => setField('archetypeKey', e.target.value)} placeholder="bard, warden, striker..." />
          <Input label="Weave Level" type="number" min={1} value={draft.weaveLevel} onChange={(e) => setField('weaveLevel', e.target.value)} />
          </div>
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Identity & story</h3>
          <div className={styles.grid}>
          <Input label="Title" value={draft.title} onChange={(e) => setField('title', e.target.value)} placeholder="The Ashen Blade, Court Singer..." />
          <Input label="Avatar URL" value={draft.avatarUrl} onChange={(e) => setField('avatarUrl', e.target.value)} placeholder="https://example.com/avatar.png" />
          </div>
        <label className={styles.bioBlock}>
          <span className={styles.bioLabel}>Bio</span>
          <textarea
            className={styles.bioInput}
            value={draft.bio}
            onChange={(e) => setField('bio', e.target.value)}
            placeholder="Who are they, what shaped them, and why are they here?"
            rows={8}
          />
        </label>
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Origins & appearance</h3>
        <div className={styles.grid}>
          <Input label="Race" value={draft.race} onChange={(e) => setField('race', e.target.value)} />
          <Input label="Nationality" value={draft.nationality} onChange={(e) => setField('nationality', e.target.value)} />
          <Input label="Religion" value={draft.religion} onChange={(e) => setField('religion', e.target.value)} />
          <SelectField
            label="Sex"
            value={draft.sex}
            onChange={(e) => setField('sex', e.target.value)}
            options={[
              { value: '', label: '—' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input label="Height" value={draft.height} onChange={(e) => setField('height', e.target.value)} />
          <Input label="Weight" value={draft.weight} onChange={(e) => setField('weight', e.target.value)} />
          <Input label="Eyes" value={draft.eyes} onChange={(e) => setField('eyes', e.target.value)} />
          <Input label="Hair" value={draft.hair} onChange={(e) => setField('hair', e.target.value)} />
          <Input label="Ethnicity" value={draft.ethnicity} onChange={(e) => setField('ethnicity', e.target.value)} />
          <Input label="Age" value={draft.age} onChange={(e) => setField('age', e.target.value)} />
        </div>
        </section>
      </div>
  );
}
