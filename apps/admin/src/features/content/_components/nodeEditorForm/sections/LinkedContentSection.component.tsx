"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  NodeEditorFormValue,
  NodeLinkedContentDraft,
  LinkedContentOption,
  SearchLinkedContentParams,
} from "../NodeEditorForm.types";
import { LINKED_CONTENT_OPTIONS } from "../NodeEditorForm.types";
import styles from "../NodeEditorForm.module.scss";

type LinkedContentSectionProps = {
  settingKey: string;
  linkedContent: NodeEditorFormValue["linkedContent"];
  onAddLinkedContent: () => void;
  onUpdateLinkedContent: (itemId: string, patch: Partial<NodeLinkedContentDraft>) => void;
  onRemoveLinkedContent: (itemId: string) => void;
  onSearchLinkedContent?: (params: SearchLinkedContentParams) => Promise<LinkedContentOption[]>;
};

type RowProps = {
  item: NodeLinkedContentDraft;
  settingKey: string;
  onUpdateLinkedContent: (itemId: string, patch: Partial<NodeLinkedContentDraft>) => void;
  onRemoveLinkedContent: (itemId: string) => void;
  onSearchLinkedContent?: (params: SearchLinkedContentParams) => Promise<LinkedContentOption[]>;
};

function LinkedContentRow({
  item,
  settingKey,
  onUpdateLinkedContent,
  onRemoveLinkedContent,
  onSearchLinkedContent,
}: RowProps) {
  const [query, setQuery] = useState(item.targetName || item.targetKey || "");
  const [results, setResults] = useState<LinkedContentOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(item.targetName || item.targetKey || "");
  }, [item.targetKey, item.targetName]);

  useEffect(() => {
    if (!onSearchLinkedContent || !settingKey) {
      setResults([]);
      return;
    }

    const trimmed = query.trim();

    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);

        const nextResults = await onSearchLinkedContent({
          type: item.type,
          settingKey,
          query: trimmed,
          limit: 8,
        });

        setResults(nextResults);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [item.type, onSearchLinkedContent, query, settingKey]);

  const selectedSummary = useMemo(() => {
    if (!item.targetId) return null;

    return {
      name: item.targetName || "Selected target",
      key: item.targetKey || item.targetId,
    };
  }, [item.targetId, item.targetKey, item.targetName]);

  const selectOption = (option: LinkedContentOption) => {
    onUpdateLinkedContent(item.id, {
      targetId: option.id,
      targetKey: option.key,
      targetName: option.name,
      label: item.label || option.name,
    });

    setQuery(option.name);
    setIsOpen(false);
  };

  return (
    <div className={styles.rowCard}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Type</span>
          <select
            className={styles.select}
            value={item.type}
            onChange={(event) =>
              onUpdateLinkedContent(item.id, {
                type: event.target.value as NodeLinkedContentDraft["type"],
                targetId: "",
                targetKey: "",
                targetName: "",
                label: "",
              })
            }
          >
            {LINKED_CONTENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Search</span>
          <input
            className={styles.input}
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            placeholder={`Search ${item.type}...`}
          />
          <span className={styles.helper}>Search by name, key, role, origin, or tags.</span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Label</span>
          <input
            className={styles.input}
            value={item.label}
            onChange={(event) => onUpdateLinkedContent(item.id, { label: event.target.value })}
            placeholder="Captain Varrick combat profile"
          />
        </label>
      </div>

      {onSearchLinkedContent ? (
        <div className={styles.stack}>
          {isSearching ? <p className={styles.helper}>Searching…</p> : null}

          {isOpen && results.length ? (
            <div className={styles.optionList}>
              {results.map((option) => (
                <button
                  key={`${option.type}:${option.id}`}
                  type="button"
                  className={styles.optionButton}
                  onClick={() => selectOption(option)}
                >
                  <span className={styles.optionTitle}>{option.name}</span>
                  <span className={styles.optionSubline}>
                    {option.key}
                    {option.subtitle ? ` • ${option.subtitle}` : ""}
                    {option.meta ? ` • ${option.meta}` : ""}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <label className={styles.field}>
          <span className={styles.label}>Target ID</span>
          <input
            className={styles.input}
            value={item.targetId}
            onChange={(event) => onUpdateLinkedContent(item.id, { targetId: event.target.value })}
            placeholder="combatant id"
          />
        </label>
      )}

      {selectedSummary ? (
        <div className={styles.selectedContentCard}>
          <div>
            <strong className={styles.optionTitle}>{selectedSummary.name}</strong>
            <p className={styles.optionSubline}>{selectedSummary.key}</p>
            <p className={styles.helper}>Target ID: {item.targetId}</p>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() =>
              onUpdateLinkedContent(item.id, {
                targetId: "",
                targetKey: "",
                targetName: "",
              })
            }
          >
            Clear selection
          </button>
        </div>
      ) : null}

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton} onClick={() => onRemoveLinkedContent(item.id)}>
          Remove link
        </button>
      </div>
    </div>
  );
}

export default function LinkedContentSection({
  settingKey,
  linkedContent,
  onAddLinkedContent,
  onUpdateLinkedContent,
  onRemoveLinkedContent,
  onSearchLinkedContent,
}: LinkedContentSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Linked content</h3>
          <p className={styles.sectionCopy}>Cross-system references.</p>
        </div>

        <button type="button" className={styles.secondaryButton} onClick={onAddLinkedContent}>
          Add linked content
        </button>
      </div>

      {linkedContent.length ? (
        <div className={styles.stack}>
          {linkedContent.map((item) => (
            <LinkedContentRow
              key={item.id}
              item={item}
              settingKey={settingKey}
              onUpdateLinkedContent={onUpdateLinkedContent}
              onRemoveLinkedContent={onRemoveLinkedContent}
              onSearchLinkedContent={onSearchLinkedContent}
            />
          ))}
        </div>
      ) : (
        <p className={styles.helper}>No linked content yet.</p>
      )}
    </section>
  );
}
