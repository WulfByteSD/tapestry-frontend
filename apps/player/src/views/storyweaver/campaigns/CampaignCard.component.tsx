"use client";

import Link from "next/link";
import styles from "./CampaignCard.module.scss";
import { CampaignType } from "@tapestry/types";

type CampaignCardProps = {
  campaign: CampaignType;
};

function formatRelativeDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const { _id: id, name, status, members, invites, settingKey, toneModules, sources, notes, updatedAt } = campaign;

  const truncatedNotes = notes && notes?.trim().slice(0, 150) + "...";

  return (
    <Link href={`/storyweaver/campaigns/${id}`} className={styles.card}>
      <div className={styles.cardTop}>
        <span className={`${styles.statusBadge} ${status === "active" ? styles.statusActive : styles.statusArchived}`}>
          {status}
        </span>

        <span className={styles.updatedAt}>Updated {formatRelativeDate(updatedAt as any)}</span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{name}</h3>

        <p className={styles.cardText}>{truncatedNotes}</p>

        <div className={styles.cardStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{members.length}</span>
            <span className={styles.statLabel}>Players</span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statValue}>{invites.length}</span>
            <span className={styles.statLabel}>Invites</span>
          </div>

          <div className={styles.stat}>
            <span className={styles.statValue}>{sources.length}</span>
            <span className={styles.statLabel}>Sources</span>
          </div>
        </div>

        <div className={styles.tagRow}>
          {settingKey ? <span className={styles.tag}>{settingKey}</span> : null}
          {toneModules.slice(0, 2).map((tone) => (
            <span key={tone} className={styles.tagMuted}>
              {tone}
            </span>
          ))}
          {toneModules.length > 2 ? <span className={styles.tagMuted}>+{toneModules.length - 2}</span> : null}
        </div>
      </div>
    </Link>
  );
}
