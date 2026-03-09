"use client";

import type { CharacterSheet } from "@tapestry/types";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader } from "@tapestry/ui";
import { BiCopy, BiTrash } from "react-icons/bi";
import DuplicateModal from "./modals/DuplicateModal/DuplicateModal.component";
import DeleteModal from "./modals/DeleteModal/DeleteModal.component";
import styles from "./SheetCard.module.scss";

type Props = {
  character: CharacterSheet;
};

function formatRelative(iso?: string) {
  if (!iso) return "—";

  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;

  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

function humanizeKey(value?: string | null) {
  if (!value) return "";

  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name?: string) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function looksLikeOpaqueId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value) || /^[0-9a-f-]{32,}$/i.test(value);
}

function getCampaignLabel(value?: string | null) {
  if (!value) return null;
  if (looksLikeOpaqueId(value)) return "Campaign Linked";
  return humanizeKey(value) || value;
}

function formatTrack(track?: { current: number; max: number; temp?: number } | null) {
  if (!track) return "—";
  const temp = typeof track.temp === "number" && track.temp > 0 ? ` (+${track.temp})` : "";
  return `${track.current}/${track.max}${temp}`;
}

export default function SheetCard({ character: c }: Props) {
  const router = useRouter();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const archetypeLabel = humanizeKey(c.sheet?.archetypeKey) || "Adventurer";
  const settingLabel = humanizeKey(c.settingKey) || "Setting Unassigned";
  const profileTitle = c.sheet?.profile?.title?.trim() || null;
  const campaignLabel = getCampaignLabel(c.campaign);
  const hpLabel = formatTrack(c.sheet?.resources?.hp);
  const threadsLabel = formatTrack(c.sheet?.resources?.threads);
  const inventoryCount = c.sheet?.inventory?.length ?? 0;

  const visibleTags = useMemo(() => {
    return Array.from(new Set((c.tags ?? []).filter(Boolean))).slice(0, 3);
  }, [c.tags]);

  const hiddenTagCount = Math.max((c.tags?.length ?? 0) - visibleTags.length, 0);

  return (
    <>
      <Card className={styles.sheetCard} >
        <CardHeader className={styles.cardHeader}>
          <div className={styles.heroArea}>
            <div className={styles.heroBackdrop} aria-hidden="true" />

            <div className={styles.avatarPanel}>
              {c.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className={styles.avatarImg} src={c.avatarUrl} alt={`${c.name} avatar`} />
              ) : (
                <div className={styles.avatarFallback} aria-hidden="true">
                  {getInitials(c.name)}
                </div>
              )}
            </div>

            <div className={styles.heroContent}>
              <div className={styles.titleBlock}>
                <span className={styles.eyebrow}>{campaignLabel ? "Campaign Character" : "Character Sheet"}</span>
                <h3 className={styles.cardTitle}>{c.name}</h3>
                <p className={styles.cardSubTitle}>{profileTitle || archetypeLabel}</p>
              </div>

              <div className={styles.heroBadges}>
                <span className={styles.levelBadge}>Weave {c.sheet?.weaveLevel ?? 0}</span>
                <span className={styles.badge}>{archetypeLabel}</span>
                <span className={styles.badge}>{settingLabel}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className={styles.cardBody}>
          <div className={styles.statGrid}>
            <div className={styles.statTile}>
              <span className={styles.statLabel}>HP</span>
              <span className={styles.statValue}>{hpLabel}</span>
            </div>

            <div className={styles.statTile}>
              <span className={styles.statLabel}>Threads</span>
              <span className={styles.statValue}>{threadsLabel}</span>
            </div>

            <div className={styles.statTile}>
              <span className={styles.statLabel}>Inventory</span>
              <span className={styles.statValue}>
                {inventoryCount} item{inventoryCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailTile}>
              <span className={styles.detailLabel}>Campaign</span>
              <span className={styles.detailValue}>{campaignLabel || "Unassigned"}</span>
            </div>

            <div className={styles.detailTile}>
              <span className={styles.detailLabel}>Updated</span>
              <span className={styles.detailValue}>{formatRelative(c.updatedAt)}</span>
            </div>
          </div>

          {visibleTags.length > 0 ? (
            <div className={styles.tagSection}>
              <span className={styles.tagLabel}>Tags</span>
              <div className={styles.tagRow}>
                {visibleTags.map((tag) => (
                  <span key={tag} className={styles.tagChip}>
                    {humanizeKey(tag) || tag}
                  </span>
                ))}
                {hiddenTagCount > 0 ? <span className={styles.tagChip}>+{hiddenTagCount}</span> : null}
              </div>
            </div>
          ) : null}

          <div className={styles.actionRow}>
            <Button
              tone="gold"
              variant="solid"
              className={styles.openBtn}
              onClick={() => router.push(`/characters/${c._id}`)}
            >
              Open Sheet
            </Button>

            <Button
              tone="neutral"
              variant="ghost"
              size="sm"
              className={styles.iconBtn}
              aria-label="Duplicate character"
              title="Duplicate"
              onClick={() => setShowDuplicateModal(true)}
            >
              <BiCopy />
            </Button>

            <Button
              tone="danger"
              variant="ghost"
              size="sm"
              className={styles.iconBtn}
              aria-label="Delete character"
              title="Delete"
              onClick={() => setShowDeleteModal(true)}
            >
              <BiTrash />
            </Button>
          </div>
        </CardBody>
      </Card>

      <DuplicateModal
        open={showDuplicateModal}
        characterId={c._id}
        characterName={c.name}
        onClose={() => setShowDuplicateModal(false)}
      />

      <DeleteModal
        open={showDeleteModal}
        characterId={c._id}
        characterName={c.name}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}
