import { ASPECT_BLOCKS } from '@tapestry/types';
import { Button } from '@tapestry/ui';
import { aspectPath, getAspectValue } from '../aspects/aspectutils';
import { useUpdateCharacterSheetMutation } from './characterSheet.mutations';
import { signedScore } from './CharacterSheet.helpers';
import { useAspectDisclosure } from './CharacterPlay.hooks';
import type { CharacterAspectsProps } from './CharacterPlay.types';
import styles from './CharacterPlay.module.scss';
export function CharacterAspects({ sheet, mode, onApproach }: CharacterAspectsProps) {
  const update = useUpdateCharacterSheetMutation(sheet._id);
  const disclosure = useAspectDisclosure();
  return <aside className={styles.aspects} aria-labelledby="aspects-heading">
    <div className={styles.sectionHeading}><h2 id="aspects-heading">Aspects</h2><span>{mode === 'play' ? 'Choose an approach' : 'Shape your character'}</span>
      <Button variant="ghost" size="sm" className={styles.aspectDisclosure} aria-expanded={disclosure.expanded} aria-controls="character-aspect-groups" onClick={disclosure.toggle}>{disclosure.expanded ? 'Hide −' : 'Show +'}</Button>
    </div>
    <div id="character-aspect-groups" className={`${styles.aspectGroups} ${!disclosure.expanded ? styles.aspectGroupsCollapsed : ''}`}>
      {ASPECT_BLOCKS.map((block) => <section key={block.group} className={styles.aspectGroup}>
        <h3>{block.title}</h3>
        {block.keys.map(({ key, label }) => {
          const value = getAspectValue(sheet, block.group, key);
          return mode === 'build' ? <div className={styles.aspectBuildRow} key={key}>
            <span>{label}</span><div className={styles.stepper}>
              <Button variant="ghost" size="sm" aria-label={`Decrease ${label}`} disabled={update.isPending} onClick={() => update.mutate({ [aspectPath(block.group, key)]: value - 1 })}>−</Button>
              <strong>{signedScore(value)}</strong>
              <Button variant="ghost" size="sm" aria-label={`Increase ${label}`} disabled={update.isPending} onClick={() => update.mutate({ [aspectPath(block.group, key)]: value + 1 })}>+</Button>
            </div>
          </div> : <Button variant="ghost" key={key} className={styles.aspectRoll} aria-label={`Roll ${label} ${signedScore(value)}`} onClick={() => onApproach({ group: block.group, key, label: `${label} (${block.title})`, blockTitle: block.title })}>
            <span>{label}</span><strong>{signedScore(value)}</strong>
          </Button>;
        })}
      </section>)}
    </div>
    {update.isError && <p role="alert" className={styles.error}>Aspect was not saved. Try again.</p>}
    <p className={`${styles.aspectHint} ${!disclosure.expanded ? styles.aspectHintCollapsed : ''}`}>{mode === 'play' ? 'Select any aspect to prepare a roll.' : 'Changes save as you go. Check starting values with your Storyweaver.'}</p>
  </aside>;
}
