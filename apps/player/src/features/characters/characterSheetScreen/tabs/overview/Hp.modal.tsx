import { useState } from 'react';
import { Button, Input, SelectField } from '@tapestry/ui';
import { SheetModal } from '../../SheetModal.component';
import { useUpdateCharacterSheetMutation } from '../../characterSheet.mutations';
import { getHpPreview, nonnegative } from './ResourceModal.helpers';
import type { ResourceModalProps, HpMode } from './ResourceModal.types';
import styles from './Resource.modal.module.scss';

export function HpModal({ sheet, onClose }: ResourceModalProps) {
  const update = useUpdateCharacterSheetMutation(sheet._id);
  const hp = sheet.sheet.resources?.hp ?? { current: 0, max: 0, temp: 0 };
  const current = Number(hp.current ?? 0);
  const max = Number(hp.max ?? 0);
  const temp = Number(hp.temp ?? 0);
  // Preserve the existing fallback for sheets whose maximum has not been set.
  const maxDraft = max > 0 ? max : Math.max(10, current);
  const [tempDraft, setTempDraft] = useState(temp);
  const [mode, setMode] = useState<HpMode>('heal');
  const [amount, setAmount] = useState(1);
  const preview = getHpPreview(current, maxDraft, tempDraft, mode, amount);
  const apply = () => update.mutate({
    'sheet.resources.hp.max': nonnegative(maxDraft),
    'sheet.resources.hp.temp': nonnegative(tempDraft),
    'sheet.resources.hp.current': preview.nextCurrent,
  }, { onSuccess: onClose });

  return (
    <SheetModal open title="HP" subtitle="Heal or adjust your current and temporary HP." onCancel={onClose} width={480} footer={<>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button tone="gold" onClick={apply} disabled={update.isPending}>{update.isPending ? 'Applying…' : 'Apply HP'}</Button>
    </>}>
      <div className={styles.body}>
        <div className={styles.summaryRow}>
          <div className={styles.summary}><span className={styles.k}>Current HP</span><strong className={styles.v}>{current}/{max > 0 ? max : '—'}</strong><span className={styles.hint}>Temp {temp}</span></div>
          <div className={styles.summary}><span className={styles.k}>After adjustment</span><strong className={styles.v}>{preview.nextCurrent}/{nonnegative(maxDraft) || '—'}</strong><span className={styles.hint}>Temp {preview.nextTemp}</span></div>
        </div>
        <div className={styles.twoCol}>
          <SelectField label="Action" value={mode} onChange={(event) => setMode(event.target.value as HpMode)}><option value="heal">Heal</option><option value="set">Set current HP</option></SelectField>
          <Input label={mode === 'heal' ? 'Healing amount' : 'Current HP'} type="number" min={0} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        </div>
        <div className={styles.quickRow} aria-label="Quick amounts">{[1, 2, 5, 10].map((value) => <button key={value} className={styles.quickBtn} type="button" onClick={() => setAmount(value)} aria-label={`Set amount to ${value}`}>{value}</button>)}</div>
        <Input label="Temporary HP" type="number" min={0} value={tempDraft} onChange={(event) => setTempDraft(Number(event.target.value))} />
        {update.isError && <p role="alert" className={styles.errorText}>HP could not be updated. Try again.</p>}
      </div>
    </SheetModal>
  );
}
