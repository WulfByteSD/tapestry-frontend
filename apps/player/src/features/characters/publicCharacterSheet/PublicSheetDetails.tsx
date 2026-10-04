import type { EffectiveAbility } from '@tapestry/types';
import { PublicSheetSection } from './PublicSheetSection';
import { displayKey, type PublicCharacter } from './public-character';
import styles from './PublicCharacterSheet.module.scss';

export function PublicAbilities({ character }: { character: PublicCharacter }) {
  const { sheet } = character;
  const abilities: EffectiveAbility[] = character.derived?.effectiveAbilities ?? (sheet.learnedAbilities ?? []).map((ability) => ({ ...ability, name: displayKey(ability.abilityKey), available: true }));
  return (
    <PublicSheetSection id="abilities" title="Abilities & features">
      <div className={styles.abilitiesScrollRegion} role="region" aria-label="Abilities and features" tabIndex={0}>
        {abilities.length ? <ul className={styles.entries}>{abilities.map((ability, index) => (
          <li key={`${ability.abilityKey}-${index}`}>
            <div className={styles.entryHeading}><h3>{ability.name}</h3>{!ability.available && <span>Unavailable</span>}</div>
            {[ability.category, ability.activation, ability.usageModel].some(Boolean) && <p className={styles.meta}>{[ability.category, ability.activation, ability.usageModel].filter((value): value is NonNullable<typeof value> => !!value).map(displayKey).join(' · ')}</p>}
            {ability.sourceLabel && <p className={styles.meta}>From {ability.sourceLabel}</p>}
            {ability.cost && <p className={styles.meta}>{[
              ability.cost.amount != null ? `Cost: ${ability.cost.amount} ${displayKey(ability.cost.resourceKey ?? 'resource')}` : '',
              ability.cost.charges != null ? `Charges: ${ability.cost.charges}` : '',
              ability.cost.cooldownTurns != null ? `Cooldown: ${ability.cost.cooldownTurns} turns` : '',
            ].filter(Boolean).join(' · ')}</p>}
            {ability.summary && <p className={styles.prose}>{ability.summary}</p>}
            {ability.effectText && <p className={styles.prose}>{ability.effectText}</p>}
            {ability.notes && <p className={styles.prose}>{ability.notes}</p>}
          </li>
        ))}</ul> : <p className={styles.empty}>No abilities recorded.</p>}
        {!!sheet.features?.length && <><h3 className={styles.subheading}>Features</h3><ul className={styles.features}>{sheet.features.map((feature, index) => <li key={`${feature}-${index}`}>{feature}</li>)}</ul></>}
      </div>
    </PublicSheetSection>
  );
}

export function PublicProfile({ character }: { character: PublicCharacter }) {
  const profile = character.sheet.profile;
  const details = Object.entries(profile ?? {}).filter(([key, value]) => !['title', 'bio', 'extra'].includes(key) && value !== '' && value != null);
  const extra = Object.entries(profile?.extra ?? {});
  return (
    <PublicSheetSection id="profile" title="Character profile" className={styles.profile}>
      <div className={styles.profileColumns}>
        {profile?.bio && <p className={styles.biography}>{profile.bio}</p>}
        {!!(details.length + extra.length) && <dl className={styles.profileDetails}>{[...details, ...extra].map(([key, value], index) => <div key={`${key}-${index}`}><dt>{displayKey(key)}</dt><dd>{String(value)}</dd></div>)}</dl>}
      </div>
      {!profile?.bio && !details.length && !extra.length && <p className={styles.empty}>No profile details recorded.</p>}
      {!!character.toneModules?.length && <p className={styles.meta}>Tone modules: {character.toneModules.map(displayKey).join(', ')}</p>}
      {!!character.tags?.length && <p className={styles.meta}>Tags: {character.tags.join(', ')}</p>}
    </PublicSheetSection>
  );
}
