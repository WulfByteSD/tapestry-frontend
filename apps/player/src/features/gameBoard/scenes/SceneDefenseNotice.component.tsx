import { useRef, useState } from 'react';
import type { EncounterExchange } from '@tapestry/types';
import { Button } from '@tapestry/ui';
import { TbShield } from 'react-icons/tb';
import { SceneDefense } from './SceneDefense.form';
import { SceneRollModal } from './SceneRoll.modal';
import type { SceneDefenseNoticeProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneDefenseNotice({ state, sceneId, characterState, readOnly }: SceneDefenseNoticeProps) {
  const [selected, setSelected] = useState<EncounterExchange | null>(null);
  const announcementRef = useRef<HTMLDivElement>(null);
  const scene = state.scene ?? (state.retainedScene?.id === state.selected?.id ? state.retainedScene : null);
  const accessPending = state.refreshingAccess || state.detail.isLoading || state.detail.isError || state.list.isError;
  if (!scene || scene.id !== sceneId || readOnly || scene.status !== 'open') return null;

  const canDefend = (exchange: EncounterExchange) => exchange.sceneId === scene.id && scene.participants.some(
    participant => participant.id === exchange.targetParticipantId && (scene.canManage || (participant.kind === 'character' && participant.ownerPlayerId === state.viewerId)),
  );
  const exchanges = state.exchanges.data?.payload.items ?? [];
  const pending = exchanges.filter(exchange => exchange.status === 'pending' && canDefend(exchange));
  const defense = selected && canDefend(selected) ? exchanges.find(exchange => exchange.id === selected.id) ?? selected : null;
  const target = scene.participants.find(participant => participant.id === defense?.targetParticipantId);
  const closeDefense = () => {
    setSelected(null);
    if (defense && !pending.some(exchange => exchange.id === defense.id)) {
      const transcript = announcementRef.current?.closest('[aria-label="Campaign chat"]')?.querySelector<HTMLElement>('[aria-label="Channel messages"]');
      requestAnimationFrame(() => { if (transcript?.isConnected) transcript.focus(); });
    }
  };

  return <>
    <div ref={announcementRef} className={styles.defenseAnnouncement} role="status" aria-live="polite" aria-atomic="true">
      {!accessPending && !state.exchanges.isError && pending.length > 0 ? `${pending.length === 1 ? 'Defense needed' : `${pending.length} defenses needed`}: ${pending.map(exchange => `${exchange.targetName} against ${exchange.actorName}`).join('; ')}.` : ''}
    </div>
    {!accessPending && !state.exchanges.isError && pending.length > 0 && <section className={styles.defenseNotice} aria-label="Defense needed">
      <div className={styles.defenseNoticeHeading}><TbShield aria-hidden /><strong>Defense needed{pending.length > 1 ? ` (${pending.length})` : ''}</strong></div>
      <ul className={styles.defenseNoticeList}>{pending.map(exchange => <li key={exchange.id}>
        <div><strong>{exchange.targetName}</strong><span>{exchange.actorName} · Attack {exchange.attack.total}</span></div>
        <Button type="button" size="sm" disabled={state.busy} aria-label={`Defend ${exchange.targetName} against ${exchange.actorName}`} onClick={() => setSelected(exchange)}>Defend</Button>
      </li>)}</ul>
    </section>}
    {defense && <SceneRollModal key={defense.id} open={!accessPending} suspended={accessPending} busy={state.busy} title="Roll defense" name={defense.targetName} portraitUrl={target?.portraitUrl} onClose={closeDefense}>
      <SceneDefense state={state} scene={scene} exchange={defense} characterState={characterState} onClose={closeDefense} />
    </SceneRollModal>}
  </>;
}
