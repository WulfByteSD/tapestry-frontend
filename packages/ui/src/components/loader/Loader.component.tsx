"use client";

import React from "react";
import clsx from "clsx";
import styles from "./Loader.module.scss";

export type LoaderSize = "sm" | "md" | "lg";
export type LoaderTone = "gold" | "purple" | "neutral";
export type LoaderLayout = "stacked" | "inline";

export type LoaderProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: LoaderSize;
  tone?: LoaderTone;
  layout?: LoaderLayout;
  label?: React.ReactNode;
  caption?: React.ReactNode;
};

export default function Loader({
  size = "md",
  tone = "gold",
  layout = "stacked",
  label,
  caption,
  className,
  ...rest
}: LoaderProps) {
  const accessibleLabel =
    rest["aria-label"] ?? (typeof label === "string" && label.trim().length > 0 ? label : "Loading");

  return (
    <div
      {...rest}
      className={clsx(styles.root, styles[`size_${size}`], styles[`tone_${tone}`], styles[`layout_${layout}`], className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={accessibleLabel}
    >
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.glow} />
        <span className={styles.ringOuter} />
        <span className={styles.ringMiddle} />
        <span className={styles.ringInner} />
        <span className={styles.core} />
      </span>

      {(label || caption) && (
        <span className={styles.copy}>
          {label && <span className={styles.label}>{label}</span>}
          {caption && <span className={styles.caption}>{caption}</span>}
        </span>
      )}
    </div>
  );
}
