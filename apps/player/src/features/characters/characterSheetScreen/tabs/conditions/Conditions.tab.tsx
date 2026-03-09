"use client";

import { useMemo } from "react";
import { Button, Card, CardBody, CardHeader, Input } from "@tapestry/ui";
import type { CharacterSheet, ConditionInstance } from "@tapestry/types";
import { useUpdateCharacterSheetMutation } from "../../characterSheet.mutations";
import { CONDITION_DEFINITIONS } from "./conditionCatalog";
import { buildConditionInstance, enrichCondition } from "./condition.helpers";
import styles from "./ConditionsTab.module.scss";

type Props = {
  sheet: CharacterSheet;
  mode: "build" | "play";
};

export function ConditionsTab({ sheet }: Props) {
  const update = useUpdateCharacterSheetMutation(sheet._id);
  const conditions = sheet.sheet.conditions ?? [];

  const activeConditionByKey = useMemo(() => {
    return new Map(conditions.map((condition) => [condition.key, condition]));
  }, [conditions]);

  function persistConditions(nextConditions: ConditionInstance[]) {
    update.mutate({
      "sheet.conditions": nextConditions,
    });
  }

  function activateCondition(conditionKey: string) {
    if (activeConditionByKey.has(conditionKey)) return;

    const nextConditions = [...conditions, buildConditionInstance(conditionKey)];
    persistConditions(nextConditions);
  }

  function removeCondition(conditionKey: string) {
    const nextConditions = conditions.filter((condition) => condition.key !== conditionKey);
    persistConditions(nextConditions);
  }

  function updateCondition(conditionKey: string, patch: Partial<ConditionInstance>) {
    const nextConditions = conditions.map((condition) =>
      condition.key === conditionKey ? { ...condition, ...patch } : condition,
    );

    persistConditions(nextConditions);
  }

  return (
    <Card className={styles.screenCard}>
      <CardHeader className={styles.header}>
        <div>
          <div className={styles.title}>Conditions</div>
          <div className={styles.subtitle}>
            Tap a condition to activate it. Active conditions show their reminders below.
          </div>
        </div>
      </CardHeader>

      <CardBody className={styles.body}>
        <div className={styles.conditionGrid}>
          {CONDITION_DEFINITIONS.map((definition) => {
            const activeCondition = activeConditionByKey.get(definition.key);
            const enriched = activeCondition ? enrichCondition(activeCondition) : null;
            const isActive = !!activeCondition;

            return (
              <div
                key={definition.key}
                className={`${styles.conditionCard} ${isActive ? styles.conditionCardActive : ""}`}
              >
                <button
                  type="button"
                  className={styles.conditionToggle}
                  onClick={() => {
                    if (!isActive) activateCondition(definition.key);
                  }}
                  disabled={isActive}
                >
                  <div className={styles.conditionTop}>
                    <div>
                      <div className={styles.conditionName}>{definition.name}</div>
                      <div className={styles.conditionSummary}>{definition.summary}</div>
                    </div>

                    <span className={styles.conditionState}>{isActive ? "Active" : "Inactive"}</span>
                  </div>
                </button>

                {definition.tags.length ? (
                  <div className={styles.tagRow}>
                    {definition.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {isActive && enriched ? (
                  <div className={styles.activePanel}>
                    {enriched.effectSummary.length ? (
                      <div className={styles.effectList}>
                        {enriched.effectSummary.map((effect) => (
                          <span key={effect} className={styles.effectChip}>
                            {effect}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className={styles.fieldGrid}>
                      <label className={styles.field}>
                        <span className={styles.label}>Stacks</span>
                        <Input
                          type="number"
                          min={1}
                          value={activeCondition.stacks ?? 1}
                          onChange={(e) =>
                            updateCondition(definition.key, {
                              stacks: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                        />
                      </label>

                      <label className={styles.field}>
                        <span className={styles.label}>Source</span>
                        <Input
                          value={activeCondition.source ?? ""}
                          onChange={(e) =>
                            updateCondition(definition.key, {
                              source: e.target.value,
                            })
                          }
                          placeholder="Ogre chain, venom dart, cursed idol..."
                        />
                      </label>
                    </div>

                    <label className={styles.field}>
                      <span className={styles.label}>Notes</span>
                      <textarea
                        className={styles.textarea}
                        value={activeCondition.notes ?? ""}
                        onChange={(e) =>
                          updateCondition(definition.key, {
                            notes: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Save ends, scene-limited, only vs melee..."
                      />
                    </label>

                    <div className={styles.actionsRow}>
                      <Button size="sm" variant="ghost" onClick={() => removeCondition(definition.key)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
