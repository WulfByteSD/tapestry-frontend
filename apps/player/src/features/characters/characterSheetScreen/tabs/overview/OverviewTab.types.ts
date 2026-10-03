import type { SheetTabsProps } from '../../CharacterSheet.types';
export type OverviewTabProps = Pick<SheetTabsProps, 'sheet' | 'mode' | 'onAction' | 'onNavigate'>;
