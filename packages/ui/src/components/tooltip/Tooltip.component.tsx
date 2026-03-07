"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import type { TooltipProps } from "./tooltip.types";
import styles from "./Tooltip.module.scss";

export default function Tooltip({
  title,
  placement = "top",
  children,
  visible: controlledVisible,
  onVisibleChange,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 100,
  className,
  arrow = true,
}: TooltipProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enterTimerRef = useRef<number | null>(null);
  const leaveTimerRef = useRef<number | null>(null);
  const touchTimerRef = useRef<number | null>(null);

  // Determine if visibility is controlled or internal
  const isControlled = controlledVisible !== undefined;
  const isVisible = isControlled ? controlledVisible : internalVisible;

  useEffect(() => {
    setMounted(true);
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    const gap = 8; // Space between trigger and tooltip

    switch (placement) {
      case "top":
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  }, [placement]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isVisible, updatePosition]);

  const setVisible = useCallback(
    (visible: boolean) => {
      if (!isControlled) {
        setInternalVisible(visible);
      }
      onVisibleChange?.(visible);
    },
    [isControlled, onVisibleChange],
  );

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    enterTimerRef.current = window.setTimeout(() => {
      setVisible(true);
    }, mouseEnterDelay);
  };

  const handleMouseLeave = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }

    leaveTimerRef.current = window.setTimeout(() => {
      setVisible(false);
    }, mouseLeaveDelay);
  };

  const handleTouchStart = () => {
    touchTimerRef.current = window.setTimeout(() => {
      setVisible(true);
    }, 500); // Long press delay
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    // Keep tooltip visible for a moment on touch
    setTimeout(() => setVisible(false), 2000);
  };

  // Don't render if no title
  if (!title) {
    return <>{children}</>;
  }

  const tooltipContent = mounted && isVisible && (
    <div
      ref={tooltipRef}
      className={clsx(styles.tooltip, styles[placement], className)}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.tooltipContent}>{title}</div>
      {arrow && <div className={styles.tooltipArrow} />}
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className={styles.tooltipTrigger}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {children}
      </div>
      {mounted && typeof document !== "undefined" && createPortal(tooltipContent, document.body)}
    </>
  );
}
