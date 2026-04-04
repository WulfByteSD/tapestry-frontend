'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import type { DropdownMenuProps, DropdownMenuItem } from './dropdownMenu.types';
import styles from './DropdownMenu.module.scss';

// Type guard to check if an item is an action item (not a divider)
function isActionItem(item: DropdownMenuItem): item is Extract<DropdownMenuItem, { label: string }> {
  return !('divider' in item && item.divider === true);
}

export default function DropdownMenu({ items, trigger, openOn = 'click', closeOnSelect = true, align = 'right', position = 'bottom', className }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  // SSR-safe mounting
  useEffect(() => {
    setMounted(true);
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Filter out divider-only items and disabled items for keyboard navigation
  const selectableItems = items.filter((item): item is Extract<DropdownMenuItem, { label: string }> => {
    return isActionItem(item) && !item.disabled;
  });

  // Calculate menu position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    const gap = 8;

    if (position === 'bottom') {
      top = triggerRect.bottom + gap;
    } else {
      top = triggerRect.top - menuRect.height - gap;
    }

    if (align === 'right') {
      left = triggerRect.right - menuRect.width;
    } else {
      left = triggerRect.left;
    }

    // Keep menu within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 8) left = 8;
    if (left + menuRect.width > viewportWidth - 8) {
      left = viewportWidth - menuRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + menuRect.height > viewportHeight - 8) {
      top = viewportHeight - menuRect.height - 8;
    }

    setMenuPosition({ top, left });
  }, [align, position]);

  // Update position when menu opens
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setFocusedIndex(-1);
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + 1;
          return next >= selectableItems.length ? 0 : next;
        });
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? selectableItems.length - 1 : next;
        });
      }

      if (event.key === 'Enter' && focusedIndex >= 0) {
        event.preventDefault();
        const item = selectableItems[focusedIndex];
        if (item && !item.disabled) {
          item.onClick();
          if (closeOnSelect) {
            setIsOpen(false);
            setFocusedIndex(-1);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, selectableItems, closeOnSelect]);

  const handleTriggerClick = () => {
    if (openOn === 'click') {
      setIsOpen(!isOpen);
    }
  };

  const handleTriggerMouseEnter = () => {
    if (openOn === 'hover') {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(true);
      }, 100);
    }
  };

  const handleTriggerMouseLeave = () => {
    if (openOn === 'hover') {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false);
        setFocusedIndex(-1);
      }, 150);
    }
  };

  const handleMenuMouseEnter = () => {
    if (openOn === 'hover' && hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleMenuMouseLeave = () => {
    if (openOn === 'hover') {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false);
        setFocusedIndex(-1);
      }, 150);
    }
  };

  const handleItemClick = (item: DropdownMenuItem) => {
    if (!isActionItem(item)) return;
    if (item.disabled) return;
    item.onClick();
    if (closeOnSelect) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  const renderMenu = () => {
    if (!mounted || !isOpen) return null;

    let selectableIndex = -1;

    return createPortal(
      <div
        ref={menuRef}
        className={clsx(styles.menu, className)}
        style={{
          top: menuPosition.top,
          left: menuPosition.left,
        }}
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
      >
        {items.map((item, index) => {
          if (!isActionItem(item)) {
            // Render divider
            return <div key={`divider-${index}`} className={styles.divider} />;
          }

          // Now TypeScript knows item is an action item
          if (!item.disabled) {
            selectableIndex++;
          }

          const isFocused = !item.disabled && selectableIndex === focusedIndex;

          return (
            <button
              key={index}
              type="button"
              className={clsx(styles.item, item.variant === 'danger' && styles.itemDanger, item.disabled && styles.itemDisabled, isFocused && styles.itemFocused)}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              onMouseEnter={() => {
                if (!item.disabled) {
                  setFocusedIndex(selectableIndex);
                }
              }}
            >
              {item.icon && <span className={styles.icon}>{item.icon}</span>}
              <span className={styles.label}>{item.label}</span>
            </button>
          );
        })}
      </div>,
      document.body
    );
  };

  return (
    <div className={styles.container}>
      <div ref={triggerRef} onClick={handleTriggerClick} onMouseEnter={handleTriggerMouseEnter} onMouseLeave={handleTriggerMouseLeave} className={styles.trigger}>
        {trigger}
      </div>
      {renderMenu()}
    </div>
  );
}
