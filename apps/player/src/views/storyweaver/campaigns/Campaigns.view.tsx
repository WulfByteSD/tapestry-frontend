"use client";

import Link from "next/link";
import styles from "./Campaigns.module.scss";
import CampaignCard from "./CampaignCard.component";
// import { useStoryweaverCampaigns } from "@/lib/storyweaver-hooks";

const mockCampaigns = [
  {
    _id: "wr-01",
    name: "Ashes of Everpine",
    status: "active" as const,
    members: [{}, {}, {}],
    invites: [{}, {}],
    settingKey: "woven-realms",
    toneModules: ["grim", "heroic"],
    sources: ["core", "woven-realms"],
    notes: "A frontier campaign set near the smoke-blighted woods.",
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "wr-02",
    name: "The Hollow Crown",
    status: "archived" as const,
    members: [{}, {}, {}, {}],
    invites: [],
    settingKey: "woven-realms",
    toneModules: ["courtly-intrigue"],
    sources: ["core"],
    notes: "Political rot, old vows, and one very bad decision.",
    updatedAt: new Date().toISOString(),
  },
];

export default function CampaignsView() {
  // const { data: campaigns = [], isLoading } = useStoryweaverCampaigns();
  const campaigns = mockCampaigns;
  const isLoading = false;

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
            {campaigns.filter((campaign) => campaign.status === "active").length}
          </span>
        </div>

        <div className={styles.metaPill}>
          <span className={styles.metaLabel}>Archived</span>
          <span className={styles.metaValue}>
            {campaigns.filter((campaign) => campaign.status === "archived").length}
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
          <Link href="/storyweaver/campaigns/new" className={styles.createTile}>
            <span className={styles.createGlyph}>+</span>
            <span className={styles.createTitle}>New Campaign</span>
            <span className={styles.createText}>Start a fresh thread, set the tone, and gather your table.</span>
          </Link>

          {campaigns.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </section>
      )}
    </div>
  );
}
