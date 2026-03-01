import { useMemo, useState } from "react";
import { Button, Modal } from "@tapestry/ui";
import styles from "./Roll.modal.module.scss";
import {
  ASPECT_BLOCKS,
  getAspectValue,
  type AspectGroup,
  type AspectKey,
} from "../../../aspects/aspectutils";

type Props = {
  sheet: any;
  initialAspect: { group: AspectGroup; key: AspectKey };
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

export function RollModal({ sheet, initialAspect, onClose }: Props) {
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

  const selectedAspect = aspectOptions.find((o) => o.value === aspectValueKey) ?? aspectOptions[0];
  const aspectVal = selectedAspect ? getAspectValue(sheet, selectedAspect.group, selectedAspect.key) : 0;

  const skill1Rank = skill1 ? (skillsRecord[skill1] ?? 0) : 0;
  const skill2Rank = useSecondSkill && skill2 ? (skillsRecord[skill2] ?? 0) : 0;

  const total = aspectVal + skill1Rank + skill2Rank + (modifier ?? 0);

  const labelParts: string[] = [];
  if (selectedAspect) labelParts.push(selectedAspect.label);
  if (skill1) labelParts.push(`${titleCaseFromId(skill1)} (${skill1Rank >= 0 ? "+" : ""}${skill1Rank})`);
  if (useSecondSkill && skill2) labelParts.push(`${titleCaseFromId(skill2)} (${skill2Rank >= 0 ? "+" : ""}${skill2Rank})`);
  if (modifier) labelParts.push(`Mod (${modifier >= 0 ? "+" : ""}${modifier})`);

  const footer = (
    <>
      <Button tone="purple" variant="outline" onClick={onClose}>
        Close
      </Button>
      <Button tone="gold" onClick={onClose}>
        Roll (stub)
      </Button>
    </>
  );

  return (
    <Modal open={true} title="Approach" onCancel={onClose} footer={footer} width={460} centered>
      <div className={styles.modalBody}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Aspect</label>
            <select className={styles.select} value={aspectValueKey} onChange={(e) => setAspectValueKey(e.target.value)}>
              {aspectOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div className={styles.fieldHint}>
              Value: <b>{aspectVal >= 0 ? `+${aspectVal}` : aspectVal}</b>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Skill</label>
            <select className={styles.select} value={skill1} onChange={(e) => setSkill1(e.target.value)} disabled={!skillOptions.length}>
              <option value="">{skillOptions.length ? "None" : "No skills yet"}</option>
              {skillOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.rank >= 0 ? "+" : ""}{s.rank})
                </option>
              ))}
            </select>
          </div>

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
              <select className={styles.select} value={skill2} onChange={(e) => setSkill2(e.target.value)}>
                <option value="">None</option>
                {skillOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.rank >= 0 ? "+" : ""}{s.rank})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Modifier</label>
            <input className={styles.number} type="number" value={modifier} onChange={(e) => setModifier(Number(e.target.value))} />
            <div className={styles.fieldHint}>Situational +/−</div>
          </div>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewLabel}>Preview</div>
          <div className={styles.previewText}>{labelParts.join(" + ")}</div>
          <div className={styles.previewValue}>{total >= 0 ? `+${total}` : total}</div>
        </div>

        <div className={styles.muted}>
          Next: this modal will actually roll dice + handle Thread/Resolve spends.
        </div>
      </div>
    </Modal>
  );
}