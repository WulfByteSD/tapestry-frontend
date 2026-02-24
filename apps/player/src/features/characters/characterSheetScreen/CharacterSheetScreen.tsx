// apps/player/src/features/characters/CharacterSheetScreen/CharacterSheetScreen.tsx
"use client";

import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { useUpdateCharacterSheetMutation } from "./characterSheet.mutations";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CharacterSheet.module.scss";
import { Button, Card, CardBody, CardHeader, Tabs } from "@tapestry/ui";
import { useCharacterSheetQuery } from "./characterSheet.queries";
import { CharacterSheet } from "@tapestry/types";
import { createTabs, type TabKey } from "./tabs";

type Props = { characterId: string; mode: "build" | "play" };

export default function CharacterSheetScreen({ characterId, mode }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useCharacterSheetQuery<CharacterSheet>(characterId);

  const sheet = data?.payload;
  const updateMutation = useUpdateCharacterSheetMutation<CharacterSheet>(characterId);

  const [nameDraft, setNameDraft] = useState("");
  const [editingName, setEditingName] = useState(false);

  const [saveBadge, setSaveBadge] = useState<null | "saving" | "saved" | "error">(null);
  const savedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!sheet) return;
    if (!editingName) setNameDraft(sheet.name ?? "");
  }, [sheet?._id, sheet?.name, editingName]);

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

  function handleSaveNotes(notes: string) {
    updateMutation.mutate({ "sheet.notes": notes });
  }

  function commitNameNow() {
    debouncedSaveName.flush();
  }

  function cancelNameEdit() {
    debouncedSaveName.cancel();
    setEditingName(false);
    setNameDraft(sheet?.name ?? "");
  }

  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const displayMode = useMemo(() => mode, [mode]);

  const tabs = useMemo(() => createTabs({ sheet, onSaveNotes: handleSaveNotes }), [sheet]);

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
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
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
                  {saveBadge === "saving" && <span className={styles.saveBadge}>Saving</span>}
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

      <Tabs
        items={tabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
        className={styles.tabs}
        tabClassName={styles.tab}
        activeTabClassName={styles.tabActive}
        contentClassName={styles.tabContent}
      />
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
        <div className={styles.topTitle}>Loadingâ€¦</div>
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
          <h1 className={styles.title}>Couldnâ€™t load sheet</h1>
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
