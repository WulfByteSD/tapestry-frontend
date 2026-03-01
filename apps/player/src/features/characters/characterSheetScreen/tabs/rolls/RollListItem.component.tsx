"use client";

import { useMemo } from "react";
import styles from "./RollListItem.module.scss";

interface Props {
  roll: any;
  onClick: () => void;
}

export function RollListItem({ roll, onClick }: Props) {
  const timestamp = useMemo(() => {
    if (!roll.createdAt) return "";

    const date = new Date(roll.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }, [roll.createdAt]);

  const displayContext = roll.context || roll.rollType || "Roll";
  const hasEdge = roll.edge || (roll.allRolls?.length > roll.keptRolls?.length && roll.keepBest);
  const hasBurden = roll.burden || (roll.allRolls?.length > roll.keptRolls?.length && roll.keepWorst);

  return (
    <button className={styles.rollItem} onClick={onClick}>
      <div className={styles.rollHeader}>
        <span className={styles.rollContext}>{displayContext}</span>
        <span className={styles.rollTimestamp}>{timestamp}</span>
      </div>
      <div className={styles.rollBody}>
        <div className={styles.rollTotal}>{roll.total}</div>
        <div className={styles.rollDetails}>
          {roll.breakdown && <div className={styles.rollBreakdown}>{roll.breakdown}</div>}
          <div className={styles.rollMechanics}>
            {hasEdge && <span className={styles.edgeBadge}>Edge</span>}
            {hasBurden && <span className={styles.burdenBadge}>Burden</span>}
          </div>
        </div>
      </div>
    </button>
  );
}
