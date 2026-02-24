import { useState } from "react";
import { Card, CardBody, CardHeader } from "@tapestry/ui";
import styles from "./OverviewTab.module.scss";
import { RollModal } from "./Roll.modal";

const ASPECT_BLOCKS = [
  { title: "Might", keys: ["Strength", "Presence"] },
  { title: "Finesse", keys: ["Agility", "Charm"] },
  { title: "Wit", keys: ["Instinct", "Knowledge"] },
  { title: "Resolve", keys: ["Willpower", "Empathy"] },
] as const;

type Props = {
  sheet: any;
};

export function OverviewTab({ sheet }: Props) {
  const [rollPrompt, setRollPrompt] = useState<null | { label: string; value?: number }>(null);
  return (
    <>
      <div className={styles.contentGrid}>
        <Card inlay className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.cardTitle}>Aspects</div>
            <div className={styles.cardHint}>Tap to roll (still stubbed)</div>
          </CardHeader>
          <CardBody className={styles.aspectsGrid}>
            {ASPECT_BLOCKS.map((block) => (
              <div key={block.title} className={styles.aspectTile}>
                <div className={styles.aspectTileTitle}>{block.title}</div>
                <div className={styles.aspectRows}>
                  {block.keys.map((k) => {
                    const value = readAspect(sheet, block.title, k);
                    return (
                      <button
                        key={k}
                        type="button"
                        className={styles.aspectRow}
                        onClick={() => setRollPrompt({ label: `${k} (${block.title})`, value })}
                      >
                        <span className={styles.aspectKey}>{k}</span>
                        <span className={styles.aspectValue}>{value ?? "—"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card inlay className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.cardTitle}>At a glance</div>
            <div className={styles.cardHint}>We'll make this the "play surface" next</div>
          </CardHeader>
          <CardBody className={styles.glance}>
            <div className={styles.glanceRow}>
              <span className={styles.glanceLabel}>Skills</span>
              <span className={styles.glanceValue}>{sheet.sheet.skills ? "Loaded" : "—"}</span>
            </div>
            <div className={styles.glanceRow}>
              <span className={styles.glanceLabel}>Conditions</span>
              <span className={styles.glanceValue}>{sheet.sheet.conditions?.length ?? 0}</span>
            </div>
            <div className={styles.glanceRow}>
              <span className={styles.glanceLabel}>Inventory</span>
              <span className={styles.glanceValue}>{sheet.sheet.inventory?.length ?? 0}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {rollPrompt && (
        <RollModal label={rollPrompt.label} value={rollPrompt.value} onClose={() => setRollPrompt(null)} />
      )}
    </>
  );
}

function readAspect(sheet: any, aspectGroup: string, aspectKey: string): number | undefined {
  const g = aspectGroup.toLowerCase(); // might/finesse/wit/resolve
  const k = aspectKey.toLowerCase(); // strength/presence/etc
  const v = sheet?.sheet?.aspects?.[g]?.[k];
  return typeof v === "number" ? v : undefined;
}
