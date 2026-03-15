"use client";

import Link from "next/link";
import styles from "./Campaigns.module.scss";
import CampaignCard from "@/components/campaignCard";
import { useStoryweaverCampaigns } from "@/lib/storyweaver-hooks";

export default function CampaignsView() {
  const { data, isLoading } = useStoryweaverCampaigns();
  const campaigns = data?.payload || [];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Storyweaver</p>
          <h1 className={styles.title}>Campaign Board</h1>
          <p className={styles.subtitle}>
            Shape worlds, gather players, and keep your stories bound together without turning the UI into an
            accountant’s fever dream.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href="/storyweaver/campaigns/new" className={styles.primaryAction}>
            Create Campaign
          </Link>
        </div>
      </section>

      <section className={styles.boardMeta}>
        <div className={styles.metaPill}>
          <span className={styles.metaLabel}>Total Campaigns</span>
          <span className={styles.metaValue}>{campaigns.length}</span>
        </div>

        <div className={styles.metaPill}>
          <span className={styles.metaLabel}>Active</span>
          <span className={styles.metaValue}>
            {campaigns.filter((campaign: any) => campaign.status === "active").length}
          </span>
        </div>

        <div className={styles.metaPill}>
          <span className={styles.metaLabel}>Archived</span>
          <span className={styles.metaValue}>
            {campaigns.filter((campaign: any) => campaign.status === "archived").length}
          </span>
        </div>
      </section>

      {isLoading ? (
        <section className={styles.grid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.skeletonCard} />
          ))}
        </section>
      ) : campaigns.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.emptyPanel}>
            <h2>No campaigns yet</h2>
            <p>
              Your board is empty. Start with one campaign, invite players, and let the threads start tangling
              themselves.
            </p>

            <Link href="/storyweaver/campaigns/new" className={styles.primaryAction}>
              Create Your First Campaign
            </Link>
          </div>
        </section>
      ) : (
        <section className={styles.grid}>
          {campaigns.map((campaign: any) => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </section>
      )}
    </div>
  );
}
