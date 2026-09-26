import { CSSProperties, ReactNode } from 'react';

export type InteractiveBookProps = {
  title: string;
  coverSrc?: string;
  coverAlt?: string;
  spineSrc?: string;
  spineLabel?: ReactNode;
  showSpineLabel?: boolean;
  showMetadata?: boolean;
  eyebrow?: string;
  description?: string;
  expanded?: boolean;
  disabled?: boolean;
  className?: string;
  width?: string;
  height?: string;
  spineWidth?: string;
  spineEdgeWidth?: string;
  coverFit?: ObjectFit;
  coverPosition?: ObjectPosition;
  spineFit?: ObjectFit;
  spineColor?: string;
};

export type ObjectFit = 'cover' | 'contain';
export type ObjectPosition = CSSProperties['objectPosition'];

export type BookCssVars = CSSProperties & {
  '--book-width'?: string;
  '--book-height'?: string;
  '--spine-width'?: string;
  '--spine-edge-width'?: string;
  '--cover-fit'?: ObjectFit;
  '--cover-position'?: ObjectPosition;
  '--spine-fit'?: ObjectFit;
  '--spine-color'?: string;
};
