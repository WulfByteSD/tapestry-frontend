'use client';

import * as React from 'react';
import clsx from 'clsx';
import styles from './FormGroup.module.scss';

export type FormGroupProps = {
  children: React.ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
};

export function FormGroup({ children, className, gap = 'md' }: FormGroupProps) {
  return <div className={clsx(styles.group, styles[`gap-${gap}`], className)}>{children}</div>;
}
