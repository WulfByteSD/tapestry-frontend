import { Button, Loader } from '@tapestry/ui';
import type { CharacterSheetStateProps } from './CharacterSheetState.types';
import styles from './CharacterSheet.module.scss';

export function CharacterSheetState({ loading, message, onBack, onRetry }: CharacterSheetStateProps) {
  return <div className={styles.page}>
    <Button variant="ghost" onClick={onBack}>← My characters</Button>
    <section className={styles.state} aria-live="polite" aria-busy={loading}>
      {loading ? <><Loader tone="gold" /><h1>Opening your character sheet</h1></> :
        <><h1>Could not load your character</h1><p role="alert">{message}</p><Button onClick={onRetry}>Try again</Button></>}
    </section>
  </div>;
}
