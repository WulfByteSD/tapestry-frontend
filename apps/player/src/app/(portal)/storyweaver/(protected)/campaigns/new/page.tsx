// apps/player/src/app/(portal)/storyweaver/campaigns/new/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button, Card, CardBody, CardHeader } from "@tapestry/ui";
import styles from "./NewCampaign.module.scss";

type CreateCampaignResponse = {
  success?: boolean;
  payload?: string | { _id?: string };
  message?: string;
};

function extractId(payload: CreateCampaignResponse["payload"]): string | null {
  if (!payload) return null;
  if (typeof payload === "string") return payload;
  if (typeof payload === "object" && payload._id) return payload._id;
  return null;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const startedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        setError(null);

        const res = await api.post<CreateCampaignResponse>("/game/campaigns", {
          name: "New Campaign",
          status: "draft",
          sources: ["core"],
          toneModules: [],
        });

        const id = extractId(res.data?.payload);

        if (!id) {
          throw new Error("Campaign create did not return an id.");
        }

        await queryClient.invalidateQueries({ queryKey: ["storyweaver-campaigns"] });
        router.replace(`/storyweaver/campaigns/${id}`);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.response?.data?.error || e?.message || "Failed to create campaign.";

        setError(msg);
      }
    })();
  }, [router, queryClient]);

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <CardHeader>{error ? "Couldn’t create campaign" : "Spinning up your campaign..."}</CardHeader>
        <CardBody>
          <p className={styles.copy}>
            {error
              ? "Something went sideways while weaving the campaign draft."
              : "Creating a draft board and opening it for editing."}
          </p>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <Button onClick={() => router.replace("/storyweaver")}>Back to Storyweaver</Button>

            {error ? (
              <Button
                onClick={() => {
                  startedRef.current = false;
                  setError(null);
                  router.replace("/storyweaver/campaigns/new");
                }}
              >
                Try Again
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
