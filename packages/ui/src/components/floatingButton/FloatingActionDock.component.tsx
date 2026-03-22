"use client";

import clsx from "clsx";
import styles from "./FloatingActionDock.module.scss";
import { FloatingActionItem } from "./FloatingActionDock.types";

type FloatingActionDockProps = {
  actions: FloatingActionItem[];
  className?: string;
};

export function FloatingActionDock({ actions, className }: FloatingActionDockProps) {
  if (!actions.length) return null;

  return (
    <div className={clsx(styles.dock, className)}>
      {actions.map((action) => {
        const toneClass =
          action.tone === "danger" ? styles.danger : action.tone === "secondary" ? styles.secondary : styles.primary;

        return (
          <button
            key={action.key}
            type={action.type ?? "button"}
            form={action.form}
            disabled={action.disabled || action.loading}
            onClick={action.onClick}
            className={clsx(styles.action, toneClass)}
          >
            {action.loading ? `${action.label}…` : action.label}
          </button>
        );
      })}
    </div>
  );
}

export default FloatingActionDock;
