export type TableColumn<T> = {
  key: string;
  title: React.ReactNode;
  dataIndex?: keyof T;
  width?: number | string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  className?: string;
};

export type TableRowAction<T> = {
  key: string;
  label: React.ReactNode;
  tone?: "neutral" | "gold" | "danger";
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
  emptyTitle?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowActions?: TableRowAction<T>[];
  toolbar?: React.ReactNode;
  pagination?: TablePagination;
  className?: string;
};
