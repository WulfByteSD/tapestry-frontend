import React from 'react';
import type { ButtonTone } from '../button';

export type TableAlign = 'left' | 'center' | 'right';

export type TableColumn<T> = {
  key: string;
  title: React.ReactNode;
  dataIndex?: keyof T;
  width?: number | string;
  align?: TableAlign;
  className?: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
};

export type TableRowAction<T> = {
  key: string;
  label: React.ReactNode;
  tone?: ButtonTone;
  onClick: (row: T) => void;
  disabled?: boolean | ((row: T) => boolean);
};

export type TablePagination = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: keyof T | ((row: T) => string);
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
  rowActions?: TableRowAction<T>[];
  pagination?: TablePagination;
  emptyTitle?: string;
  emptyMessage?: string;
  loadingMessage?: string;
};
