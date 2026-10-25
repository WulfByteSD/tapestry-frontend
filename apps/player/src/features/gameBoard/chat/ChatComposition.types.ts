import type { KeyboardEventHandler, ReactNode } from 'react';
import type { ChatComposition } from '@tapestry/types';

export type ChatCompositionFieldsProps = {
  id: string;
  value: ChatComposition;
  disabled: boolean;
  onChange: (value: ChatComposition) => void;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  toolbarEnd?: ReactNode;
};
