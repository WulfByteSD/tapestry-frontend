"use client";

import React, { useState } from "react";
import clsx from "clsx";
import styles from "./Avatar.module.scss";

export type AvatarSize = "sm" | "md" | "lg";

export type AvatarProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  size?: AvatarSize;
  alt?: string;
  name?: string; // Used to generate initials fallback
};

/**
 * Generate initials from a name (e.g., "John Doe" -> "JD")
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a consistent background color from a string (name)
 */
function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#ec4899", // pink
    "#f43f5e", // rose
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#eab308", // yellow
    "#84cc16", // lime
    "#22c55e", // green
    "#10b981", // emerald
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#3b82f6", // blue
  ];

  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ src, size = "md", alt, name, className, ...rest }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const shouldShowInitials = !src || hasError;

  const initials = name ? getInitials(name) : "?";
  const backgroundColor = name ? getColorFromName(name) : "#9ca3af";

  if (shouldShowInitials) {
    return (
      <div
        className={clsx(styles.avatar, styles[`size_${size}`], styles.initials, className)}
        style={{ backgroundColor }}
        role="img"
        aria-label={alt || name || "Avatar"}
      >
        <span className={styles.initialsText}>{initials}</span>
      </div>
    );
  }

  return (
    <img
      {...rest}
      src={src}
      alt={alt || name || "Avatar"}
      className={clsx(styles.avatar, styles[`size_${size}`], className)}
      onError={() => setHasError(true)}
    />
  );
}
