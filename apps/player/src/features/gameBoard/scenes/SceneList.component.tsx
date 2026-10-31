import { Button, Loader } from '@tapestry/ui';
import type { EncounterSceneSummary } from '@tapestry/types';
import type { SceneListProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneList({ state, onEnter }: SceneListProps) {
  const scenes = state.list.data?.payload ?? [];
  const rows = (items: EncounterSceneSummary[]) => <ul className={styles.list}>{items.map(scene => <li key={scene.id} className={styles.sceneRow}><div><strong>{scene.title}</strong><p className={styles.muted}>{scene.encounterTitle} · {scene.visibility === 'private' ? 'Private audience' : 'Public audience'} · {scene.canPost ? 'In the cast' : 'Read only'}</p></div><Button type="button" size="sm" variant="outline" onClick={() => onEnter(scene)}>{scene.channelId ? 'Enter scene' : 'Select scene tools'}</Button></li>)}</ul>;
  return <section className={styles.section}><h2>Encounters</h2><p className={styles.muted}>Enter an open scene, or revisit a completed conversation. Preparation stays private to Storyweavers.</p>{state.list.isLoading || state.refreshingAccess ? <Loader label="Loading your scenes…" /> : state.list.isError ? <div className={styles.error} role="alert">Scenes are unavailable. <Button type="button" variant="outline" onClick={() => void state.list.refetch()}>Retry</Button></div> : <>{rows(scenes.filter(entry => entry.status === 'open'))}{!scenes.some(entry => entry.status === 'open') && <p className={styles.muted}>No open scenes for you yet.</p>}<details><summary>Completed scenes ({scenes.filter(entry => entry.status === 'completed').length})</summary>{rows(scenes.filter(entry => entry.status === 'completed'))}</details></>}</section>;
}
