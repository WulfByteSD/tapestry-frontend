"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Tabs.module.scss";
import type { TabsProps, TabsItem } from "./tabs.types";

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

function firstEnabledKey(items: TabsItem[]) {
  return items.find((i) => !i.disabled)?.key ?? items[0]?.key ?? "";
}

export function Tabs({
  items,
  activeKey,
  onChange,
  defaultActiveKey,
  variant = "pills",
  fit = "equal",
  keepMounted = true,
  className,
  tabListClassName,
  tabClassName,
  activeTabClassName,
  contentClassName,
  ariaLabel = "Tabs",
}: TabsProps) {
  const isControlled = activeKey !== undefined;
  const [internalKey, setInternalKey] = useState(defaultActiveKey ?? firstEnabledKey(items));

  // If items change and our current key disappears, recover gracefully.
  useEffect(() => {
    const current = isControlled ? activeKey : internalKey;
    if (!current) return;

    const exists = items.some((i) => i.key === current && !i.disabled);
    if (!exists) {
      const next = firstEnabledKey(items);
      if (isControlled) onChange?.(next);
      else setInternalKey(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const currentKey = isControlled ? (activeKey as string) : internalKey;
  const currentIndex = useMemo(() => items.findIndex((i) => i.key === currentKey), [items, currentKey]);

  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const setKey = (k: string) => {
    if (isControlled) onChange?.(k);
    else setInternalKey(k);
  };

  const focusTab = (idx: number) => {
    const el = tabsRef.current[idx];
    if (el) el.focus();
  };

  const nextEnabledIndex = (start: number, dir: 1 | -1) => {
    const len = items.length;
    let i = start;

    for (let step = 0; step < len; step++) {
      i = (i + dir + len) % len;
      if (!items[i]?.disabled) return i;
    }
    return start;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!items.length) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const ni = nextEnabledIndex(currentIndex, 1);
      setKey(items[ni].key);
      focusTab(ni);
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const ni = nextEnabledIndex(currentIndex, -1);
      setKey(items[ni].key);
      focusTab(ni);
    }

    if (e.key === "Home") {
      e.preventDefault();
      const ni = items.findIndex((i) => !i.disabled);
      if (ni >= 0) {
        setKey(items[ni].key);
        focusTab(ni);
      }
    }

    if (e.key === "End") {
      e.preventDefault();
      for (let ni = items.length - 1; ni >= 0; ni--) {
        if (!items[ni].disabled) {
          setKey(items[ni].key);
          focusTab(ni);
          break;
        }
      }
    }
  };

  const activeItem = items.find((i) => i.key === currentKey);

  return (
    <div className={cx(styles.root, className)}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cx(
          styles.tabList,
          variant === "pills" ? styles.variantPills : styles.variantUnderline,
          fit === "equal" ? styles.fitEqual : styles.fitContent,
          tabListClassName,
        )}
        onKeyDown={onKeyDown}
      >
        {items.map((t, idx) => {
          const isActive = t.key === currentKey;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabsRef.current[idx] = el;
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${t.key}`}
              id={`tab-${t.key}`}
              tabIndex={isActive ? 0 : -1}
              type="button"
              disabled={t.disabled}
              className={cx(
                styles.tab,
                isActive && styles.tabActive,
                t.disabled && styles.tabDisabled,
                tabClassName,
                isActive && activeTabClassName,
              )}
              onClick={() => !t.disabled && setKey(t.key)}
            >
              {t.icon ? <span className={styles.icon}>{t.icon}</span> : null}
              <span className={styles.label}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className={cx(styles.content, contentClassName)}>
        {keepMounted ? (
          items.map((t) => {
            const isActive = t.key === currentKey;
            return (
              <div
                key={t.key}
                role="tabpanel"
                id={`tabpanel-${t.key}`}
                aria-labelledby={`tab-${t.key}`}
                hidden={!isActive}
                className={styles.panel}
              >
                {t.children}
              </div>
            );
          })
        ) : (
          <div
            role="tabpanel"
            id={`tabpanel-${currentKey}`}
            aria-labelledby={`tab-${currentKey}`}
            className={styles.panel}
          >
            {activeItem?.children}
          </div>
        )}
      </div>
    </div>
  );
}
