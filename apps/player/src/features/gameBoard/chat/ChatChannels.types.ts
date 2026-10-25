import type { ChatChannelDto } from '@tapestry/types';
export type ChatChannelsProps = {
  channels: ChatChannelDto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  rollsSelected: boolean;
  onSelectRolls: () => void;
  canManage: boolean;
  onCreate: () => void;
};
