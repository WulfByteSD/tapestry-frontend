"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Modal, Input, SelectField, TextField } from "@tapestry/ui";
import { createRoll, type CreateRollData } from "@tapestry/api-client";
import { useMe } from "@/lib/auth-hooks";
import { api } from "@/lib/api";
import { RollResultCard } from "@/components/rollResultCard/RollResultCard.component";
import styles from "./Roll.modal.module.scss";
import { ASPECT_BLOCKS, getAspectValue, type AspectGroup, type AspectKey } from "../../../aspects/aspectutils";
import {
  getDefaultAttackAspect,
  getEquippedWeapons,
  normalizeSkills,
  parseAspectPath,
  titleCaseFromId,
} from "./attack.functions";

type Props = {
  sheet: any;
  onClose: () => void;
};

export function AttackModal({ sheet, onClose }: Props) {
  const { data: me } = useMe();
  const [rollResult, setRollResult] = useState<any>(null);

  const equippedWeapons = useMemo(() => getEquippedWeapons(sheet), [sheet]);
  const skillsRecord = useMemo(() => normalizeSkills(sheet?.sheet?.skills), [sheet?._id, sheet?.sheet?.skills]);

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

  const [weaponInstanceId, setWeaponInstanceId] = useState(equippedWeapons[0]?.instanceId ?? "");

  const selectedWeapon = useMemo(
    () => equippedWeapons.find((item) => item.instanceId === weaponInstanceId) ?? equippedWeapons[0] ?? null,
    [equippedWeapons, weaponInstanceId],
  );

  const attackProfiles = selectedWeapon?.attackProfiles ?? [];
  const [attackProfileKey, setAttackProfileKey] = useState(
    selectedWeapon?.selectedAttackProfileKey ?? attackProfiles[0]?.key ?? "",
  );

  useEffect(() => {
    const nextWeapon = equippedWeapons.find((item) => item.instanceId === weaponInstanceId);

    if (!nextWeapon && equippedWeapons[0]?.instanceId) {
      setWeaponInstanceId(equippedWeapons[0].instanceId);
      return;
    }

    const nextProfiles = nextWeapon?.attackProfiles ?? [];
    const hasExisting = nextProfiles.some((p) => p.key === attackProfileKey);

    if (!hasExisting) {
      setAttackProfileKey(nextWeapon?.selectedAttackProfileKey ?? nextProfiles[0]?.key ?? "");
    }
  }, [equippedWeapons, weaponInstanceId, attackProfileKey]);

  const selectedProfile = attackProfiles.find((p) => p.key === attackProfileKey) ?? attackProfiles[0] ?? null;

  const [aspectValueKey, setAspectValueKey] = useState(getDefaultAttackAspect(selectedWeapon, attackProfileKey));

  useEffect(() => {
    setAspectValueKey(getDefaultAttackAspect(selectedWeapon, attackProfileKey));
  }, [weaponInstanceId, attackProfileKey, selectedWeapon]);

  const allowedSkills = selectedProfile?.allowedSkillKeys ?? [];
  const skillOptions = useMemo(() => {
    return Object.entries(skillsRecord)
      .filter(([id, v]) => {
        if (!(typeof v === "number" && !Number.isNaN(v))) return false;
        if (!allowedSkills.length) return true;
        return allowedSkills.includes(id);
      })
      .map(([id, rank]) => ({
        id,
        label: titleCaseFromId(id),
        rank,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [skillsRecord, allowedSkills]);

  const [skill, setSkill] = useState("");
  const [situationalModifier, setSituationalModifier] = useState<number>(0);
  const [targetNumber, setTargetNumber] = useState<number>(10);
  const [targetLabel, setTargetLabel] = useState("");
  const [context, setContext] = useState("");

  const [diceCount, setDiceCount] = useState(3);
  const [edge, setEdge] = useState(false);
  const [burden, setBurden] = useState(false);

  useEffect(() => {
    if (selectedProfile?.allowedSkillKeys?.length === 1) {
      const onlySkill = selectedProfile.allowedSkillKeys[0];
      if (skillsRecord[onlySkill] != null) {
        setSkill(onlySkill);
      }
    }
  }, [selectedProfile, skillsRecord]);

  const selectedAspect = aspectOptions.find((o) => o.value === aspectValueKey) ?? aspectOptions[0];

  const aspectVal = selectedAspect ? getAspectValue(sheet, selectedAspect.group, selectedAspect.key) : 0;

  const skillRank = skill ? (skillsRecord[skill] ?? 0) : 0;
  const profileModifier = selectedProfile?.modifier ?? 0;
  const totalModifier = aspectVal + skillRank + profileModifier + situationalModifier;

  const operations = useMemo(() => {
    const ops: Array<{ operator: "+" | "-" | "*" | "/"; value: number }> = [];

    if (aspectVal !== 0) {
      ops.push({
        operator: aspectVal >= 0 ? "+" : "-",
        value: Math.abs(aspectVal),
      });
    }

    if (skillRank !== 0) {
      ops.push({
        operator: skillRank >= 0 ? "+" : "-",
        value: Math.abs(skillRank),
      });
    }

    if (profileModifier !== 0) {
      ops.push({
        operator: profileModifier >= 0 ? "+" : "-",
        value: Math.abs(profileModifier),
      });
    }

    if (situationalModifier !== 0) {
      ops.push({
        operator: situationalModifier >= 0 ? "+" : "-",
        value: Math.abs(situationalModifier),
      });
    }

    return ops;
  }, [aspectVal, skillRank, profileModifier, situationalModifier]);

  const labelParts: string[] = [];
  if (selectedWeapon?.name) labelParts.push(selectedWeapon.name);
  if (selectedProfile?.name) labelParts.push(selectedProfile.name);
  if (selectedAspect) labelParts.push(selectedAspect.label);
  if (skill) {
    labelParts.push(`${titleCaseFromId(skill)} (${skillRank >= 0 ? "+" : ""}${skillRank})`);
  }
  if (profileModifier) {
    labelParts.push(`Weapon Mod (${profileModifier >= 0 ? "+" : ""}${profileModifier})`);
  }
  if (situationalModifier) {
    labelParts.push(`Situational (${situationalModifier >= 0 ? "+" : ""}${situationalModifier})`);
  }

  const rollContext =
    context.trim() ||
    `${selectedWeapon?.name ?? "Weapon"} vs TN ${targetNumber}${targetLabel.trim() ? ` (${targetLabel.trim()})` : ""}`;

  const rollMutation = useMutation({
    mutationFn: async () => {
      if (!me?._id) throw new Error("No player ID available");
      if (!selectedWeapon?.instanceId) throw new Error("No equipped weapon selected");

      const rollData: CreateRollData = {
        characterId: sheet._id,
        playerId: me._id,
        campaignId: sheet.campaign ?? null,
        diceCount,
        faces: 6,
        edge,
        burden,
        operations,
        rollType: "attack",
        context: rollContext,
        aspectUsed: aspectValueKey,
        attack: {
          targetNumber,
          targetLabel: targetLabel.trim() || undefined,
          weaponInstanceId: selectedWeapon.instanceId,
          itemKey: selectedWeapon.itemKey ?? selectedWeapon.definition?.itemKey ?? null,
          weaponNameSnapshot: selectedWeapon.name ?? "Weapon",
          attackProfileKey: selectedProfile?.key ?? null,
          attackNameSnapshot: selectedProfile?.name ?? null,
        },
      };

      return createRoll(api, rollData);
    },
    onSuccess: (result) => {
      if (result.payload) {
        setRollResult({ ...result.payload, context: rollContext });
      }
    },
    onError: (error) => {
      console.error("Attack roll failed:", error);
    },
  });

  const handleRoll = () => rollMutation.mutate();
  const handleReset = () => {
    setRollResult(null);
    rollMutation.reset();
  };

  const canRoll = !rollMutation.isPending && !!me?._id && !!selectedWeapon?.instanceId && Number.isFinite(targetNumber);

  const footer = rollResult ? (
    <>
      <Button variant="outline" onClick={handleReset}>
        Roll Again
      </Button>
      <Button onClick={onClose}>Done</Button>
    </>
  ) : (
    <>
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
      <Button onClick={handleRoll} disabled={!canRoll}>
        {rollMutation.isPending ? "Rolling..." : "Attack"}
      </Button>
    </>
  );

  if (!equippedWeapons.length) {
    return (
      <Modal open onCancel={onClose} title="Attack" footer={footer}>
        <div className={styles.emptyState ?? styles.previewBox}>
          No equipped weapons found. Equip a weapon in Inventory first.
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onCancel={onClose} title="Attack" footer={footer}>
      {rollResult ? (
        <>
          <RollResultCard result={rollResult} />
        </>
      ) : (
        <div className={styles.grid}>
          <div className={styles.formGrid}>
            <SelectField
              label="Equipped Weapon"
              value={selectedWeapon?.instanceId ?? ""}
              onChange={(e) => setWeaponInstanceId(e.target.value)}
            >
              {equippedWeapons.map((weapon) => (
                <option key={weapon.instanceId} value={weapon.instanceId}>
                  {weapon.name ?? weapon.itemKey ?? "Weapon"}
                </option>
              ))}
            </SelectField>

            <div className={styles.fieldRow}>
              <TextField
                label="Target Number"
                floatingLabel
                type="number"
                value={targetNumber}
                onChange={(e) => setTargetNumber(Number(e.target.value))}
              />

              <TextField
                label="Target Label"
                floatingLabel
                value={targetLabel}
                onChange={(e) => setTargetLabel(e.target.value)}
              />
            </div>

            <div className={styles.fieldRow}>
              {attackProfiles.length > 1 && (
                <SelectField
                  label="Attack Profile"
                  value={attackProfileKey}
                  onChange={(e) => setAttackProfileKey(e.target.value)}
                >
                  {attackProfiles.map((profile) => (
                    <option key={profile.key} value={profile.key}>
                      {profile.name}
                    </option>
                  ))}
                </SelectField>
              )}
              <SelectField
                label={`Aspect (${aspectVal >= 0 ? `+${aspectVal}` : aspectVal})`}
                value={aspectValueKey}
                onChange={(e) => setAspectValueKey(e.target.value)}
              >
                {aspectOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className={styles.fieldRow}>
              <SelectField
                label="Skill"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                disabled={!skillOptions.length}
              >
                <option value="">{skillOptions.length ? "None" : "No matching skills"}</option>
                {skillOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.rank >= 0 ? "+" : ""}
                    {s.rank})
                  </option>
                ))}
              </SelectField>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Situational +/-</label>
                <div className={styles.modifierControls}>
                  <button className={styles.diceBtn} type="button" onClick={() => setSituationalModifier((m) => m - 1)}>
                    −
                  </button>
                  <span className={styles.diceDisplay}>
                    {situationalModifier >= 0 ? `+${situationalModifier}` : situationalModifier}
                  </span>
                  <button className={styles.diceBtn} type="button" onClick={() => setSituationalModifier((m) => m + 1)}>
                    +
                  </button>
                </div>
              </div>
            </div>

            <Input
              label="Context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={labelParts.join(" + ") || "Describe this attack..."}
            />
          </div>

          <div className={styles.diceConfig}>
            <div className={styles.diceRow}>
              <label className={styles.fieldLabel}>Dice</label>
              <div className={styles.diceControls}>
                <button
                  className={styles.diceBtn}
                  type="button"
                  onClick={() => setDiceCount((c) => Math.max(1, c - 1))}
                  disabled={diceCount <= 1 || edge || burden}
                >
                  −
                </button>
                <span className={styles.diceDisplay}>{diceCount}d6</span>
                <button
                  className={styles.diceBtn}
                  type="button"
                  onClick={() => setDiceCount((c) => c + 1)}
                  disabled={edge || burden}
                >
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

          <div className={styles.previewBox}>
            <div className={styles.previewHeader}>Attack Preview</div>

            <div className={styles.previewComponents}>
              {labelParts.length > 0 ? (
                <div className={styles.componentsText}>{labelParts.join(" + ")}</div>
              ) : (
                <div className={styles.emptyText}>No attack components selected yet.</div>
              )}
            </div>

            <div className={styles.previewModifier}>
              <span className={styles.modifierLabel}>Total Modifier:</span>
              <span className={styles.modifierValue}>{totalModifier >= 0 ? `+${totalModifier}` : totalModifier}</span>
            </div>

            {(selectedProfile?.harm != null || selectedProfile?.rangeLabel) && (
              <div className={styles.previewStats}>
                {selectedProfile?.harm != null && (
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Harm:</span>
                    <span className={styles.statValue}>{selectedProfile.harm}</span>
                  </div>
                )}
                {selectedProfile?.rangeLabel && (
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Range:</span>
                    <span className={styles.statValue}>{selectedProfile.rangeLabel}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {rollMutation.isError && (
            <div className={styles.errorText}>Failed to submit attack roll. Please try again.</div>
          )}
        </div>
      )}
    </Modal>
  );
}
