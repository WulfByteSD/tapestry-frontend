"use client";

import styles from "./AspectStepperRow.module.scss";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  canDec: boolean;
  canInc: boolean;
  onDec: () => void;
  onInc: () => void;
};

export function AspectStepperRow({ label, value, min, max, canDec, canInc, onDec, onInc }: Props) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>

      <div className={styles.controls}>
        <button type="button" className={styles.stepBtn} disabled={!canDec || value <= min} onClick={onDec}>
          −
        </button>
        <div className={styles.value}>{value}</div>
        <button type="button" className={styles.stepBtn} disabled={!canInc || value >= max} onClick={onInc}>
          +
        </button>
      </div>
    </div>
  );
}
