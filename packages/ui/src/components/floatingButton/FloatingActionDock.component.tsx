"use client";

import clsx from "clsx";
import Tooltip from "../tooltip/Tooltip.component";
import styles from "./FloatingActionDock.module.scss";
import { FloatingActionItem } from "./FloatingActionDock.types";

type FloatingActionDockProps = {
  actions: FloatingActionItem[];
  direction?: "vertical" | "horizontal";
  className?: string;
};

export function FloatingActionDock({ actions, direction = "vertical", className }: FloatingActionDockProps) {
  if (!actions.length) return null;

  return (
    <div className={clsx(styles.dock, direction === "horizontal" && styles.horizontal, className)}>
      {actions.map((action) => {
        const toneClass =
          action.tone === "danger" ? styles.danger : action.tone === "secondary" ? styles.secondary : styles.primary;

        const hasLabel = Boolean(action.label);
        const hasIcon = Boolean(action.icon);
        const showTooltip = Boolean(action.tooltip || (!hasLabel && action.label));
        const tooltipText = action.tooltip || action.label || "";

        const buttonContent = (
          <>
            {hasIcon && <span className={styles.icon}>{action.icon}</span>}
            {hasLabel && <span className={styles.label}>{action.loading ? `${action.label}…` : action.label}</span>}
          </>
        );

        const button = (
          <button
            key={action.key}
            type={action.type ?? "button"}
            form={action.form}
            disabled={action.disabled || action.loading}
            onClick={action.onClick}
            className={clsx(
              styles.action,
              toneClass,
              hasIcon && !hasLabel && styles.iconOnly,
              hasIcon && hasLabel && styles.withIcon,
            )}
          >
            {buttonContent}
          </button>
        );

        if (showTooltip && tooltipText) {
          return (
            <Tooltip key={action.key} title={tooltipText} placement="left">
              {button}
            </Tooltip>
          );
        }

        return button;
      })}
    </div>
  );
}

export default FloatingActionDock;
