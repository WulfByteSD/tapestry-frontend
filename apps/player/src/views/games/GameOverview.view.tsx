"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import styles from "./GameOverview.module.scss";

type GameDetail = {
  id: string;
  name: string;
  storyweaverName: string;
  settingKey?: string;
  toneModules: string[];
  playerCount: number;
  maxPlayers?: number | null;
  pitch?: string;
  tableExpectations?: string;
  summary?: string;
  joinPolicy?: "open" | "approval" | "invite_only";
  status?: string;
  requestStatus?: "none" | "pending" | "accepted" | "declined";
};

type Props = {
  gameId: string;
};

function normalizeGame(raw: any): GameDetail {
  return {
    id: String(raw?._id ?? raw?.id ?? "unknown"),
    name: String(raw?.name ?? "Untitled Campaign"),
    storyweaverName: String(
      raw?.storyweaverName ?? raw?.storyweaver?.displayName ?? raw?.storyweaver?.name ?? "Unknown Storyweaver",
    ),
    settingKey: raw?.settingKey ?? raw?.setting?.key ?? undefined,
    toneModules: Array.isArray(raw?.toneModules) ? raw.toneModules : [],
    playerCount:
      typeof raw?.playerCount === "number"
        ? raw.playerCount
        : Array.isArray(raw?.members)
          ? raw.members.filter((member: any) => member?.role === "player").length
          : 0,
    maxPlayers:
      typeof raw?.maxPlayers === "number"
        ? raw.maxPlayers
        : typeof raw?.limits?.maxPlayers === "number"
          ? raw.limits.maxPlayers
          : null,
    pitch: raw?.pitch ?? raw?.notes ?? "",
    tableExpectations: raw?.tableExpectations ?? raw?.table?.expectations ?? raw?.expectations ?? "",
    summary: raw?.summary ?? raw?.description ?? raw?.overview ?? "",
    joinPolicy: raw?.joinPolicy ?? "approval",
    status: raw?.status ?? "active",
    requestStatus: raw?.requestStatus ?? "none",
  };
}

async function fetchGameDetail(gameId: string): Promise<GameDetail | null> {
  try {
    const response = await api.get(`/game/campaigns/${gameId}/public`);
    const payload = response?.data?.payload ?? response?.data ?? null;

    if (!payload) return null;
    return normalizeGame(payload);
  } catch {
    return null;
  }
}

export default function GameOverviewView({ gameId }: Props) {
  const [requestMessage, setRequestMessage] = useState("");
  const [requestState, setRequestState] = useState<"none" | "pending" | "accepted" | "declined">("none");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["discoverable-game", gameId],
    queryFn: () => fetchGameDetail(gameId),
    enabled: !!gameId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (data?.requestStatus) {
      setRequestState(data.requestStatus);
    }
  }, [data?.requestStatus]);

  const joinMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/game/campaigns/${gameId}/join-requests`, {
        message: requestMessage.trim() || undefined,
      });
    },
    onSuccess: () => {
      setRequestState("pending");
    },
  });

  const joinLabel = useMemo(() => {
    if (requestState === "pending") return "Request Pending";
    if (requestState === "accepted") return "Joined";
    if (requestState === "declined") return "Request Declined";
    return data?.joinPolicy === "open" ? "Join Game" : "Request to Join";
  }, [data?.joinPolicy, requestState]);

  if (isLoading) {
    return (
      <div className={styles.stateCard}>
        <h1>Loading game...</h1>
        <p>Pulling the campaign overview together.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.stateCard}>
        <h1>Game not found</h1>
        <p>That campaign either moved, vanished, or never existed in the first place.</p>
        <Link href="/games" className={styles.backLink}>
          Back to games
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link href="/games" className={styles.backLink}>
        ← Back to games
      </Link>

      {isError ? (
        <div className={styles.notice}>
          Live detail fetch failed, so this page is using placeholder data while you build the frontend.
        </div>
      ) : null}

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Campaign Overview</p>
          <h1 className={styles.title}>{data.name}</h1>
          <p className={styles.subtitle}>{data.pitch || "No campaign pitch yet."}</p>

          <div className={styles.metaRow}>
            <span className={styles.pill}>{data.settingKey ?? "No setting"}</span>
            <span className={styles.pill}>
              {data.playerCount}
              {data.maxPlayers ? ` / ${data.maxPlayers}` : ""} players
            </span>
            <span className={styles.pill}>Storyweaver · {data.storyweaverName}</span>
            <span className={styles.pill}>{data.joinPolicy === "open" ? "Open Join" : "Approval Required"}</span>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <main className={styles.mainColumn}>
          <section className={styles.panel}>
            <h2>About this game</h2>
            <p>{data.summary || "No summary has been written yet."}</p>
          </section>

          <section className={styles.panel}>
            <h2>Table expectations</h2>
            <p>
              {data.tableExpectations ||
                "No expectations have been published yet. A little mystery is fun. A total vacuum is less fun."}
            </p>
          </section>

          <section className={styles.panel}>
            <h2>Tone modules</h2>
            <div className={styles.chipRow}>
              {data.toneModules.length > 0 ? (
                data.toneModules.map((tone) => (
                  <span key={tone} className={styles.chip}>
                    {tone}
                  </span>
                ))
              ) : (
                <span className={styles.empty}>No tone modules listed yet</span>
              )}
            </div>
          </section>
        </main>

        <aside className={styles.sideColumn}>
          <section className={styles.joinCard}>
            <div className={styles.joinCardTop}>
              <h2>Join this game</h2>
              <p>
                Send a request to the Storyweaver. Once accepted, the player can attach a character to the campaign.
              </p>
            </div>

            <label className={styles.messageField}>
              <span>Message to Storyweaver</span>
              <textarea
                value={requestMessage}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="Hey, this campaign looks like exactly my kind of bad decision."
                rows={5}
                disabled={requestState === "pending" || requestState === "accepted"}
              />
            </label>

            <button
              type="button"
              className={styles.joinButton}
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending || requestState === "pending" || requestState === "accepted"}
            >
              {joinMutation.isPending ? "Submitting..." : joinLabel}
            </button>

            {joinMutation.isError ? (
              <p className={styles.errorText}>Join request failed. The backend probably hasn’t grown this limb yet.</p>
            ) : null}

            {requestState === "pending" ? <p className={styles.helperText}>Your request is pending review.</p> : null}

            {requestState === "accepted" ? (
              <p className={styles.helperText}>You’ve been accepted. Next step: attach a character to the campaign.</p>
            ) : null}
          </section>

          <section className={styles.panel}>
            <h2>Quick facts</h2>
            <ul className={styles.factList}>
              <li>Status: {data.status ?? "active"}</li>
              <li>Join policy: {data.joinPolicy ?? "approval"}</li>
              <li>Current players: {data.playerCount}</li>
              <li>
                Open seats:{" "}
                {typeof data.maxPlayers === "number" ? Math.max(data.maxPlayers - data.playerCount, 0) : "—"}
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
