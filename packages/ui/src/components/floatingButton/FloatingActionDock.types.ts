import type { ReactNode } from "react";

export type FloatingActionItem = {
  key: string;
  label?: string;
  icon?: ReactNode;
  tooltip?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  form?: string;
  disabled?: boolean;
  loading?: boolean;
  tone?: "primary" | "secondary" | "danger";
};
