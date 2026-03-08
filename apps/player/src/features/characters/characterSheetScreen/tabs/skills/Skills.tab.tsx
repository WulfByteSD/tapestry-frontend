// apps/player/src/features/characters/characterSheetScreen/tabs/skills/Skills.tab.tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, CardHeader, Tooltip } from "@tapestry/ui";
import { getSkillsForSetting } from "@tapestry/api-client";
import type { CharacterSheet, SkillDefinition } from "@tapestry/types";
import { api } from "@/lib/api";
import { useUpdateCharacterSheetMutation } from "../../characterSheet.mutations";
import { addSkillToMap, normalizeSkillsMap, removeSkillFromMap, updateSkillRank } from "./skills.functions";
import { enrichLearnedSkills } from "./skillDisplay.helpers";
import { SkillLibraryModal } from "./SkillLibrary.modal";
import styles from "./SkillsTab.module.scss";
import { FaTrash } from "react-icons/fa";

type Props = {
  sheet: CharacterSheet;
  mode: "build" | "play";
};

export function SkillsTab({ sheet }: Props) {
  const update = useUpdateCharacterSheetMutation(sheet._id);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const skillsMap = useMemo(() => normalizeSkillsMap(sheet?.sheet?.skills), [sheet?._id, sheet?.sheet?.skills]);

  const skillsQuery = useQuery({
    queryKey: ["content:skills", sheet.settingKey],
    enabled: !!sheet.settingKey,
    queryFn: () => getSkillsForSetting(api, sheet.settingKey!),
  });

  const skillDefinitions = skillsQuery.data?.payload ?? [];

  const learnedSkills = useMemo(() => {
    return enrichLearnedSkills(skillsMap, skillDefinitions);
  }, [skillsMap, skillDefinitions]);

  function persistSkills(nextSkills: Record<string, number>, settingKey?: string) {
    const payload: Record<string, unknown> = {
      "sheet.skills": nextSkills,
    };

    if (!sheet.settingKey && settingKey) {
      payload.settingKey = settingKey;
    }

    update.mutate(payload);
  }

  function handleAddSkill(skill: SkillDefinition, settingKey: string) {
    const nextSkills = addSkillToMap(skillsMap, skill, 1);
    persistSkills(nextSkills, settingKey);
    setLibraryOpen(false);
  }

  function handleRankChange(skillKey: string, nextRank: number) {
    persistSkills(updateSkillRank(skillsMap, skillKey, nextRank));
  }

  function handleRemove(skillKey: string) {
    persistSkills(removeSkillFromMap(skillsMap, skillKey));
  }

  return (
    <>
      <Card className={styles.screenCard}>
        <CardHeader className={styles.header}>
          <div>
            <div className={styles.title}>Skills</div>
            <div className={styles.subtitle}>Manage trained skills used in rolls, checks, and attacks.</div>
          </div>

          <Button onClick={() => setLibraryOpen(true)}>Add Skill</Button>
        </CardHeader>

        <CardBody className={styles.body}>
          {learnedSkills.length === 0 ? (
            <div className={styles.emptyState}>No skills yet. Add one from the library.</div>
          ) : (
            <div className={styles.skillGrid}>
              {learnedSkills.map((skill) => (
                <div key={skill.key} className={styles.skillCard}>
                  <div className={styles.skillInfo}>
                    <div className={styles.skillName}>{skill.name}</div>

                    <div className={styles.skillMeta}>
                      {skill.category ?? "other"}
                      {skill.defaultAspect ? ` • ${skill.defaultAspect}` : ""}
                    </div>

                    {skill.notes ? <div className={styles.skillNotes}>{skill.notes}</div> : null}
                    <Tooltip placement="top" title={`Remove ${skill.name}`}>
                      <Button
                        className={styles.deleteIcon}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(skill.key)}
                        aria-label={`Remove ${skill.name}`}
                      >
                        <FaTrash />
                      </Button>
                    </Tooltip>
                  </div>

                  <div className={styles.skillActions}>
                    <div className={styles.rankControls}>
                      <Button size="sm" variant="ghost" onClick={() => handleRankChange(skill.key, skill.rank - 1)}>
                        −
                      </Button>

                      <span className={styles.rankValue}>Rank {skill.rank}</span>

                      <Button size="sm" variant="ghost" onClick={() => handleRankChange(skill.key, skill.rank + 1)}>
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <SkillLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        sheet={sheet}
        knownSkillKeys={Object.keys(skillsMap)}
        onAddSkill={handleAddSkill}
      />
    </>
  );
}
