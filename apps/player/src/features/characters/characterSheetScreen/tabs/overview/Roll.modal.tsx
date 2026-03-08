import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Modal, Input, SelectField } from "@tapestry/ui";
import { createRoll, getSkillsForSetting, type CreateRollData } from "@tapestry/api-client";
import { useMe } from "@/lib/auth-hooks";
import { RollResultCard } from "@/components/rollResultCard/RollResultCard.component";
import styles from "./Roll.modal.module.scss";
import { api } from "@/lib/api";
import { ASPECT_BLOCKS, getAspectValue, type AspectGroup, type AspectKey } from "../../../aspects/aspectutils";
import { buildSkillOptions } from "../skills/skillDisplay.helpers";

type Props = {
  sheet: any;
  initialAspect: { group: AspectGroup; key: AspectKey };
  rollType?: string;
  onClose: () => void;
};

function normalizeSkills(skills: any): Record<string, number> {
  if (!skills) return {};
  if (typeof skills === "object" && !Array.isArray(skills)) {
    return skills as Record<string, number>;
  }
  if (Array.isArray(skills)) {
    const out: Record<string, number> = {};
    for (const entry of skills) {
      if (Array.isArray(entry) && entry.length >= 2) {
        out[String(entry[0])] = Number(entry[1]);
      }
    }
    return out;
  }
  return {};
}

function titleCaseLabel(value?: string) {
  if (!value) return "";
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export function RollModal({ sheet, initialAspect, rollType = "approach", onClose }: Props) {
  const { data: me } = useMe();
  const [rollResult, setRollResult] = useState<any>(null);

  const aspectOptions = useMemo(() => {
    const opts: Array<{
      value: string;
      label: string;
      group: AspectGroup;
      key: AspectKey;
      blockTitle: string;
    }> = [];

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

  const skillsQuery = useQuery({
    queryKey: ["content:skills", sheet?.settingKey],
    enabled: !!sheet?.settingKey,
    queryFn: () => getSkillsForSetting(api, sheet.settingKey),
  });

  const skillDefinitions = skillsQuery.data?.payload ?? [];

  const skillOptions = useMemo(() => {
    return buildSkillOptions(skillsRecord, skillDefinitions);
  }, [skillsRecord, skillDefinitions]);

  const skillOptionById = useMemo(() => {
    return new Map(skillOptions.map((skill) => [skill.id, skill]));
  }, [skillOptions]);

  const initialAspectValue = `${initialAspect.group}.${initialAspect.key}`;
  const [aspectValueKey, setAspectValueKey] = useState(initialAspectValue);
  const [skill1, setSkill1] = useState("");
  const [skill2, setSkill2] = useState("");
  const [useSecondSkill, setUseSecondSkill] = useState(false);
  const [modifier, setModifier] = useState(0);
  const [context, setContext] = useState("");
  const [diceCount, setDiceCount] = useState(3);
  const [edge, setEdge] = useState(false);
  const [burden, setBurden] = useState(false);

  const selectedAspect = aspectOptions.find((o) => o.value === aspectValueKey) ?? aspectOptions[0];

  const aspectVal = selectedAspect ? getAspectValue(sheet, selectedAspect.group, selectedAspect.key) : 0;

  const skill1Rank = skill1 ? (skillsRecord[skill1] ?? 0) : 0;
  const skill2Rank = useSecondSkill && skill2 ? (skillsRecord[skill2] ?? 0) : 0;

  const skill1Option = skill1 ? skillOptionById.get(skill1) : undefined;
  const skill2Option = useSecondSkill && skill2 ? skillOptionById.get(skill2) : undefined;

  const total = aspectVal + skill1Rank + skill2Rank + (modifier ?? 0);

  const operations = useMemo(() => {
    const ops: Array<{ operator: "+" | "-" | "*" | "/"; value: number }> = [];

    if (aspectVal !== 0) {
      ops.push({ operator: aspectVal >= 0 ? "+" : "-", value: Math.abs(aspectVal) });
    }

    if (skill1Rank !== 0) {
      ops.push({ operator: skill1Rank >= 0 ? "+" : "-", value: Math.abs(skill1Rank) });
    }

    if (skill2Rank !== 0) {
      ops.push({ operator: skill2Rank >= 0 ? "+" : "-", value: Math.abs(skill2Rank) });
    }

    if (modifier !== 0) {
      ops.push({ operator: modifier >= 0 ? "+" : "-", value: Math.abs(modifier) });
    }

    return ops;
  }, [aspectVal, skill1Rank, skill2Rank, modifier]);

  const labelParts: string[] = [];
  if (selectedAspect) labelParts.push(selectedAspect.label);
  if (skill1Option) labelParts.push(`${skill1Option.name} (${skill1Rank >= 0 ? "+" : ""}${skill1Rank})`);
  if (skill2Option) labelParts.push(`${skill2Option.name} (${skill2Rank >= 0 ? "+" : ""}${skill2Rank})`);
  if (modifier) labelParts.push(`Mod (${modifier >= 0 ? "+" : ""}${modifier})`);

  const rollContext = context.trim() || labelParts.join(" + ");

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
      if (result.payload) {
        setRollResult({
          ...result.payload,
          context: rollContext,
        });
      }
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
  const canRoll = !rollMutation.isPending && me?._id;

  const footer = rollResult ? (
    <>
      <Button variant="ghost" onClick={handleReset}>
        Roll Again
      </Button>
      <Button onClick={onClose}>Done</Button>
    </>
  ) : (
    <>
      <Button variant="ghost" onClick={onClose}>
        Close
      </Button>
      <Button onClick={handleRoll} disabled={!canRoll}>
        {rollMutation.isPending ? "Rolling..." : "Roll"}
      </Button>
    </>
  );

  return (
    <Modal open onCancel={onClose} title={modalTitle} footer={footer}>
      {rollResult ? (
        <RollResultCard result={rollResult} />
      ) : (
        <>
          <label className={styles.field}>
            <span>Aspect</span>
            <SelectField value={aspectValueKey} onChange={(e) => setAspectValueKey(e.target.value)}>
              {aspectOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}{" "}
                  {selectedAspect?.value === o.value ? `(${aspectVal >= 0 ? `+${aspectVal}` : aspectVal})` : ""}
                </option>
              ))}
            </SelectField>
          </label>

          <label className={styles.field}>
            <span>Skill</span>
            <SelectField value={skill1} onChange={(e) => setSkill1(e.target.value)} disabled={!skillOptions.length}>
              <option value="">{skillOptions.length ? "None" : "No skills yet"}</option>
              {skillOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rank >= 0 ? "+" : ""}
                  {s.rank}){s.defaultAspect ? ` • ${titleCaseLabel(s.defaultAspect)}` : ""}
                </option>
              ))}
            </SelectField>
          </label>

          <label className={styles.checkboxRow}>
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
            <span>Add second skill</span>
          </label>

          {useSecondSkill ? (
            <label className={styles.field}>
              <span>Second Skill</span>
              <SelectField value={skill2} onChange={(e) => setSkill2(e.target.value)}>
                <option value="">None</option>
                {skillOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rank >= 0 ? "+" : ""}
                    {s.rank}){s.defaultAspect ? ` • ${titleCaseLabel(s.defaultAspect)}` : ""}
                  </option>
                ))}
              </SelectField>
            </label>
          ) : null}

          <label className={styles.field}>
            <span>Modifier</span>
            <Input type="number" value={modifier} onChange={(e) => setModifier(Number(e.target.value))} />
          </label>

          <label className={styles.field}>
            <span>Context</span>
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={labelParts.join(" + ") || "Describe this roll..."}
            />
          </label>

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
    </Modal>
  );
}
