'use client';
import { Avatar, Button, Modal } from '@tapestry/ui';
import { useSheetModalFocus } from '@/features/characters/characterSheetScreen/SheetModal.hooks';
import type { CombatantPreviewProps, PreviewListProps } from './CombatantPreview.types';
import styles from './Encounter.module.scss';

function PreviewList({ title, values }: PreviewListProps) {
  if (!values?.length) return null;
  return <section className={styles.previewSection}><h3>{title}</h3><ul>{values.map((value, index) => <li key={index}>{value}</li>)}</ul></section>;
}

export default function CombatantPreview({ snapshot, active, onClose }: CombatantPreviewProps) {
  useSheetModalFocus(active, 'encounter-preview-dialog', 'encounter-preview-title');
  const lore = snapshot.loreCheck;
  const hasLore = lore && (lore.skill || lore.tn !== undefined || [lore.villagers, lore.priests, lore.scholars, lore.soldiers].some(values => values?.length));
  const hasMoves = !!(snapshot.attacks?.length || snapshot.abilities?.length);
  const hasDetails = !!(hasLore || snapshot.backgroundBehavior || snapshot.whereFound?.length || snapshot.hooks?.length || snapshot.statline.tags?.length || snapshot.notes?.public || snapshot.notes?.gm);
  const identity = <header className={styles.previewIdentity}>
    {snapshot.media?.portraitUrl && <Avatar className={styles.previewPortrait} size="lg" src={snapshot.media.portraitUrl} alt={snapshot.name} name={snapshot.name} />}
    <div className={styles.previewIdentityText}>
      {snapshot.tier && <p className={styles.previewTier}>Tier {snapshot.tier}</p>}
      <h2 id="encounter-preview-title" className={styles.previewTitle}>{snapshot.name}</h2>
      <p className={styles.previewClassification}>{[snapshot.category === 'npc' ? 'NPC' : snapshot.category, snapshot.disposition, snapshot.origin, snapshot.role].filter(Boolean).join(' · ')}</p>
    </div>
  </header>;

  return <Modal open={active} title={identity} className={styles.previewModal} wrapClassName="encounter-preview-dialog" width={hasMoves ? 860 : 640} zIndex={1100} onCancel={onClose} footer={<Button variant="outline" tone="neutral" onClick={onClose}>Close</Button>}>
    <article className={styles.preview}>
      <div className={hasMoves ? styles.previewCombat : styles.previewCompact}>
        <div className={styles.previewStatColumn}>
          <dl className={styles.previewVitals}>
            <div><dt>HP</dt><dd>{snapshot.statline.hp}</dd></div>
            <div><dt>Defense TN</dt><dd>{snapshot.statline.defenseTN}</dd></div>
          </dl>
          <dl className={styles.previewStats}>{([['Harm', snapshot.statline.harm], ['Armor', snapshot.statline.armor], ['Actions', snapshot.statline.actions], ['Move', snapshot.statline.move]] as const).map(([label, value]) => value !== '' ? <div key={label}><dt>{label}</dt><dd>{value}</dd></div> : null)}</dl>
          <PreviewList title="Perks" values={snapshot.perks} />
          <PreviewList title="Tactics" values={snapshot.tactics} />
        </div>
        {hasMoves && <div className={styles.previewMoves}>
          {!!snapshot.attacks?.length && <section className={styles.previewSection}><h3>Attacks</h3>{snapshot.attacks.map((attack, index) => <div className={styles.previewMove} key={index}><h4>{attack.name}</h4><p className={styles.previewMoveFacts}><strong>{attack.harm}</strong> Harm{attack.range && ` · ${attack.range}`}</p>{attack.notes && <p>{attack.notes}</p>}</div>)}</section>}
          {!!snapshot.abilities?.length && <section className={styles.previewSection}><h3>Abilities</h3>{snapshot.abilities.map((ability, index) => <div className={styles.previewMove} key={index}><h4>{ability.name}{ability.cooldown && <span className={styles.previewCooldown}>{ability.cooldown}</span>}</h4><p>{ability.text}</p></div>)}</section>}
        </div>}
      </div>
      {hasDetails && <details className={styles.previewDetails} key={snapshot.name}>
        <summary>Lore & notes</summary>
        {snapshot.backgroundBehavior && <section className={styles.previewSection}><h3>Background & behavior</h3><p>{snapshot.backgroundBehavior}</p></section>}
        {hasLore && <section className={styles.previewSection}><h3>Lore check</h3>{(lore.skill || lore.tn !== undefined) && <p>{[lore.skill, lore.tn !== undefined && `TN ${lore.tn}`].filter(Boolean).join(' · ')}</p>}<div className={styles.loreGroups}><PreviewList title="Villagers" values={lore.villagers} /><PreviewList title="Priests" values={lore.priests} /><PreviewList title="Scholars" values={lore.scholars} /><PreviewList title="Soldiers" values={lore.soldiers} /></div></section>}
        <PreviewList title="Where found" values={snapshot.whereFound} />
        <PreviewList title="Hooks" values={snapshot.hooks} />
        <PreviewList title="Tags" values={snapshot.statline.tags} />
        {snapshot.notes?.public && <section className={styles.previewSection}><h3>Notes</h3><p>{snapshot.notes.public}</p></section>}
        {snapshot.notes?.gm && <section className={styles.previewSection}><h3>Storyweaver notes</h3><p>{snapshot.notes.gm}</p></section>}
      </details>}
    </article>
  </Modal>;
}
