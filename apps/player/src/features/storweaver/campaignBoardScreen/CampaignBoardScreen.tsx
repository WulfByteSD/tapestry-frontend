// apps/player/src/features/storyweaver/campaignBoardScreen/CampaignBoardScreen.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, Tabs } from "@tapestry/ui";
import { useCampaignQuery, useSettingsQuery } from "./campaignBoard.queries";
import { useUpdateCampaignMutation } from "./campaignBoard.mutations";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { createTabs, TabKey } from "./tabs";
import type { CampaignType } from "@tapestry/types";
import styles from "./CampaignBoardScreen.module.scss";

type Props = {
  campaignId: string;
};

function getUserRole(
  campaign: CampaignType & { _id: string },
  userId?: string,
): "owner" | "sw" | "co-sw" | "player" | "observer" | null {
  if (!userId) return null;
  if (campaign.owner === userId) return "owner";
  const member = campaign.members?.find((m) => m.player._id === userId);
  return member?.role || null;
}

export default function CampaignBoardScreen({ campaignId }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useCampaignQuery(campaignId);
  const updateMutation = useUpdateCampaignMutation(campaignId);
  const settingsQuery = useSettingsQuery();

  const campaign = data?.payload;

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [nameDraft, setNameDraft] = useState("");

  const [saveBadge, setSaveBadge] = useState<"saving" | "saved" | "error" | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!campaign) return;
    setNameDraft(campaign.name ?? "");
  }, [campaign?._id, campaign?.name]);

  useEffect(() => {
    if (updateMutation.isPending) setSaveBadge("saving");
    else if (updateMutation.isError) setSaveBadge("error");
    else if (updateMutation.isSuccess) {
      setSaveBadge("saved");
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setSaveBadge(null), 1400);
    }
  }, [updateMutation.isPending, updateMutation.isError, updateMutation.isSuccess]);

  const debouncedSaveName = useDebouncedCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return; // Don't save empty names
    updateMutation.mutate({ name: trimmed });
  }, 400);

  // TODO: Replace with actual user ID from auth context
  const userId = campaign?.owner; // For now, assume current user is owner
  const userRole = useMemo(() => (campaign ? getUserRole(campaign, userId) : null), [campaign, userId]);

  const tabs = useMemo(() => {
    if (!campaign) return [];
    return createTabs({
      campaign,
      updateMutation,
      settingsQuery,
      userRole,
    });
  }, [campaign, updateMutation, settingsQuery, userRole]);

  if (isLoading) {
    return <div className={styles.state}>Loading campaign board...</div>;
  }

  if (isError || !campaign) {
    const msg = (error as any)?.response?.data?.message || (error as any)?.message || "Could not load campaign.";

    return (
      <div className={styles.state}>
        <h1>Couldn’t load campaign</h1>
        <p>{msg}</p>
        <Button onClick={() => router.replace("/storyweaver")}>Back</Button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Button variant="ghost" onClick={() => router.replace("/storyweaver/campaigns")}>
          Back
        </Button>

        <div className={styles.saveBadge}>
          {saveBadge === "saving" && "Saving"}
          {saveBadge === "saved" && "Saved"}
          {saveBadge === "error" && "Error"}
        </div>
      </div>

      <Card className={styles.boardCard}>
        <CardBody>
          {/* Hero Section */}
          <div
            className={styles.heroContent}
            style={{
              backgroundImage: campaign.avatar
                ? `linear-gradient(rgba(15, 18, 28, 0.85), rgba(15, 18, 28, 0.85)), url(${campaign.avatar})`
                : undefined,
            }}
            data-has-image={campaign.avatar ? "true" : "false"}
          >
            <div className={styles.heroHeaderRow}>
              <div className={styles.heroMain}>
                <div className={styles.heroInfo}>
                  <input
                    className={styles.titleInput}
                    value={nameDraft}
                    onChange={(e) => {
                      setNameDraft(e.target.value);
                      debouncedSaveName.call(e.target.value);
                    }}
                    onBlur={() => debouncedSaveName.flush()}
                    placeholder="New Campaign"
                    maxLength={80}
                    disabled={campaign.status === "archived"}
                  />
                  <div className={styles.heroPitch}>
                    {campaign.notes ? (
                      <p className={styles.pitchPreview}>{campaign.notes}</p>
                    ) : (
                      <p className={styles.pitchEmpty}>No pitch yet...</p>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.heroActions}>
                <div className={styles.metaBadge} data-status={campaign.status}>
                  {campaign.status}
                </div>
                {campaign.settingKey && <div className={styles.metaBadge}>{campaign.settingKey}</div>}
                <div className={styles.metaBadge}>{campaign.members?.length ?? 0} members</div>
              </div>
            </div>
          </div>

          {/* Archived Banner */}
          {campaign.status === "archived" && (
            <div className={styles.archivedBanner}>This campaign is archived and read-only.</div>
          )}

          {/* Tabs */}
          <div className={styles.tabsContainer}>
            <Tabs items={tabs} activeKey={activeTab} onChange={(key: string) => setActiveTab(key as TabKey)} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
