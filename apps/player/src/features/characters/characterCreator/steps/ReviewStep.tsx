'use client';

import { ASPECT_BLOCKS } from '@tapestry/types';
import type { CharacterDraft } from '../characterCreator.types';
import styles from './ReviewStep.module.scss';
import stepStyles from './steps.module.scss';

type Props = {
  draft: CharacterDraft;
};

export function ReviewStep({ draft }: Props) {
  return (
    <div className={stepStyles.stepBody}>
      <div className={styles.hero}>
        <div className={styles.nameRow}>
          <h2 className={styles.name}>{draft.name || '(unnamed)'}</h2>
          {draft.archetypeKey && <span className={styles.badge}>{draft.archetypeKey}</span>}
        </div>
        {draft.settingKey && <span className={styles.settingBadge}>{draft.settingKey}</span>}
        {draft.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={draft.avatarUrl} alt={`${draft.name} avatar`} className={styles.avatar} />
        )}
      </div>

      {draft.bio && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Bio</div>
          <p className={styles.bio}>{draft.bio}</p>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Aspects</div>
        <div className={styles.aspectGrid}>
          {ASPECT_BLOCKS.map((block) => (
            <div key={block.group} className={styles.aspectBlock}>
              <div className={styles.aspectBlockTitle}>{block.title}</div>
              {block.keys.map(({ label, key }) => {
                const groupValues = draft.aspects[block.group as keyof typeof draft.aspects] as Record<string, number>;
                const value = groupValues[key];
                return (
                  <div key={key} className={styles.aspectRow}>
                    <span className={styles.aspectLabel}>{label}</span>
                    <span className={`${styles.aspectValue} ${value > 0 ? styles.aspectValue_pos : value < 0 ? styles.aspectValue_neg : styles.aspectValue_zero}`}>
                      {value > 0 ? `+${value}` : value}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {hasAnyProfile(draft) && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Heritage Details</div>
          <div className={styles.profileGrid}>
            {PROFILE_FIELDS.filter(({ key }) => Boolean(draft[key])).map(({ label, key }) => (
              <div key={key} className={styles.profileRow}>
                <span className={styles.profileLabel}>{label}</span>
                <span className={styles.profileValue}>{draft[key] as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.prompt}>
        Everything look good? Click <strong>Submit</strong> to create your character. You can always update details from the character sheet after creation.
      </div>
    </div>
  );
}

const PROFILE_FIELDS: Array<{ label: string; key: keyof CharacterDraft }> = [
  { label: 'Hero Title', key: 'title' },
  { label: 'Race / Ancestry', key: 'race' },
  { label: 'Nationality', key: 'nationality' },
  { label: 'Sex', key: 'sex' },
  { label: 'Age', key: 'age' },
  { label: 'Height', key: 'height' },
  { label: 'Weight', key: 'weight' },
  { label: 'Eyes', key: 'eyes' },
  { label: 'Hair', key: 'hair' },
  { label: 'Ethnicity', key: 'ethnicity' },
  { label: 'Religion', key: 'religion' },
];

function hasAnyProfile(draft: CharacterDraft): boolean {
  return PROFILE_FIELDS.some(({ key }) => Boolean(draft[key]));
}
