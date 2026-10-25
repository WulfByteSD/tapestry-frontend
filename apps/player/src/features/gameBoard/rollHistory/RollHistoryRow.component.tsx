import { Avatar } from '@tapestry/ui';
import { TbChevronDown } from 'react-icons/tb';
import { rollLabel, rollTime, savedDice } from './RollHistory.helpers';
import type { RollHistoryRowProps } from './RollHistory.types';
import styles from './RollHistory.module.scss';

export function RollHistoryRow({ roll, currentUserId }: RollHistoryRowProps) {
  const author = roll.playerDisplayName || 'Player unavailable';
  const actor = roll.character ? roll.characterName || 'Character unavailable' : author;
  const time = roll.rolledAt || roll.createdAt;
  return (
    <li className={styles.row}>
      <details className={styles.disclosure}>
        <summary className={styles.summary}>
          <span className={styles.total}><span className={styles.totalLabel}>Total</span>{roll.total}</span>
          <span className={styles.identity}><Avatar name={actor} src={roll.character ? undefined : roll.playerAvatar ?? undefined} size="sm" /></span>
          <span className={styles.rowBody}>
            <span className={styles.rowMeta}><strong>{actor}</strong>{roll.character ? <span>by {author}{roll.player === currentUserId ? ' (you)' : ''}</span> : roll.player === currentUserId ? <span>You</span> : null}<time dateTime={time}>{rollTime(time)}</time></span>
            <span className={styles.context}>{roll.context || rollLabel(roll.rollType || 'custom')}</span>
            <span className={styles.expression}><span>{rollLabel(roll.rollType || 'custom')}</span><code>{roll.expression}</code>{roll.attack ? <span>{rollLabel(roll.attack.outcome)}</span> : null}</span>
          </span>
          <span className={styles.detailsCue}><span>Details</span><TbChevronDown aria-hidden="true" /></span>
        </summary>
        <div className={styles.detail}>
          <div className={styles.diceSection}><h3>Saved dice</h3><ol className={styles.dice} aria-label="All dice in this roll">{savedDice(roll.allRolls, roll.keptRolls).map((die, index) => <li key={index} className={die.kept ? styles.kept : styles.dropped}><strong>{die.value}</strong><span>{die.kept ? 'Kept' : 'Dropped'}</span></li>)}</ol></div>
          <dl className={styles.facts}>
            <div><dt>Expression</dt><dd><code>{roll.expression}</code></dd></div>
            <div><dt>Breakdown</dt><dd>{roll.breakdown || 'No breakdown was saved.'}</dd></div>
            <div><dt>Kept dice</dt><dd>{roll.keptRolls.join(', ') || 'None'}</dd></div>
            {roll.context ? <div><dt>Context</dt><dd>{roll.context}</dd></div> : null}
            {roll.aspectUsed ? <div><dt>Aspect</dt><dd>{rollLabel(roll.aspectUsed)}</dd></div> : null}
            {roll.attack ? <>
              <div><dt>Outcome</dt><dd>{rollLabel(roll.attack.outcome)}</dd></div>
              <div><dt>Target number</dt><dd>{roll.attack.targetNumber}</dd></div>
              <div><dt>Margin</dt><dd>{roll.attack.margin > 0 ? '+' : ''}{roll.attack.margin}</dd></div>
              {roll.attack.targetLabel ? <div><dt>Target</dt><dd>{roll.attack.targetLabel}</dd></div> : null}
              {roll.attack.weaponNameSnapshot || roll.attack.itemKey ? <div><dt>Weapon</dt><dd>{roll.attack.weaponNameSnapshot || roll.attack.itemKey}</dd></div> : null}
              {roll.attack.attackNameSnapshot || roll.attack.attackProfileKey ? <div><dt>Attack</dt><dd>{roll.attack.attackNameSnapshot || roll.attack.attackProfileKey}</dd></div> : null}
            </> : null}
          </dl>
        </div>
      </details>
    </li>
  );
}
