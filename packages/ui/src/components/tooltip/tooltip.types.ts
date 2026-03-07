import type { ReactNode } from "react";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type TooltipProps = {
  /** The tooltip content */
  title?: ReactNode;
  /** Placement of the tooltip */
  placement?: TooltipPlacement;
  /** The wrapped element */
  children: ReactNode;
  /** Whether the tooltip is visible (controlled) */
  visible?: boolean;
  /** Callback when visibility changes */
  onVisibleChange?: (visible: boolean) => void;
  /** Delay in ms before showing the tooltip */
  mouseEnterDelay?: number;
  /** Delay in ms before hiding the tooltip */
  mouseLeaveDelay?: number;
  /** Custom className for the tooltip */
  className?: string;
  /** Whether to show an arrow */
  arrow?: boolean;
};
