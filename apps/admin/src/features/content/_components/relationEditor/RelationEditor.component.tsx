"use client";

import styles from "./RelationEditor.module.scss";
import type { LoreParentOption, LoreRelationDraft, LoreRelationType } from "../../_hooks/useContentStudio";
import { NodeRelationDraft } from "../nodeEditorForm/NodeEditorForm.component";

type RelationEditorProps = {
  value: LoreRelationDraft[] | NodeRelationDraft[];
  onChange: (value: LoreRelationDraft[] | NodeRelationDraft[]) => void;
  targets: LoreParentOption[];
  disabled?: boolean;
};

const RELATION_TYPE_OPTIONS: LoreRelationType[] = [
  "located_in",
  "member_of",
  "rules",
  "serves",
  "allied_with",
  "enemy_of",
  "related_to",
  "appears_in",
  "originates_from",
];

function makeEmptyRelation(): LoreRelationDraft {
  return {
    type: "related_to",
    targetKey: "",
    label: "",
    notes: "",
  };
}

function updateAtIndex<T>(items: T[], index: number, nextValue: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? nextValue : item));
}

export default function RelationEditor({ value, onChange, targets, disabled = false }: RelationEditorProps) {
  return (
    <section className={styles.editor}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Relations</h3>
          <p className={styles.copy}>
            UI shell for cross-links between lore nodes. Keep it controlled now; wire target resolution into save logic
            in the next pass.
          </p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          disabled={disabled}
          onClick={() => onChange([...(value ?? []), makeEmptyRelation()])}
        >
          Add relation
        </button>
      </div>

      {!value.length ? (
        <div className={styles.empty}>
          No relations added yet. That’s fine. Forced fake relations are worse than none.
        </div>
      ) : (
        <div className={styles.list}>
          {value.map((relation, index) => (
            <div key={`${relation.type}-${index}`} className={styles.card}>
              <div className={styles.row}>
                <label className={styles.field}>
                  <span className={styles.label}>Type</span>
                  <select
                    className={styles.select}
                    disabled={disabled}
                    value={relation.type}
                    onChange={(event) =>
                      onChange(
                        updateAtIndex(value, index, {
                          ...relation,
                          type: event.target.value as LoreRelationType,
                        }),
                      )
                    }
                  >
                    {RELATION_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Target key</span>
                  <input
                    className={styles.input}
                    list={`relation-targets-${index}`}
                    disabled={disabled}
                    value={relation.targetKey}
                    onChange={(event) =>
                      onChange(
                        updateAtIndex(value, index, {
                          ...relation,
                          targetKey: event.target.value,
                        }),
                      )
                    }
                    placeholder="everpine"
                  />
                  <datalist id={`relation-targets-${index}`}>
                    {targets.map((target) => (
                      <option key={target._id} value={target.key}>
                        {target.name}
                      </option>
                    ))}
                  </datalist>
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Label</span>
                <input
                  className={styles.input}
                  disabled={disabled}
                  value={relation.label ?? ""}
                  onChange={(event) =>
                    onChange(
                      updateAtIndex(value, index, {
                        ...relation,
                        label: event.target.value,
                      }),
                    )
                  }
                  placeholder="Captain of the watch"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Notes</span>
                <textarea
                  className={styles.textarea}
                  disabled={disabled}
                  value={relation.notes ?? ""}
                  onChange={(event) =>
                    onChange(
                      updateAtIndex(value, index, {
                        ...relation,
                        notes: event.target.value,
                      }),
                    )
                  }
                  placeholder="Optional admin note for this relation"
                />
              </label>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.removeButton}
                  disabled={disabled}
                  onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
