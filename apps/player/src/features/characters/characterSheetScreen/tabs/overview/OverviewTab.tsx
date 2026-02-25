import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "@tapestry/ui";
import styles from "./OverviewTab.module.scss";
import { RollModal } from "./Roll.modal";  
import { useUpdateCharacterSheetMutation } from "../../characterSheet.mutations";
import { ASPECT_BLOCKS, aspectPath, clamp, getAspectValue } from "@/features/characters/aspects/aspectutils";
import { AspectStepperRow } from "@/features/characters/aspects/AspectStepperRow";
import { CharacterSheet } from "@tapestry/types";

type Props = {
  sheet: CharacterSheet;
  mode: "build" | "play";
};

const CREATION_MIN = -2;
const CREATION_MAX = 2;

export function OverviewTab({ sheet, mode }: Props) {
  const isBuild = mode === "build";
  const update = useUpdateCharacterSheetMutation<CharacterSheet>(sheet._id);

  const [rollPrompt, setRollPrompt] = useState<null | { label: string; value?: number }>(null);

  return (
    <>
      <div className={styles.contentGrid}>
        <Card inlay className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.cardTitle}>Aspects</div>
          </CardHeader>

          <CardBody className={styles.aspectsGrid}>
            {ASPECT_BLOCKS.map((block) => (
              <div key={block.title} className={styles.aspectTile}>
                <div className={styles.aspectTileTitle}>{block.title}</div>

                <div className={styles.aspectRows}>
                  {block.keys.map(({ label, key }) => {
                    const value = getAspectValue(sheet, block.group, key);

                    if (isBuild) {
                      const min = CREATION_MIN;
                      const max = CREATION_MAX;

                      return (
                        <AspectStepperRow
                          key={key}
                          label={label}
                          value={value}
                          min={min}
                          max={max}
                          canDec={true}
                          canInc={true}
                          onDec={() => {
                            const next = clamp(value - 1, min, max);
                            if (next === value) return;
                            update.mutate({ [aspectPath(block.group, key)]: next });
                          }}
                          onInc={() => {
                            const next = clamp(value + 1, min, max);
                            if (next === value) return;
                            update.mutate({ [aspectPath(block.group, key)]: next });
                          }}
                        />
                      );
                    }

                    return (
                      <button
                        key={key}
                        type="button"
                        className={styles.aspectRow}
                        onClick={() => setRollPrompt({ label: `${label} (${block.title})`, value })}
                      >
                        <span className={styles.aspectKey}>{label}</span>
                        <span className={styles.aspectValue}>{value}</span>
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
        <RollModal
          label={rollPrompt.label}
          value={rollPrompt.value}
          onClose={() => setRollPrompt(null)}
        />
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
