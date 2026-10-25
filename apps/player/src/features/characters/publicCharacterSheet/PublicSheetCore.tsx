import { ASPECT_BLOCKS, type ConditionInstance, type ResourceTrack } from '@tapestry/types';
import { PublicSheetSection } from './PublicSheetSection';
import { displayKey, score, type PublicCharacter } from './public-character';
import styles from './PublicCharacterSheet.module.scss';

type Sheet = PublicCharacter['sheet'];

function Resource({ label, track }: { label: string; track?: ResourceTrack }) {
  return (
    <div className={styles.resource}>
      <dt>{label}</dt>
      <dd>{track ? <>{track.current} <span>/ {track.max}</span></> : '—'}</dd>
      {!!track?.temp && <dd className={styles.temporary}>+{track.temp} temporary</dd>}
    </div>
  );
}

export function PublicResources({ sheet }: { sheet: Sheet }) {
  const other = sheet.resources?.other ?? {};
  const secondary = Object.entries(other).filter(([key]) => !['armor', 'ac'].includes(key));
  const resolve = sheet.resources?.resolve;
  return (
    <>
      <dl className={styles.resources} aria-label="Character resources">
        <Resource label="HP" track={sheet.resources?.hp} />
        <Resource label="Threads" track={sheet.resources?.threads} />
        <div className={styles.resource}><dt>Armor</dt><dd>{other.armor ?? other.ac ?? '—'}</dd></div>
        <div className={styles.resource}><dt>Defense TN</dt><dd>{sheet.dtn ?? '—'}</dd></div>
        {resolve && (resolve.max > 0 || resolve.current !== 0 || !!resolve.temp) && <Resource label="Resolve" track={resolve} />}
      </dl>
      {!!secondary.length && <dl className={styles.secondaryResources} aria-label="Additional character resources">{secondary.map(([key, value]) => (
        <div key={key}><dt>{displayKey(key)}</dt><dd>{value}</dd></div>
      ))}</dl>}
    </>
  );
}

export function PublicConditionSummary({ conditions }: { conditions: ConditionInstance[] }) {
  return (
    <div className={styles.conditionSummary}>
      <h2>Conditions</h2>
      {conditions.length ? <ul>{conditions.map((condition, index) => (
        <li key={`${condition.key}-${index}`}><a href="#conditions">{displayKey(condition.key)}</a>{condition.stacks != null && <span>Stacks: {condition.stacks}</span>}</li>
      ))}</ul> : <p className={styles.empty}>None recorded</p>}
    </div>
  );
}

export function PublicConditions({ conditions }: { conditions: ConditionInstance[] }) {
  return (
    <PublicSheetSection id="conditions" title="Conditions">
      {conditions.length ? <ul className={styles.conditionList}>{conditions.map((condition, index) => (
        <li key={`${condition.key}-${index}`}>
          <div className={styles.entryHeading}><h3>{displayKey(condition.key)}</h3>{condition.stacks != null && <span>Stacks: {condition.stacks}</span>}</div>
          {condition.source && <p className={styles.meta}>Source: {condition.source}</p>}
          {condition.notes && <p className={styles.prose}>{condition.notes}</p>}
        </li>
      ))}</ul> : <p className={styles.empty}>None recorded</p>}
    </PublicSheetSection>
  );
}

export function PublicAspects({ aspects }: { aspects: Sheet['aspects'] }) {
  return (
    <PublicSheetSection id="aspects" title="Aspects">
      <div className={styles.aspectGroups}>
        {ASPECT_BLOCKS.map((block) => {
          const values = aspects?.[block.group] as Record<string, number> | undefined;
          return (
            <div className={styles.aspectGroup} key={block.group}>
              <h3>{block.title}</h3>
              <dl className={styles.scores}>{block.keys.map(({ key, label }) => <div key={key}><dt>{label}</dt><dd>{score(values?.[key])}</dd></div>)}</dl>
            </div>
          );
        })}
      </div>
    </PublicSheetSection>
  );
}

export function PublicSkills({ skills }: { skills: Sheet['skills'] }) {
  const entries = Object.entries(skills).sort(([a], [b]) => displayKey(a).localeCompare(displayKey(b)));
  return (
    <PublicSheetSection id="skills" title="Skills">
      {entries.length ? <dl className={styles.scores}>{entries.map(([key, rank]) => <div key={key}><dt>{displayKey(key)}</dt><dd>{score(rank)}</dd></div>)}</dl> : <p className={styles.empty}>No skills recorded.</p>}
    </PublicSheetSection>
  );
}
