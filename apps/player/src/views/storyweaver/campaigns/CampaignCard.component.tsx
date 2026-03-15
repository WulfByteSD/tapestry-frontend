"use client";

import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader } from "@tapestry/ui";
import styles from "./CampaignCard.module.scss";
import { CampaignType } from "@tapestry/types";

type CampaignCardProps = {
  campaign: CampaignType;
};

function formatRelativeDate(value: string) {
  const date = new Date(value);
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

function getInitials(name?: string) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function humanizeKey(value?: string | null) {
  if (!value) return "";

  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const router = useRouter();
  const {
    _id: id,
    name,
    status,
    members,
    invites,
    settingKey,
    toneModules,
    sources,
    notes,
    updatedAt,
    avatar,
  } = campaign;

  const settingLabel = humanizeKey(settingKey) || "No Setting";
  const truncatedNotes = notes?.trim() ? notes.trim().slice(0, 100) + "..." : "No campaign pitch yet";

  return (
    <Card className={styles.campaignCard}>
      <CardHeader className={styles.cardHeader}>
        <div className={styles.heroArea}>
          <div className={styles.heroBackdrop} aria-hidden="true" />

          <div className={styles.avatarPanel}>
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.avatarImg} src={avatar} alt={`${name} avatar`} />
            ) : (
              <div className={styles.avatarFallback} aria-hidden="true">
                {getInitials(name)}
              </div>
            )}
          </div>

          <div className={styles.heroContent}>
            <div className={styles.titleBlock}>
              <span className={styles.eyebrow}>Campaign</span>
              <h3 className={styles.cardTitle}>{name}</h3>
              <p className={styles.cardSubTitle}>{truncatedNotes}</p>
            </div>

            <div className={styles.heroBadges}>
              <span className={styles.statusBadge} data-status={status}>
                {status}
              </span>
              <span className={styles.badge}>{settingLabel}</span>
              {toneModules.slice(0, 1).map((tone) => (
                <span key={tone} className={styles.badge}>
                  {humanizeKey(tone)}
                </span>
              ))}
              {toneModules.length > 1 && <span className={styles.badge}>+{toneModules.length - 1}</span>}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className={styles.cardBody}>
        <div className={styles.statGrid}>
          <div className={styles.statTile}>
            <span className={styles.statLabel}>Members</span>
            <span className={styles.statValue}>{members.length}</span>
          </div>

          <div className={styles.statTile}>
            <span className={styles.statLabel}>Invites</span>
            <span className={styles.statValue}>{invites.length}</span>
          </div>

          <div className={styles.statTile}>
            <span className={styles.statLabel}>Sources</span>
            <span className={styles.statValue}>{sources.length}</span>
          </div>
        </div>

        <div className={styles.detailGrid}>
          <div className={styles.detailTile}>
            <span className={styles.detailLabel}>Status</span>
            <span className={styles.detailValue}>{status}</span>
          </div>

          <div className={styles.detailTile}>
            <span className={styles.detailLabel}>Updated</span>
            <span className={styles.detailValue}>{formatRelativeDate(updatedAt as any)}</span>
          </div>
        </div>

        <div className={styles.actionRow}>
          <Button
            tone="gold"
            variant="solid"
            className={styles.openBtn}
            onClick={() => router.push(`/storyweaver/campaigns/${id}`)}
          >
            Open Campaign
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
