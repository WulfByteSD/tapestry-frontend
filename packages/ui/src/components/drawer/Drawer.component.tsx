'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Drawer.module.scss';
import type { DrawerProps } from './drawer.types';

const SLIDE_VARIANTS = {
  left: {
    hidden: { x: '-100%' },
    visible: { x: 0 },
  },
  right: {
    hidden: { x: '100%' },
    visible: { x: 0 },
  },
};

const SLIDE_TRANSITION = {
  type: 'tween' as const,
  duration: 0.28,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export default function Drawer({ open, onClose, placement = 'left', width = 300, title, children, className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={onClose}
            aria-hidden="true"
          />
          <motion.aside
            className={[styles.drawer, styles[placement], className].filter(Boolean).join(' ')}
            style={{ width }}
            variants={SLIDE_VARIANTS[placement]}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={SLIDE_TRANSITION as any}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : 'Navigation menu'}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={styles.drawerHeader}>
              {title && <span className={styles.drawerTitle}>{title}</span>}
              <button className={styles.closeBtn} onClick={onClose} aria-label="Close navigation" type="button">
                <CloseIcon />
              </button>
            </div>

            <div className={styles.drawerContent}>{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
