'use client';

import { useId } from 'react';
import { Modal } from '@tapestry/ui';
import { useSheetModalFocus } from './SheetModal.hooks';
import type { SheetModalProps } from './SheetModal.types';
import styles from './SheetModal.module.scss';

export function SheetModal({ title, subtitle, open = false, children, className, wrapClassName, ...props }: SheetModalProps) {
  const id = useId().replace(/:/g, '');
  const marker = `sheet-dialog-${id}`;
  useSheetModalFocus(open, marker, `${marker}-title`);

  return (
    <Modal
      {...props}
      open={open}
      centered
      className={`${styles.dialog} ${className ?? ''}`}
      wrapClassName={`${styles.wrapper} ${marker} ${wrapClassName ?? ''}`}
      title={<><span id={`${marker}-title`} className={styles.title}>{title}</span>{subtitle && <span className={styles.subtitle}>{subtitle}</span>}</>}
    >
      {children}
    </Modal>
  );
}
