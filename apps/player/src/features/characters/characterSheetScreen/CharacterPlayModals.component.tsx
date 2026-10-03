import { HpModal } from './tabs/overview/Hp.modal';
import { ThreadsModal } from './tabs/overview/Threads.modal';
import { RollModal } from './tabs/overview/Roll.modal';
import { AttackModal } from './tabs/overview/Attack.modal';
import { HarmModal } from './tabs/overview/Harm.modal';
import type { CharacterPlayModalsProps } from './CharacterPlay.types';
export function CharacterPlayModals({ sheet, action, aspect, onClose }: CharacterPlayModalsProps) {
  switch (action) {
    case 'hp': return <HpModal sheet={sheet} onClose={onClose} />;
    case 'threads': return <ThreadsModal sheet={sheet} onClose={onClose} />;
    case 'attack': return <AttackModal sheet={sheet} onClose={onClose} />;
    case 'harm': return <HarmModal sheet={sheet} onClose={onClose} />;
    case 'approach': return <RollModal sheet={sheet} initialAspect={aspect ?? { group: 'might', key: 'strength' }} onClose={onClose} />;
    default: return null;
  }
}
