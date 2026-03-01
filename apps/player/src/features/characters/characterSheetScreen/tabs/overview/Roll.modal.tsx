import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Modal, Input, SelectField } from "@tapestry/ui";
import { createRoll, type CreateRollData } from "@tapestry/api-client";
import { useMe } from "@/lib/auth-hooks";
import { RollResultCard } from "@/components/rollResultCard/RollResultCard.component";
import styles from "./Roll.modal.module.scss";
import { api } from "@/lib/api";
import { ASPECT_BLOCKS, getAspectValue, type AspectGroup, type AspectKey } from "../../../aspects/aspectutils";

type Props = {
  sheet: any;
  initialAspect: { group: AspectGroup; key: AspectKey };
  rollType?: string;
  onClose: () => void;
};

function titleCaseFromId(id: string) {
  const raw = id.includes(":") ? id.split(":").pop()! : id;
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

function normalizeSkills(skills: any): Record<string, number> {
  if (!skills) return {};
  if (typeof skills === "object" && !Array.isArray(skills)) return skills as Record<string, number>;
  if (Array.isArray(skills)) {
    const out: Record<string, number> = {};
    for (const entry of skills) {
      if (Array.isArray(entry) && entry.length >= 2) out[String(entry[0])] = Number(entry[1]);
    }
    return out;
  }
  return {};
}

export function RollModal({ sheet, initialAspect, rollType = "approach", onClose }: Props) {
  const { data: me } = useMe();

  const [rollResult, setRollResult] = useState<any>(null);

  const aspectOptions = useMemo(() => {
    const opts: Array<{ value: string; label: string; group: AspectGroup; key: AspectKey; blockTitle: string }> = [];
    for (const block of ASPECT_BLOCKS) {
      for (const k of block.keys) {
        opts.push({
          value: `${block.group}.${k.key}`,
          label: `${k.label} (${block.title})`,
          group: block.group,
          key: k.key,
          blockTitle: block.title,
        });
      }
    }
    return opts;
  }, []);

  const skillsRecord = useMemo(() => normalizeSkills(sheet?.sheet?.skills), [sheet?._id, sheet?.sheet?.skills]);

  const skillOptions = useMemo(() => {
    return Object.entries(skillsRecord)
      .filter(([, v]) => typeof v === "number" && !Number.isNaN(v))
      .map(([id, rank]) => ({ id, label: titleCaseFromId(id), rank }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [skillsRecord]);

  const initialAspectValue = `${initialAspect.group}.${initialAspect.key}`;
  const [aspectValueKey, setAspectValueKey] = useState(initialAspectValue);

  const [skill1, setSkill1] = useState<string>("");
  const [skill2, setSkill2] = useState<string>("");
  const [useSecondSkill, setUseSecondSkill] = useState(false);

  const [modifier, setModifier] = useState<number>(0);
  const [context, setContext] = useState<string>("");

  // Roll configuration
  const [diceCount, setDiceCount] = useState<number>(3);
  const [edge, setEdge] = useState(false);
  const [burden, setBurden] = useState(false);

  const selectedAspect = aspectOptions.find((o) => o.value === aspectValueKey) ?? aspectOptions[0];
  const aspectVal = selectedAspect ? getAspectValue(sheet, selectedAspect.group, selectedAspect.key) : 0;

  const skill1Rank = skill1 ? (skillsRecord[skill1] ?? 0) : 0;
  const skill2Rank = useSecondSkill && skill2 ? (skillsRecord[skill2] ?? 0) : 0;

  const total = aspectVal + skill1Rank + skill2Rank + (modifier ?? 0);

  // Build operations array for the roll
  const operations = useMemo(() => {
    const ops: Array<{ operator: "+" | "-" | "*" | "/"; value: number }> = [];

    // Add aspect value
    if (aspectVal !== 0) {
      ops.push({ operator: aspectVal >= 0 ? "+" : "-", value: Math.abs(aspectVal) });
    }

    // Add skill 1
    if (skill1Rank !== 0) {
      ops.push({ operator: skill1Rank >= 0 ? "+" : "-", value: Math.abs(skill1Rank) });
    }

    // Add skill 2
    if (skill2Rank !== 0) {
      ops.push({ operator: skill2Rank >= 0 ? "+" : "-", value: Math.abs(skill2Rank) });
    }

    // Add modifier
    if (modifier !== 0) {
      ops.push({ operator: modifier >= 0 ? "+" : "-", value: Math.abs(modifier) });
    }

    return ops;
  }, [aspectVal, skill1Rank, skill2Rank, modifier]);

  // Roll mutation
  const rollMutation = useMutation({
    mutationFn: async () => {
      if (!me?._id) throw new Error("No player ID available");

      const rollData: CreateRollData = {
        characterId: sheet._id,
        playerId: me._id,
        campaignId: sheet.campaign ?? null,
        diceCount,
        faces: 6,
        edge,
        burden,
        operations,
        rollType,
        context: rollContext,
        aspectUsed: aspectValueKey,
      };

      return createRoll(api, rollData);
    },
    onSuccess: (result) => {
      console.log("Roll result:", result);
      if (result.payload) {
        setRollResult({ ...result.payload, context: rollContext });
      }
    },
    onError: (error) => {
      console.error("Roll failed:", error);
    },
  });

  const handleRoll = () => {
    rollMutation.mutate();
  };

  const handleReset = () => {
    setRollResult(null);
    rollMutation.reset();
  };

  const modalTitle = rollType.charAt(0).toUpperCase() + rollType.slice(1);

  const labelParts: string[] = [];
  if (selectedAspect) labelParts.push(selectedAspect.label);
  if (skill1) labelParts.push(`${titleCaseFromId(skill1)} (${skill1Rank >= 0 ? "+" : ""}${skill1Rank})`);
  if (useSecondSkill && skill2)
    labelParts.push(`${titleCaseFromId(skill2)} (${skill2Rank >= 0 ? "+" : ""}${skill2Rank})`);
  if (modifier) labelParts.push(`Mod (${modifier >= 0 ? "+" : ""}${modifier})`);

  const rollContext = context.trim() || labelParts.join(" + ");

  const canRoll = !rollMutation.isPending && me?._id;

  const footer = rollResult ? (
    <>
      <Button tone="purple" variant="outline" onClick={handleReset}>
        Roll Again
      </Button>
      <Button tone="gold" onClick={onClose}>
        Done
      </Button>
    </>
  ) : (
    <>
      <Button tone="purple" variant="outline" onClick={onClose} disabled={rollMutation.isPending}>
        Close
      </Button>
      <Button tone="gold" onClick={handleRoll} disabled={!canRoll}>
        {rollMutation.isPending ? "Rolling..." : "Roll"}
      </Button>
    </>
  );

  return (
    <Modal
      open={true}
      title={rollResult ? `${modalTitle} Result` : modalTitle}
      onCancel={onClose}
      footer={footer}
      width={460}
      centered
    >
      <div className={styles.modalBody}>
        {rollResult ? (
          <RollResultCard result={rollResult} />
        ) : (
          <>
            <div className={styles.formGrid}>
              <SelectField
                label="Aspect"
                hint={`Value: ${aspectVal >= 0 ? `+${aspectVal}` : aspectVal}`}
                value={aspectValueKey}
                onChange={(e) => setAspectValueKey(e.target.value)}
              >
                {aspectOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Skill"
                value={skill1}
                onChange={(e) => setSkill1(e.target.value)}
                disabled={!skillOptions.length}
              >
                <option value="">{skillOptions.length ? "None" : "No skills yet"}</option>
                {skillOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.rank >= 0 ? "+" : ""}={s.rank})
                  </option>
                ))}
              </SelectField>

              <div className={styles.fieldInline}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={useSecondSkill}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setUseSecondSkill(checked);
                      if (!checked) setSkill2("");
                    }}
                    disabled={!skillOptions.length}
                  />
                  Add second skill
                </label>

                {useSecondSkill && (
                  <SelectField value={skill2} onChange={(e) => setSkill2(e.target.value)}>
                    <option value="">None</option>
                    {skillOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.rank >= 0 ? "+" : ""}
                        {s.rank})
                      </option>
                    ))}
                  </SelectField>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Modifier</label>
                <Input type="number" value={modifier} onChange={(e) => setModifier(Number(e.target.value))} />
                <div className={styles.fieldHint}>Situational +/−</div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Context</label>
                <Input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder={labelParts.join(" + ") || "Describe this roll..."}
                />
                <div className={styles.fieldHint}>What are you doing? (optional)</div>
              </div>
            </div>

            <div className={styles.diceConfig}>
              <div className={styles.diceRow}>
                <label className={styles.fieldLabel}>Dice</label>
                <div className={styles.diceControls}>
                  <button
                    className={styles.diceBtn}
                    type="button"
                    onClick={() => setDiceCount((c) => Math.max(1, c - 1))}
                    disabled={diceCount <= 1}
                  >
                    −
                  </button>
                  <span className={styles.diceDisplay}>{diceCount}d6</span>
                  <button className={styles.diceBtn} type="button" onClick={() => setDiceCount((c) => c + 1)}>
                    +
                  </button>
                </div>
              </div>

              <div className={styles.mechanicsRow}>
                <button
                  className={`${styles.mechanicBtn} ${edge ? styles.active : ""}`}
                  type="button"
                  onClick={() => {
                    setEdge(!edge);
                    if (!edge) setBurden(false);
                  }}
                >
                  Edge {edge && "✓"}
                </button>
                <button
                  className={`${styles.mechanicBtn} ${burden ? styles.active : ""}`}
                  type="button"
                  onClick={() => {
                    setBurden(!burden);
                    if (!burden) setEdge(false);
                  }}
                >
                  Burden {burden && "✓"}
                </button>
              </div>

              {edge && <div className={styles.mechanicHint}>Roll 4d6, keep best 3</div>}
              {burden && <div className={styles.mechanicHint}>Roll 4d6, keep worst 3</div>}
            </div>

            <div className={styles.preview}>
              <div className={styles.previewLabel}>Preview</div>
              <div className={styles.previewText}>{labelParts.join(" + ")}</div>
              <div className={styles.previewValue}>{total >= 0 ? `+${total}` : total}</div>
            </div>

            {rollMutation.isError && (
              <div className={styles.error} role="alert">
                Failed to submit roll. Please try again.
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
