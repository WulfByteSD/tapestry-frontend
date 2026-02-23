// apps/player/src/features/characters/CharacterSheetScreen/CharacterSheetScreen.tsx
"use client";

import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { useUpdateCharacterSheetMutation } from "./characterSheet.mutations";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CharacterSheet.module.scss";
import { Button, Card, CardBody, CardHeader } from "@tapestry/ui";
import { useCharacterSheetQuery } from "./characterSheet.queries";
import { CharacterSheet } from "@tapestry/types";

type Props = { characterId: string; mode: "build" | "play" };

type TabKey = "overview" | "skills" | "inventory" | "conditions" | "notes";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "skills", label: "Skills" },
  { key: "inventory", label: "Inventory" },
  { key: "conditions", label: "Conditions" },
  { key: "notes", label: "Notes" },
];

const ASPECT_BLOCKS = [
  { title: "Might", keys: ["Strength", "Presence"] },
  { title: "Finesse", keys: ["Agility", "Charm"] },
  { title: "Wit", keys: ["Instinct", "Knowledge"] },
  { title: "Resolve", keys: ["Willpower", "Empathy"] },
] as const;

export default function CharacterSheetScreen({ characterId, mode }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useCharacterSheetQuery<CharacterSheet>(characterId);

  const sheet = data?.payload;
  const updateMutation = useUpdateCharacterSheetMutation(characterId);

  const [nameDraft, setNameDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [editingName, setEditingName] = useState(false);

  const [saveBadge, setSaveBadge] = useState<null | "saving" | "saved" | "error">(null);
  const savedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!sheet) return;
    if (!editingName) setNameDraft(sheet.name ?? "");
    setNotesDraft(sheet.sheet?.notes ?? "");
  }, [sheet?._id, sheet?.name, sheet?.sheet?.notes, editingName]);

  useEffect(() => {
    if (updateMutation.isPending) setSaveBadge("saving");
    else if (updateMutation.isError) setSaveBadge("error");
    else if (updateMutation.isSuccess) {
      setSaveBadge("saved");
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => setSaveBadge(null), 1400);
    }
  }, [updateMutation.isPending, updateMutation.isError, updateMutation.isSuccess]);

  const debouncedSaveName = useDebouncedCallback((value: string) => {
    updateMutation.mutate({ name: value.trim() });
  }, 450);

  const debouncedSaveNotes = useDebouncedCallback((value: string) => {
    updateMutation.mutate({ "sheet.notes": value });
  }, 650);

  function commitNameNow() {
    debouncedSaveName.flush();
  }

  function cancelNameEdit() {
    debouncedSaveName.cancel();
    setEditingName(false);
    setNameDraft(sheet?.name ?? "");
  }
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [rollPrompt, setRollPrompt] = useState<null | { label: string; value?: number }>(null);

  const displayMode = useMemo(() => mode, [mode]);

  if (isLoading) return <LoadingState onBack={() => router.replace("/")} />;
  if (isError || !sheet) {
    const msg = (error as any)?.response?.data?.message || (error as any)?.message || "Could not load character.";
    return <ErrorState message={msg} onBack={() => router.replace("/")} onRetry={() => router.refresh()} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Button tone="purple" variant="outline" size="sm" onClick={() => router.replace("/")}>
          Back
        </Button>
        <div className={styles.topTitle}>Character</div>
        <div className={styles.topSpacer} />
      </div>

      {/* HERO HEADER */}
      <Card inlay className={styles.hero}>
        <CardBody className={styles.heroBody}>
          <div className={styles.avatar} aria-hidden="true">
            <span className={styles.avatarGlyph}>{sheet.name?.[0]?.toUpperCase() ?? "?"}</span>
          </div>

          <div className={styles.heroMain}>
            <div className={styles.nameRow}>
              <div className={styles.nameLine}>
                {editingName ? (
                  <input
                    className={styles.nameInput}
                    value={nameDraft}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNameDraft(v);
                      debouncedSaveName.call(v);
                    }}
                    onBlur={() => {
                      commitNameNow();
                      setEditingName(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                      if (e.key === "Escape") cancelNameEdit();
                    }}
                    autoFocus
                    maxLength={60}
                  />
                ) : (
                  <button
                    type="button"
                    className={styles.nameButton}
                    onClick={() => setEditingName(true)}
                    title="Edit name"
                  >
                    <span className={styles.nameText}>{sheet.name}</span>
                    <span className={styles.namePencil} aria-hidden="true">
                      ✎
                    </span>
                  </button>
                )}

                <div className={styles.saveBadgeWrap}>
                  {saveBadge === "saving" && <span className={styles.saveBadge}>Saving…</span>}
                  {saveBadge === "saved" && <span className={styles.saveBadgeSaved}>Saved</span>}
                  {saveBadge === "error" && <span className={styles.saveBadgeError}>Error</span>}
                </div>
              </div>

              <div className={styles.pills}>
                <span className={styles.pill}>{sheet.campaign ? "Campaign" : "Unassigned"}</span>
                {displayMode === "build" && <span className={styles.pillGold}>Build</span>}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* TABS */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={t.key === activeTab ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {activeTab === "overview" && (
        <div className={styles.contentGrid}>
          <Card inlay className={styles.card}>
            <CardHeader className={styles.cardHeader}>
              <div className={styles.cardTitle}>Aspects</div>
              <div className={styles.cardHint}>Tap to roll (still stubbed)</div>
            </CardHeader>
            <CardBody className={styles.aspectsGrid}>
              {ASPECT_BLOCKS.map((block) => (
                <div key={block.title} className={styles.aspectTile}>
                  <div className={styles.aspectTileTitle}>{block.title}</div>
                  <div className={styles.aspectRows}>
                    {block.keys.map((k) => {
                      const value = readAspect(sheet, block.title, k);
                      return (
                        <button
                          key={k}
                          type="button"
                          className={styles.aspectRow}
                          onClick={() => setRollPrompt({ label: `${k} (${block.title})`, value })}
                        >
                          <span className={styles.aspectKey}>{k}</span>
                          <span className={styles.aspectValue}>{value ?? "—"}</span>
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
              <div className={styles.cardHint}>We’ll make this the “play surface” next</div>
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
      )}

      {activeTab !== "overview" && (
        <Card inlay className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.cardTitle}>{TABS.find((t) => t.key === activeTab)?.label}</div>
            <div className={styles.cardHint}>We’ll build this section next.</div>
          </CardHeader>
          <CardBody className={styles.muted}>Placeholder for {activeTab}.</CardBody>
        </Card>
      )}

      {rollPrompt && (
        <RollModal label={rollPrompt.label} value={rollPrompt.value} onClose={() => setRollPrompt(null)} />
      )}
    </div>
  );
}

function LoadingState({ onBack }: { onBack: () => void }) {
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Button tone="purple" variant="outline" size="sm" onClick={onBack}>
          Back
        </Button>
        <div className={styles.topTitle}>Loading…</div>
        <div className={styles.topSpacer} />
      </div>

      <Card inlay>
        <CardBody className={styles.skeletonWrap}>
          <div className={styles.skeletonHero} />
          <div className={styles.skeletonTabs} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </CardBody>
      </Card>
    </div>
  );
}

function ErrorState({ message, onBack, onRetry }: { message: string; onBack: () => void; onRetry: () => void }) {
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Button tone="purple" variant="outline" size="sm" onClick={onBack}>
          Back
        </Button>
        <div className={styles.topTitle}>Character</div>
        <div className={styles.topSpacer} />
      </div>

      <Card inlay>
        <CardHeader>
          <h1 className={styles.title}>Couldn’t load sheet</h1>
          <p className={styles.subTitle}>{message}</p>
        </CardHeader>
        <CardBody className={styles.row}>
          <Button tone="purple" variant="outline" onClick={onBack}>
            Back to Sheets
          </Button>
          <Button tone="gold" onClick={onRetry}>
            Retry
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function RollModal({ label, value, onClose }: { label: string; value?: number; onClose: () => void }) {
  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Roll</div>
          <button className={styles.modalClose} onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalLabel}>{label}</div>
          <div className={styles.modalValue}>Value: {value ?? "—"}</div>
          <div className={styles.muted}>Roll UX comes next (dice UI + Thread/Resolve spends).</div>
        </div>

        <div className={styles.modalActions}>
          <Button tone="purple" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button tone="gold" onClick={onClose}>
            Roll (stub)
          </Button>
        </div>
      </div>
    </div>
  );
}

function readAspect(sheet: any, aspectGroup: string, aspectKey: string): number | undefined {
  const a = sheet?.aspects;
  if (!a) return undefined;
  const nested = a?.[aspectGroup]?.[aspectKey];
  if (typeof nested === "number") return nested;

  const flatCandidates = [
    `${aspectGroup}_${aspectKey}`,
    `${aspectGroup.toLowerCase()}_${aspectKey.toLowerCase()}`,
    `${aspectGroup.toLowerCase()}${aspectKey}`,
  ];

  for (const key of flatCandidates) {
    const v = a?.[key];
    if (typeof v === "number") return v;
  }
  return undefined;
}
