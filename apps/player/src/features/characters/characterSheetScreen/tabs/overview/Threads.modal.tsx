import { useState } from 'react';
import { Button, Input, SelectField } from '@tapestry/ui';
import { SheetModal } from '../../SheetModal.component';
import { useUpdateCharacterSheetMutation } from '../../characterSheet.mutations';
import { getThreadsPreview } from './ResourceModal.helpers';
import type { ResourceModalProps, ThreadsMode } from './ResourceModal.types';
import styles from './Resource.modal.module.scss';

export function ThreadsModal({ sheet, onClose }: ResourceModalProps) {
  const update = useUpdateCharacterSheetMutation(sheet._id);
  const threads = sheet.sheet.resources?.threads ?? { current: 0, max: 0 };
  const current = Number(threads.current ?? 0);
  const max = Number(threads.max ?? 5);
  const [mode, setMode] = useState<ThreadsMode>('spend');
  const [amount, setAmount] = useState(1);
  const nextCurrent = getThreadsPreview(current, max, mode, amount);
  const quickAdjust = (nextMode: ThreadsMode, nextAmount: number) => { setMode(nextMode); setAmount(nextAmount); };

  return (
    <SheetModal open title="Threads" subtitle="Spend or gain the Threads that turn the story." onCancel={onClose} width={480} footer={<>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button tone="gold" disabled={update.isPending} onClick={() => update.mutate({ 'sheet.resources.threads.current': nextCurrent }, { onSuccess: onClose })}>{update.isPending ? 'Applying…' : 'Apply Threads'}</Button>
    </>}>
      <div className={styles.body}>
        <div className={styles.summaryRow}>
          <div className={styles.summary}><span className={styles.k}>Current Threads</span><strong className={styles.v}>{current}/{max}</strong></div>
          <div className={styles.summary}><span className={styles.k}>After adjustment</span><strong className={styles.v}>{nextCurrent}/{max}</strong></div>
        </div>
        <div className={styles.twoCol}>
          <SelectField label="Action" value={mode} onChange={(event) => setMode(event.target.value as ThreadsMode)}><option value="spend">Spend</option><option value="gain">Gain</option><option value="set">Set current Threads</option></SelectField>
          <Input label="Amount" type="number" min={0} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
        </div>
        <div className={styles.quickRow}>
          <button className={styles.quickBtn} type="button" onClick={() => quickAdjust('spend', 1)}>Nudge −1</button>
          <button className={styles.quickBtn} type="button" onClick={() => quickAdjust('spend', 2)}>Big Swing −2</button>
          <button className={styles.quickBtn} type="button" onClick={() => quickAdjust('spend', 5)}>Miracle −5</button>
          <button className={styles.quickBtn} type="button" onClick={() => quickAdjust('gain', 1)}>Gain +1</button>
        </div>
        {update.isError && <p role="alert" className={styles.errorText}>Threads could not be updated. Try again.</p>}
      </div>
    </SheetModal>
  );
}
