'use client';

import { ASPECT_BLOCKS } from '@tapestry/types';
import { AspectStepperRow } from '../../aspects/AspectStepperRow';
import { MAX_ASPECT_AT_CREATION, MAX_PENALTY_ASPECTS, MIN_ASPECT, STARTING_POINTS } from '../characterCreator.constants';
import type { CharacterDraft } from '../characterCreator.types';
import styles from './AspectsStep.module.scss';
import stepStyles from './steps.module.scss';

const ASPECT_HINTS: Record<string, string> = {
  strength: 'Raw physical power and melee effectiveness.',
  presence: 'Force of personality and commanding attention.',
  agility: 'Speed, reflexes, and precision movement.',
  charm: 'Social ease, persuasion, and likability.',
  instinct: 'Perception, intuition, and reactive awareness.',
  knowledge: 'Learned skill, memory, and tactical reasoning.',
  willpower: 'Mental resilience and resistance to influence.',
  empathy: 'Emotional insight and reading others.',
};

type Props = {
  draft: CharacterDraft;
  setAspect: (group: string, key: string, value: number) => void;
};

export function AspectsStep({ draft, setAspect }: Props) {
  const { aspects } = draft;

  const allValues = Object.values(aspects).flatMap((g) => Object.values(g as Record<string, number>));
  const penaltyCount = allValues.filter((v) => v < 0).length;
  const penaltyBonus = Math.min(penaltyCount, MAX_PENALTY_ASPECTS);
  const totalPoints = STARTING_POINTS + penaltyBonus;
  const spentPoints = allValues.reduce((sum, v) => sum + (v > 0 ? v : 0), 0);
  const remainingPoints = totalPoints - spentPoints;

  return (
    <div className={stepStyles.stepBody}>
      <div className={styles.callout}>
        <span className={styles.calloutTitle}>Aspect Rules</span>
        <p>
          You have <strong>{STARTING_POINTS} points</strong> to distribute freely. Taking <strong>−1</strong> in up to two aspects earns <strong>+1</strong> each to spend
          elsewhere. No aspect may exceed <strong>+{MAX_ASPECT_AT_CREATION}</strong> at creation.
        </p>
      </div>

      <div className={styles.budgetRow}>
        <span className={styles.budgetLabel}>Points remaining</span>
        <span className={`${styles.budgetValue} ${remainingPoints === 0 ? styles.budgetValue_empty : ''}`}>{remainingPoints}</span>
      </div>

      <div className={styles.blocks}>
        {ASPECT_BLOCKS.map((block) => (
          <div key={block.group} className={styles.block}>
            <div className={styles.blockTitle}>{block.title}</div>
            {block.keys.map(({ label, key }) => {
              const groupValues = aspects[block.group as keyof typeof aspects] as Record<string, number>;
              const value = groupValues[key];
              const canDec = value > MIN_ASPECT;
              const canInc = value < MAX_ASPECT_AT_CREATION && remainingPoints > 0;

              return (
                <div key={key} className={styles.rowWrap}>
                  <AspectStepperRow
                    label={label}
                    value={value}
                    canDec={canDec}
                    canInc={canInc}
                    onDec={() => setAspect(block.group, key, value - 1)}
                    onInc={() => setAspect(block.group, key, value + 1)}
                  />
                  <span className={styles.aspectHint}>{ASPECT_HINTS[key]}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
