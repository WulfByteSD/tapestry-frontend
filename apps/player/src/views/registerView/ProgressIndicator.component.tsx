"use client";

import clsx from "clsx";
import styles from "./ProgressIndicator.module.scss";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export default function ProgressIndicator({ currentStep, totalSteps, labels }: ProgressIndicatorProps) {
  return (
    <div className={styles.progress}>
      <div className={styles.lineContainer}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={clsx(styles.line, {
              [styles.active]: step === currentStep,
              [styles.completed]: step < currentStep,
            })}
          />
        ))}
      </div>
      {labels && (
        <div className={styles.labelContainer}>
          {labels.map((label, i) => (
            <span
              key={i}
              className={clsx(styles.label, {
                [styles.activeLabel]: i + 1 === currentStep,
              })}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
