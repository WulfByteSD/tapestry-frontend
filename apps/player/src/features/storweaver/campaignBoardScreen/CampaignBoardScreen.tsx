// apps/player/src/features/storyweaver/campaignBoardScreen/CampaignBoardScreen.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody } from "@tapestry/ui";
import { useCampaignQuery } from "./campaignBoard.queries";
import { useUpdateCampaignMutation } from "./campaignBoard.mutations";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import styles from "./CampaignBoardScreen.module.scss";

type Props = {
  campaignId: string;
};

function parseList(input: string): string[] {
  return input
    .split(/[\n,]/g)
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function CampaignBoardScreen({ campaignId }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useCampaignQuery(campaignId);
  const updateMutation = useUpdateCampaignMutation(campaignId);

  const campaign = data?.payload;

  const [nameDraft, setNameDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [sourcesDraft, setSourcesDraft] = useState("");
  const [tonesDraft, setTonesDraft] = useState("");

  const [saveBadge, setSaveBadge] = useState<"saving" | "saved" | "error" | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!campaign) return;
    setNameDraft(campaign.name ?? "");
    setNotesDraft(campaign.notes ?? "");
    setSourcesDraft((campaign.sources ?? []).join(", "));
    setTonesDraft((campaign.toneModules ?? []).join(", "));
  }, [campaign?._id, campaign?.name, campaign?.notes, campaign?.sources, campaign?.toneModules]);

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
    updateMutation.mutate({ name: value.trim() || "New Campaign" });
  }, 400);

  const debouncedSaveNotes = useDebouncedCallback((value: string) => {
    updateMutation.mutate({ notes: value });
  }, 600);

  const sources = useMemo(() => parseList(sourcesDraft), [sourcesDraft]);
  const tones = useMemo(() => parseList(tonesDraft), [tonesDraft]);

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
          <div className={styles.boardHero}>
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
            />

            <div className={styles.metaRow}>
              <span className={styles.metaChip}>{campaign.status}</span>
              <span className={styles.metaChip}>{campaign.settingKey || "No setting"}</span>
              <span className={styles.metaChip}>{campaign.members?.length ?? 0} members</span>
            </div>
          </div>

          <div className={styles.grid}>
            <section className={styles.mainPanel}>
              <h3>Campaign Pitch</h3>
              <textarea
                className={styles.notesArea}
                value={notesDraft}
                onChange={(e) => {
                  setNotesDraft(e.target.value);
                  debouncedSaveNotes.call(e.target.value);
                }}
                onBlur={() => debouncedSaveNotes.flush()}
                placeholder="What is this campaign about?"
                rows={7}
              />
            </section>

            <aside className={styles.sidePanel}>
              <section className={styles.editBlock}>
                <h3>Tone Modules</h3>
                <input
                  className={styles.textInput}
                  value={tonesDraft}
                  onChange={(e) => setTonesDraft(e.target.value)}
                  onBlur={() => updateMutation.mutate({ toneModules: parseList(tonesDraft) })}
                  placeholder="dragon-dial, romance-dial"
                />
                <div className={styles.tokenRow}>
                  {tones.length ? (
                    tones.map((tone) => (
                      <span key={tone} className={styles.token}>
                        {tone}
                      </span>
                    ))
                  ) : (
                    <span className={styles.empty}>No tone modules yet</span>
                  )}
                </div>
              </section>

              <section className={styles.editBlock}>
                <h3>Sources</h3>
                <input
                  className={styles.textInput}
                  value={sourcesDraft}
                  onChange={(e) => setSourcesDraft(e.target.value)}
                  onBlur={() =>
                    updateMutation.mutate({
                      sources: parseList(sourcesDraft).length ? parseList(sourcesDraft) : ["core"],
                    })
                  }
                  placeholder="core, woven-realms"
                />
                <div className={styles.tokenRow}>
                  {sources.length ? (
                    sources.map((source) => (
                      <span key={source} className={styles.token}>
                        {source}
                      </span>
                    ))
                  ) : (
                    <span className={styles.empty}>No sources yet</span>
                  )}
                </div>
              </section>

              <section className={styles.editBlock}>
                <h3>Coming Next</h3>
                <div className={styles.stubList}>
                  <div className={styles.stub}>Invites</div>
                  <div className={styles.stub}>Join Requests</div>
                  <div className={styles.stub}>Roster</div>
                  <div className={styles.stub}>Encounter Tracker</div>
                </div>
              </section>
            </aside>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
