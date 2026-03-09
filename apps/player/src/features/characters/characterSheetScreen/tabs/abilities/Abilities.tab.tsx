"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, CardHeader } from "@tapestry/ui";
import { api } from "@/lib/api";
import { getAbilitiesForSetting } from "@tapestry/api-client";
import type { AbilityDefinition, CharacterLearnedAbility, CharacterSheet, EffectiveAbility } from "@tapestry/types";
import { useUpdateCharacterSheetMutation } from "../../characterSheet.mutations";
import {
  addLearnedAbility,
  formatAbilityMeta,
  groupEffectiveAbilities,
  normalizeLearnedAbilities,
  removeLearnedAbility,
  titleCaseFallback,
} from "./abilities.functions";
import { AbilityLibraryModal } from "./AbilityLibrary.modal";
import styles from "./AbilitiesTab.module.scss";

type Props = {
  sheet: CharacterSheet;
  mode: "build" | "play";
};

type DisplayAbility = EffectiveAbility & {
  sourceType: "learned" | "innate" | "item";
};

export function AbilitiesTab({ sheet }: Props) {
  const update = useUpdateCharacterSheetMutation(sheet._id);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const learnedAbilities = useMemo(
    () => normalizeLearnedAbilities(sheet.sheet?.learnedAbilities),
    [sheet.sheet?.learnedAbilities],
  );

  const effectiveAbilities = useMemo(
    () => sheet.derived?.effectiveAbilities ?? [],
    [sheet.derived?.effectiveAbilities],
  );

  const abilitiesQuery = useQuery({
    queryKey: ["content:abilities", sheet.settingKey],
    enabled: !!sheet.settingKey,
    queryFn: () => getAbilitiesForSetting(api, sheet.settingKey!),
  });

  const abilityDefinitions = (abilitiesQuery.data?.payload ?? []) as AbilityDefinition[];

  const abilityDefinitionByKey = useMemo(() => {
    return new Map(abilityDefinitions.map((ability) => [ability.key, ability]));
  }, [abilityDefinitions]);

  const grouped = useMemo(() => {
    return groupEffectiveAbilities(effectiveAbilities);
  }, [effectiveAbilities]);

  const learnedEffective = useMemo<DisplayAbility[]>(() => {
    if (grouped.learned.length > 0) {
      return grouped.learned;
    }

    return learnedAbilities.map((entry) => {
      const def = abilityDefinitionByKey.get(entry.abilityKey);

      return {
        abilityId: entry.abilityId,
        abilityKey: entry.abilityKey,
        name: def?.name ?? titleCaseFallback(entry.abilityKey),
        category: def?.category,
        sourceType: "learned" as const,
        activation: def?.activation,
        usageModel: def?.usageModel,
        cost: def?.cost ?? null,
        summary: def?.summary,
        effectText: def?.effectText,
        available: true,
        tags: def?.tags ?? [],
        notes: entry.notes,
      };
    });
  }, [grouped.learned, learnedAbilities, abilityDefinitionByKey]);

  const itemGrantedEffective = useMemo<DisplayAbility[]>(() => {
    return grouped.item;
  }, [grouped.item]);

  const knownAbilityKeys = useMemo(() => {
    return learnedAbilities.map((entry) => entry.abilityKey);
  }, [learnedAbilities]);

  function persistLearnedAbilities(nextLearned: CharacterLearnedAbility[], settingKey?: string) {
    const payload: Record<string, unknown> = {
      "sheet.learnedAbilities": nextLearned,
    };

    if (!sheet.settingKey && settingKey) {
      payload.settingKey = settingKey;
    }

    update.mutate(payload);
  }

  function handleAddAbility(ability: AbilityDefinition, settingKey: string) {
    const nextLearned = addLearnedAbility(learnedAbilities, ability);
    persistLearnedAbilities(nextLearned, settingKey);
    setLibraryOpen(false);
  }

  function handleRemoveLearned(abilityKey: string) {
    const nextLearned = removeLearnedAbility(learnedAbilities, abilityKey);
    persistLearnedAbilities(nextLearned);
  }

  return (
    <>
      <Card className={styles.screenCard}>
        <CardHeader className={styles.header}>
          <div>
            <div className={styles.title}>Abilities</div>
            <div className={styles.subtitle}>
              Learned powers live here, and gear-granted abilities appear automatically.
            </div>
          </div>

          <Button onClick={() => setLibraryOpen(true)}>Add Ability</Button>
        </CardHeader>

        <CardBody className={styles.body}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.sectionTitle}>Learned Abilities</div>
                <div className={styles.sectionHint}>Added directly to the character and persisted on the sheet.</div>
              </div>
            </div>

            {learnedEffective.length === 0 ? (
              <div className={styles.emptyState}>No learned abilities yet. Add one from the library.</div>
            ) : (
              <div className={styles.abilityGrid}>
                {learnedEffective.map((ability) => (
                  <div key={ability.abilityKey} className={styles.abilityCard}>
                    <div className={styles.abilityTop}>
                      <div className={styles.abilityInfo}>
                        <div className={styles.abilityName}>{ability.name}</div>
                        <div className={styles.abilityMeta}>
                          {ability.category ?? "other"}
                          {formatAbilityMeta(ability) ? ` • ${formatAbilityMeta(ability)}` : ""}
                        </div>
                      </div>

                      <div className={styles.actionsRow}>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveLearned(ability.abilityKey)}>
                          Remove
                        </Button>
                      </div>
                    </div>

                    {ability.tags?.length ? (
                      <div className={styles.tagRow}>
                        {ability.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {ability.summary ? <div className={styles.abilitySummary}>{ability.summary}</div> : null}

                    {ability.effectText ? <div className={styles.abilityEffect}>{ability.effectText}</div> : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.sectionTitle}>Granted by Gear</div>
                <div className={styles.sectionHint}>
                  These come from equipped or owned item snapshots and are read-only here.
                </div>
              </div>
            </div>

            {itemGrantedEffective.length === 0 ? (
              <div className={styles.emptyState}>No gear-granted abilities are currently active.</div>
            ) : (
              <div className={styles.abilityGrid}>
                {itemGrantedEffective.map((ability) => (
                  <div
                    key={`${ability.abilityKey}-${ability.sourceInstanceId ?? ability.sourceLabel ?? "item"}`}
                    className={`${styles.abilityCard} ${!ability.available ? styles.abilityCardUnavailable : ""}`}
                  >
                    <div className={styles.abilityTop}>
                      <div className={styles.abilityInfo}>
                        <div className={styles.abilityName}>{ability.name}</div>
                        <div className={styles.abilityMeta}>
                          {ability.category ?? "other"}
                          {formatAbilityMeta(ability) ? ` • ${formatAbilityMeta(ability)}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className={styles.sourceRow}>
                      <span className={styles.sourceChip}>Source: {ability.sourceLabel ?? "Item"}</span>

                      {!ability.available ? <span className={styles.sourceChip}>Unavailable</span> : null}

                      {ability.grantMode ? (
                        <span className={styles.sourceChip}>{titleCaseFallback(ability.grantMode)}</span>
                      ) : null}
                    </div>

                    {ability.tags?.length ? (
                      <div className={styles.tagRow}>
                        {ability.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {ability.summary ? <div className={styles.abilitySummary}>{ability.summary}</div> : null}

                    {ability.effectText ? <div className={styles.abilityEffect}>{ability.effectText}</div> : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </CardBody>
      </Card>

      <AbilityLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        sheet={sheet}
        knownAbilityKeys={knownAbilityKeys}
        onAddAbility={handleAddAbility}
      />
    </>
  );
}
