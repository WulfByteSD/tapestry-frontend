"use client";

import { SheetModal } from '../../SheetModal.component';

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@tapestry/ui";
import { applyHarm } from "@tapestry/api-client";
import { api } from "@/lib/api";
import { RollResultCard } from "@/components/rollResultCard/RollResultCard.component";
import styles from "./Resource.modal.module.scss";
import { getProtection } from '../../CharacterSheet.helpers';

type Props = {
  sheet: any;
  onClose: () => void;
};

export function HarmModal({ sheet, onClose }: Props) {
  const queryClient = useQueryClient();
  const hp = sheet?.sheet?.resources?.hp ?? { current: 0, max: 0, temp: 0 };
  const [incomingHarm, setIncomingHarm] = useState<number>(1);
  const [useTempFirst, setUseTempFirst] = useState(true);
  const [result, setResult] = useState<any>(null);

  const totalProtection = getProtection(sheet);

  const mutation = useMutation({
    mutationFn: async () => {
      return applyHarm(api, sheet._id, {
        incomingHarm: Math.max(0, Number(incomingHarm) || 0),
        useTempFirst,
      });
    },
    onSuccess: (res) => {
      setResult(res.payload);
      queryClient.invalidateQueries({ queryKey: ["character", sheet._id] });
    },
    onError: (err) => {
      console.error("Apply harm failed:", err);
    },
  });

  const footer = result ? (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setResult(null);
          mutation.reset();
        }}
      >
        Apply More
      </Button>
      <Button onClick={onClose}>Done</Button>
    </>
  ) : (
    <>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !Number.isFinite(Number(incomingHarm))}>
        {mutation.isPending ? "Applying..." : "Apply Harm"}
      </Button>
    </>
  );

  return (
    <SheetModal open onCancel={onClose} title="Take Damage" footer={footer}>
      {result ? (
        <div className={styles.stack}>
          <div className={styles.previewBox}>
            <div className={styles.previewTitle}>Damage Applied</div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Incoming Harm:</span>
              <span className={styles.previewValue}>{result.incomingHarm}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Protection:</span>
              <span className={styles.previewValue}>{result.protection}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Applied Harm:</span>
              <span className={styles.previewValue}>{result.appliedHarm}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>HP:</span>
              <span className={styles.previewValue}>{result.hpBefore} → {result.hpAfter}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Temp HP:</span>
              <span className={styles.previewValue}>{result.tempBefore} → {result.tempAfter}</span>
            </div>
          </div>

          <RollResultCard
            result={{
              rollId: `harm-${sheet._id}`,
              breakdown: `${result.incomingHarm} harm - ${result.protection} protection = ${result.appliedHarm}`,
              total: result.hpAfter,
              allRolls: [],
              keptRolls: [],
              expression: "harm",
              context: "Damage resolution",
            }}
          />
        </div>
      ) : (
        <div className={styles.stack}>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Current HP</div>
              <div className={styles.statValue}>
                {hp.current}/{hp.max}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Temp HP</div>
              <div className={styles.statValue}>{hp.temp ?? 0}</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Protection</div>
              <div className={styles.statValue}>{totalProtection}</div>
            </div>
          </div>

          <Input
            label="Incoming Harm"
            type="number"
            min={0}
            value={incomingHarm}
            onChange={(e) => setIncomingHarm(Number(e.target.value))}
          />

          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={useTempFirst} onChange={(e) => setUseTempFirst(e.target.checked)} />
            <span>Use Temp HP first</span>
          </label>

          <div className={styles.previewBox}>
            <div className={styles.previewTitle}>Preview</div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Incoming Harm:</span>
              <span className={styles.previewValue}>{Math.max(0, Number(incomingHarm) || 0)}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Protection:</span>
              <span className={styles.previewValue}>{totalProtection}</span>
            </div>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>Estimated Applied Harm:</span>
              <span className={styles.previewValue}>{Math.max(0, (Number(incomingHarm) || 0) - totalProtection)}</span>
            </div>
          </div>

          {mutation.isError ? (
            <div className={styles.errorText}>Failed to apply harm. Check the endpoint path and payload shape.</div>
          ) : null}
        </div>
      )}
    </SheetModal>
  );
}
