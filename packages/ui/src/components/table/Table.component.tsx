"use client";

import React, { useMemo } from "react";
import clsx from "clsx";
import { Button } from "../button";
import styles from "./Table.module.scss";
import type { TableAlign, TableColumn, TablePagination, TableProps, TableRowAction } from "./table.types";

function resolveRowKey<T>(row: T, rowKey: keyof T | ((row: T) => string)) {
  if (typeof rowKey === "function") {
    return rowKey(row);
  }

  const value = row[rowKey];
  return String(value);
}

function resolveCellValue<T>(row: T, column: TableColumn<T>) {
  if (!column.dataIndex) return undefined;
  return row[column.dataIndex];
}

function resolveActionDisabled<T>(action: TableRowAction<T>, row: T) {
  if (typeof action.disabled === "function") {
    return action.disabled(row);
  }

  return Boolean(action.disabled);
}

function getVisiblePages(pagination: TablePagination) {
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const current = Math.min(Math.max(1, pagination.page), totalPages);

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, -1, totalPages];
  }

  if (current >= totalPages - 3) {
    return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, -1, current - 1, current, current + 1, -1, totalPages];
}

function getAlignClass(align: TableAlign | undefined) {
  if (align === "center") return styles.alignCenter;
  if (align === "right") return styles.alignRight;
  return styles.alignLeft;
}

export default function Table<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  toolbar,
  className,
  onRowClick,
  rowActions = [],
  pagination,
  emptyTitle = "No records found",
  emptyMessage = "There is nothing to display yet.",
  loadingMessage = "Loading records...",
}: TableProps<T>) {
  const hasActions = rowActions.length > 0;
  const totalColumns = columns.length + (hasActions ? 1 : 0);

  const pageInfo = useMemo(() => {
    if (!pagination) return null;

    const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
    const current = Math.min(Math.max(1, pagination.page), totalPages);
    const start = pagination.total === 0 ? 0 : (current - 1) * pagination.pageSize + 1;
    const end = Math.min(current * pagination.pageSize, pagination.total);

    return {
      totalPages,
      current,
      start,
      end,
      pages: getVisiblePages(pagination),
      hasPrev: current > 1,
      hasNext: current < totalPages,
    };
  }, [pagination]);

  return (
    <div className={clsx(styles.root, className)}>
      {toolbar ? <div className={styles.toolbar}>{toolbar}</div> : null}

      <div className={styles.tableShell}>
        <div className={styles.scrollWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={clsx(styles.headCell, getAlignClass(column.align), column.className)}
                    style={column.width ? { width: column.width } : undefined}
                    scope="col"
                  >
                    {column.title}
                  </th>
                ))}

                {hasActions ? (
                  <th className={clsx(styles.headCell, styles.actionsHead)} scope="col">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={totalColumns} className={styles.stateCell}>
                    <div className={styles.stateBlock}>
                      <div className={styles.loadingDot} aria-hidden="true" />
                      <div>{loadingMessage}</div>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={totalColumns} className={styles.stateCell}>
                    <div className={styles.stateBlock}>
                      <strong>{emptyTitle}</strong>
                      <p>{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => {
                  const key = resolveRowKey(row, rowKey);

                  return (
                    <tr
                      key={key}
                      className={clsx(styles.row, onRowClick && styles.clickableRow)}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {columns.map((column) => {
                        const value = resolveCellValue(row, column);

                        return (
                          <td
                            key={column.key}
                            className={clsx(styles.bodyCell, getAlignClass(column.align), column.className)}
                          >
                            {column.render ? column.render(value, row, rowIndex) : value != null ? String(value) : "—"}
                          </td>
                        );
                      })}

                      {hasActions ? (
                        <td
                          className={clsx(styles.bodyCell, styles.actionsCell)}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className={styles.actions}>
                            {rowActions.map((action) => (
                              <Button
                                key={action.key}
                                size="sm"
                                variant="ghost"
                                tone={action.tone ?? "neutral"}
                                disabled={resolveActionDisabled(action, row)}
                                onClick={() => action.onClick(row)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pageInfo && (
        <div className={styles.pagination}>
          <div className={styles.paginationMeta}>
            {pagination!.total > 0 ? (
              <span>
                Showing {pageInfo.start}–{pageInfo.end} of {pagination?.total}
              </span>
            ) : (
              <span>Showing 0 results</span>
            )}
          </div>

          <div className={styles.paginationControls}>
            <Button
              size="sm"
              variant="ghost"
              tone="neutral"
              disabled={!pageInfo.hasPrev}
              onClick={() => pagination?.onPageChange(pageInfo.current - 1)}
            >
              Previous
            </Button>

            <div className={styles.pageList}>
              {pageInfo.pages.map((page, index) =>
                page === -1 ? (
                  <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    className={clsx(styles.pageButton, page === pageInfo.current && styles.pageButtonActive)}
                    onClick={() => pagination?.onPageChange(page)}
                    aria-current={page === pageInfo.current ? "page" : undefined}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <Button
              size="sm"
              variant="ghost"
              tone="neutral"
              disabled={!pageInfo.hasNext}
              onClick={() => pagination?.onPageChange(pageInfo.current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
