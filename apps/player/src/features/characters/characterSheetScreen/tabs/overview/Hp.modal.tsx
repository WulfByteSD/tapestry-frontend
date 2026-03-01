import { useMemo, useState } from "react";
import { Button, Modal } from "@tapestry/ui";
import { useUpdateCharacterSheetMutation } from "../../../characterSheetScreen/characterSheet.mutations";
import styles from "./Resource.modal.module.scss";

type Props = {
  sheet: any;
  onClose: () => void;
};

type Mode = "damage" | "heal" | "set";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function HpModal({ sheet, onClose }: Props) {
  const update = useUpdateCharacterSheetMutation(sheet._id);

  const hp = sheet?.sheet?.resources?.hp ?? { current: 0, max: 0, temp: 0 };
  const current = Number(hp.current ?? 0);
  const max = Number(hp.max ?? 0);
  const temp = Number(hp.temp ?? 0);

  // If max is 0, prefill something sane so the modal can actually work
  const [maxDraft, setMaxDraft] = useState<number>(max > 0 ? max : Math.max(10, current));
  const [tempDraft, setTempDraft] = useState<number>(temp);

  const [mode, setMode] = useState<Mode>("damage");
  const [amount, setAmount] = useState<number>(1);
  const [useTempFirst, setUseTempFirst] = useState(true);

  const preview = useMemo(() => {
    const effectiveMax = Math.max(0, Number(maxDraft) || 0);
    const startTemp = Math.max(0, Number(tempDraft) || 0);
    const amt = Math.max(0, Number(amount) || 0);

    let nextCurrent = current;
    let nextTemp = startTemp;

    if (effectiveMax === 0) {
      // If max is 0, we can't clamp meaningfully; keep current unchanged in preview.
      // (But since we prefill maxDraft, this usually won’t happen.)
      return { nextCurrent: current, nextTemp };
    }

    if (mode === "damage") {
      if (useTempFirst && nextTemp > 0) {
        const used = Math.min(nextTemp, amt);
        nextTemp -= used;
        const remaining = amt - used;
        nextCurrent = clamp(nextCurrent - remaining, 0, effectiveMax);
      } else {
        nextCurrent = clamp(nextCurrent - amt, 0, effectiveMax);
      }
    }

    if (mode === "heal") {
      nextCurrent = clamp(nextCurrent + amt, 0, effectiveMax);
    }

    if (mode === "set") {
      nextCurrent = clamp(amt, 0, effectiveMax);
    }

    return { nextCurrent, nextTemp };
  }, [mode, amount, useTempFirst, current, maxDraft, tempDraft]);

  const footer = (
    <>
      <Button tone="purple" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        tone="gold"
        onClick={() => {
          const effectiveMax = Math.max(0, Number(maxDraft) || 0);
          const effectiveTemp = Math.max(0, Number(tempDraft) || 0);

          const updates: Record<string, any> = {
            "sheet.resources.hp.max": effectiveMax,
            "sheet.resources.hp.temp": effectiveTemp,
            "sheet.resources.hp.current": preview.nextCurrent,
          };

          update.mutate(updates);
          onClose();
        }}
      >
        Apply
      </Button>
    </>
  );

  return (
    <Modal open={true} title="HP" onCancel={onClose} footer={footer} width={440} centered>
      <div className={styles.body}>
        <div className={styles.summaryRow}>
          <div className={styles.summary}>
            <div className={styles.k}>Current</div>
            <div className={styles.v}>
              {current}/{max > 0 ? max : "—"}
            </div>
          </div>
          <div className={styles.summary}>
            <div className={styles.k}>Temp</div>
            <div className={styles.v}>{temp}</div>
          </div>
        </div>

        <div className={styles.twoCol}>
          <div className={styles.field}>
            <label className={styles.label}>Max HP</label>
            <input
              className={styles.control}
              type="number"
              min={0}
              value={maxDraft}
              onChange={(e) => setMaxDraft(Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Temp HP</label>
            <input
              className={styles.control}
              type="number"
              min={0}
              value={tempDraft}
              onChange={(e) => setTempDraft(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Action</label>
          <select className={styles.control} value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="damage">Take Damage</option>
            <option value="heal">Heal</option>
            <option value="set">Set Current</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Amount</label>
          <input
            className={styles.control}
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        {mode === "damage" && (
          <label className={styles.checkbox}>
            <input type="checkbox" checked={useTempFirst} onChange={(e) => setUseTempFirst(e.target.checked)} />
            Use Temp HP first
          </label>
        )}

        <div className={styles.preview}>
          <div className={styles.k}>After</div>
          <div className={styles.v}>
            HP {preview.nextCurrent}/{Math.max(0, Number(maxDraft) || 0) || "—"} • Temp {preview.nextTemp}
          </div>
        </div>

        <div className={styles.quickRow}>
          <button className={styles.quickBtn} type="button" onClick={() => setAmount(1)}>
            1
          </button>
          <button className={styles.quickBtn} type="button" onClick={() => setAmount(2)}>
            2
          </button>
          <button className={styles.quickBtn} type="button" onClick={() => setAmount(5)}>
            5
          </button>
          <button className={styles.quickBtn} type="button" onClick={() => setAmount(10)}>
            10
          </button>
        </div>
      </div>
    </Modal>
  );
}
