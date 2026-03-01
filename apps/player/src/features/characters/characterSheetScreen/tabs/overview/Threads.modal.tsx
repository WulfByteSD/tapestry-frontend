import { useMemo, useState } from "react";
import { Button, Modal } from "@tapestry/ui";
import { useUpdateCharacterSheetMutation } from "../../../characterSheetScreen/characterSheet.mutations";
import styles from "./Resource.modal.module.scss";

type Props = {
  sheet: any;
  onClose: () => void;
};

type Mode = "spend" | "gain" | "set";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function ThreadsModal({ sheet, onClose }: Props) {
  const update = useUpdateCharacterSheetMutation(sheet._id);

  const threads = sheet?.sheet?.resources?.threads ?? { current: 0, max: 0 };
  const current = Number(threads.current ?? 0);
  const max = Number(threads.max ?? 0);

  const [mode, setMode] = useState<Mode>("spend");
  const [amount, setAmount] = useState<number>(1);
  const [reason, setReason] = useState<string>("");

  const nextCurrent = useMemo(() => {
    const amt = Math.max(0, Number(amount) || 0);

    if (mode === "spend") return clamp(current - amt, 0, max);
    if (mode === "gain") return clamp(current + amt, 0, max);
    return clamp(amt, 0, max);
  }, [mode, amount, current, max]);

  const footer = (
    <>
      <Button tone="purple" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        tone="gold"
        onClick={() => {
          update.mutate({
            "sheet.resources.threads.current": nextCurrent,
            // later: store reason in an audit log if you want
          });
          onClose();
        }}
      >
        Apply
      </Button>
    </>
  );

  return (
    <Modal open={true} title="Threads" onCancel={onClose} footer={footer} width={420} centered>
      <div className={styles.body}>
        <div className={styles.summaryRow}>
          <div className={styles.summary}>
            <div className={styles.k}>Current</div>
            <div className={styles.v}>
              {current}/{max}
            </div>
          </div>
          <div className={styles.summary}>
            <div className={styles.k}>After</div>
            <div className={styles.v}>
              {nextCurrent}/{max}
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Action</label>
          <select className={styles.control} value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="spend">Spend</option>
            <option value="gain">Gain</option>
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

        <div className={styles.quickRow}>
          <button
            className={styles.quickBtn}
            type="button"
            onClick={() => {
              setMode("spend");
              setAmount(1);
            }}
          >
            Nudge (−1)
          </button>
          <button
            className={styles.quickBtn}
            type="button"
            onClick={() => {
              setMode("spend");
              setAmount(2);
            }}
          >
            Big Swing (−2)
          </button>
          <button
            className={styles.quickBtn}
            type="button"
            onClick={() => {
              setMode("spend");
              setAmount(5);
            }}
          >
            Miracle (−5)
          </button>
          <button
            className={styles.quickBtn}
            type="button"
            onClick={() => {
              setMode("gain");
              setAmount(1);
            }}
          >
            Gain (+1)
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Why? (optional)</label>
          <textarea
            className={styles.textarea}
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Miss, bargain, nudge for +2, etc."
          />
        </div>

        <div className={styles.hint}>MVP: reason is not stored yet (we can add an audit/event log later).</div>
      </div>
    </Modal>
  );
}
