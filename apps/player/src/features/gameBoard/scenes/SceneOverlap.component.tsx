import { Button } from '@tapestry/ui';
import type { SceneOverlapProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneOverlap({ state }: SceneOverlapProps) {
  if (!state.overlaps.length) return null;
  return <section className={styles.review} role="alert" aria-label="Review overlapping cast"><h4>Characters already in another encounter</h4><ul>{state.overlaps.map((entry, index) => <li key={`${entry.characterId}:${index}`}>{entry.characterName} · {entry.encounterTitle}</li>)}</ul><p>Continue this scene action with those characters? Their live health is shared across encounters.</p><div className={styles.actions}><Button type="button" disabled={state.busy} isLoading={state.busy} onClick={() => void state.confirmOverlap()}>Confirm overlapping cast</Button><Button type="button" variant="outline" disabled={state.busy} onClick={state.cancelOverlap}>Keep editing</Button></div></section>;
}
