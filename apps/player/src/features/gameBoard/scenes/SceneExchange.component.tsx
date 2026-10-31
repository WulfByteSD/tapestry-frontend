import type { SceneExchangeProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneExchange({ exchange }: SceneExchangeProps) {
  return <article className={styles.exchange} aria-label={`${exchange.actorName} against ${exchange.targetName}`}>
    <p><strong>{exchange.actorName}</strong> → <strong>{exchange.targetName}</strong> · <strong>{exchange.attack.total}</strong>{exchange.defense ? ` vs ${exchange.defense.total}` : exchange.targetNumber !== undefined ? ` vs Defense TN ${exchange.targetNumber}` : ''} · {exchange.status === 'pending' ? 'Awaiting defense' : exchange.status === 'cancelled' ? 'Cancelled' : exchange.outcome === 'hit' ? 'Hit' : 'Defended'}</p>
    <details><summary>Roll details</summary>{exchange.attack.profileName && <p><strong>{exchange.attack.profileName}</strong>{exchange.attack.harm ? ` · ${exchange.attack.harm} harm` : ''}{exchange.attack.range ? ` · ${exchange.attack.range}` : ''}</p>}<p>{exchange.attack.breakdown}</p>{exchange.defense && <p>Defense: {exchange.defense.breakdown}</p>}<p>{exchange.mode === 'opposed' ? 'Opposed · Ties favor the defender.' : 'Static · Meeting Defense TN is a hit.'} Harm and effects are separate.</p></details>
  </article>;
}
