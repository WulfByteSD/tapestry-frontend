// apps/player/src/features/characters/CharacterSheetScreen/CharacterSheetScreen.tsx
"use client";

import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { useUpdateCharacterSheetMutation } from "./characterSheet.mutations";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./CharacterSheet.module.scss";
import { Button, Card, CardBody, CardHeader, Tabs, Tooltip } from "@tapestry/ui";
import { useCharacterSheetQuery } from "./characterSheet.queries";
import { CharacterSheet, NoteCard } from "@tapestry/types";
import { createTabs, type TabKey } from "./tabs";
import { CharacterDetailsModal } from "./CharacterDetails.modal";
import Image from "next/image";
import { FaCog } from "react-icons/fa";

type Props = { characterId: string; mode: "build" | "play" };
function titleCaseFromKey(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

function truncateText(value?: string | null, max = 140) {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
}
export default function CharacterSheetScreen({ characterId, mode }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useCharacterSheetQuery<CharacterSheet>(characterId);

  const sheet = data?.payload;
  const updateMutation = useUpdateCharacterSheetMutation<CharacterSheet>(characterId);
  const profile = sheet?.sheet?.profile ?? {};
  const heroTitle = profile.title?.trim() || "";
  const heroBio = truncateText(profile.bio?.trim(), 120);

  const settingBadgeLabel = sheet?.settingKey ? titleCaseFromKey(sheet.settingKey) : "No Setting";

  const campaignBadgeLabel = sheet?.campaign ? "Campaign Linked" : "No Campaign";

  const statusBadgeLabel = titleCaseFromKey(sheet?.status);
  const [nameDraft, setNameDraft] = useState("");
  const [editingName, setEditingName] = useState(false);

  const [saveBadge, setSaveBadge] = useState<null | "saving" | "saved" | "error">(null);
  const savedTimerRef = useRef<number | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  function handleSaveDetails(payload: Record<string, unknown>) {
    updateMutation.mutate(payload, {
      onSuccess: () => setDetailsOpen(false),
    });
  }
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

  function handleSaveNotes(noteCards: NoteCard[]) {
    updateMutation.mutate({ "sheet.noteCards": noteCards });
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
  const [currentMode, setCurrentMode] = useState<"build" | "play">(mode);

  const baseTabs = useMemo(
    () => createTabs({ sheet, onSaveNotes: handleSaveNotes, mode: currentMode }),
    [sheet, currentMode],
  );

  // Wrap each tab's content with motion.div for smooth transitions
  const tabs = useMemo(
    () =>
      baseTabs.map((tab) => ({
        ...tab,
        children: (
          <motion.div
            key={tab.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {tab.children}
          </motion.div>
        ),
      })),
    [baseTabs],
  );

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

      {/* <Card inlay className={styles.hero}>
        <CardBody className={styles.heroBody}> */}
      <div className={styles.heroContent}>
        <div className={styles.heroHeaderRow}>
          {sheet.avatarUrl ? (
            <Image src={sheet.avatarUrl} alt={sheet.name} width={72} height={72} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>{sheet.name?.[0]?.toUpperCase() ?? "?"}</div>
          )}

          <div className={styles.heroMain}>
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
                {sheet.name} <span className={styles.editGlyph}>✎</span>
              </button>
            )}

            {heroTitle ? <div className={styles.heroTitle}>{heroTitle}</div> : null}
            {heroBio ? <div className={styles.heroBio}>{heroBio}</div> : null}

            <div className={styles.heroStatsRow}>
              <span className={styles.heroStat}>Weave {sheet.sheet?.weaveLevel ?? 1}</span>
              {sheet.sheet?.archetypeKey ? <span className={styles.heroStat}>{sheet.sheet.archetypeKey}</span> : null}
            </div>

            <div className={styles.badgeRow}>
              <span className={styles.badge}>{settingBadgeLabel}</span>
              <span className={styles.badge}>{campaignBadgeLabel}</span>
              <span className={styles.badge}>{statusBadgeLabel}</span>
            </div>
          </div>

          <div className={styles.heroActions}>
            <div className={styles.modeToggle}>
              <button
                type="button"
                className={currentMode === "play" ? styles.modeButtonActive : styles.modeButton}
                onClick={() => setCurrentMode("play")}
              >
                Play
              </button>
              <button
                type="button"
                className={currentMode === "build" ? styles.modeButtonActive : styles.modeButton}
                onClick={() => setCurrentMode("build")}
              >
                Build
              </button>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setDetailsOpen(true)}>
              <FaCog />
            </Button>
          </div>
        </div>
      </div>
      {/* </CardBody>
      </Card> */}
      <CharacterDetailsModal
        open={detailsOpen}
        sheet={sheet}
        onClose={() => setDetailsOpen(false)}
        onSave={handleSaveDetails}
        isSaving={updateMutation.isPending}
      />
      <Tabs
        items={tabs}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
        className={styles.tabs}
        tabClassName={styles.tab}
        activeTabClassName={styles.tabActive}
        contentClassName={styles.tabContent}
        fit="content"
        keepMounted={false}
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
