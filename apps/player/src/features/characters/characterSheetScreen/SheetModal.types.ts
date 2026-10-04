import type { ComponentProps } from 'react';
import { Modal } from '@tapestry/ui';

export type SheetModalProps = ComponentProps<typeof Modal> & { subtitle?: string };
