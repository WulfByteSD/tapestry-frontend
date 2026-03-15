"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import styles from "./Games.module.scss";

type DiscoverableGame = {
  id: string;
  name: string;
  storyweaverName: string;
  settingKey?: string;
  toneModules: string[];
  playerCount: number;
  maxPlayers?: number | null;
  pitch?: string;
  coverImageUrl?: string;
  joinPolicy?: "open" | "approval" | "invite_only";
  status?: string;
};

const MOCK_GAMES: DiscoverableGame[] = [
  {
    id: "ashen-road",
    name: "The Ashen Road",
    storyweaverName: "Austin",
    settingKey: "woven-realms",
    toneModules: ["grim-journey", "mystery", "survival"],
    playerCount: 3,
    maxPlayers: 5,
    pitch:
      "A dying trade road, strange ember storms, and a kingdom pretending everything is fine. Normal fantasy behavior.",
    joinPolicy: "approval",
    status: "active",
  },
  {
    id: "glass-sea",
    name: "The Glass Sea",
    storyweaverName: "Marrow Vale",
    settingKey: "woven-realms",
    toneModules: ["exploration", "wonder", "danger"],
    playerCount: 2,
    maxPlayers: 4,
    pitch: "Sail fractured waters where memory and tide refuse to mind their own business.",
    joinPolicy: "open",
    status: "active",
  },
  {
    id: "everpine-shadows",
    name: "Shadows of Everpine",
    storyweaverName: "Kestrel Thorn",
    settingKey: "woven-realms",
    toneModules: ["dark-fantasy", "investigation", "folk-horror"],
    playerCount: 4,
    maxPlayers: 6,
    pitch: "Disappearances in Everpine point toward old roots, older oaths, and something hungry beneath the village.",
    joinPolicy: "approval",
    status: "active",
  },
];

function normalizeGame(raw: any): DiscoverableGame {
  return {
    id: String(raw?._id ?? raw?.id ?? crypto.randomUUID()),
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
    pitch: raw?.pitch ?? raw?.notes ?? raw?.summary ?? "",
    coverImageUrl: raw?.coverImageUrl ?? raw?.display?.coverImageUrl ?? undefined,
    joinPolicy: raw?.joinPolicy ?? "approval",
    status: raw?.status ?? "active",
  };
}

async function fetchDiscoverableGames(): Promise<DiscoverableGame[]> {
  try {
    const response = await api.get("/game/campaigns/public");
    const payload = Array.isArray(response?.data?.payload)
      ? response.data.payload
      : Array.isArray(response?.data)
        ? response.data
        : [];

    const normalized = payload
      .map(normalizeGame)
      .filter((game: any) => game.status !== "draft" && game.status !== "archived");

    return normalized.length > 0 ? normalized : MOCK_GAMES;
  } catch {
    return MOCK_GAMES;
  }
}

export default function GamesView() {
  const [search, setSearch] = useState("");
  const [settingFilter, setSettingFilter] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["discoverable-games"],
    queryFn: fetchDiscoverableGames,
    staleTime: 30_000,
  });

  const games = data ?? [];

  const settingOptions = useMemo(() => {
    const values = new Set<string>();

    games.forEach((game) => {
      if (game.settingKey) values.add(game.settingKey);
    });

    return ["all", ...Array.from(values)];
  }, [games]);

  const filteredGames = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return games.filter((game) => {
      const matchesSearch =
        !needle ||
        game.name.toLowerCase().includes(needle) ||
        game.storyweaverName.toLowerCase().includes(needle) ||
        (game.pitch ?? "").toLowerCase().includes(needle) ||
        (game.settingKey ?? "").toLowerCase().includes(needle) ||
        game.toneModules.some((tone) => tone.toLowerCase().includes(needle));

      const matchesSetting = settingFilter === "all" || game.settingKey === settingFilter;

      return matchesSearch && matchesSetting;
    });
  }, [games, search, settingFilter]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Games</p>
        <h1 className={styles.title}>Discover campaigns</h1>
        <p className={styles.subtitle}>
          Browse active tables, peek at their tone, and find a game worth ruining your sleep schedule for.
        </p>
      </section>

      <section className={styles.controls}>
        <label className={styles.searchWrap}>
          <span className={styles.controlLabel}>Search</span>
          <input
            className={styles.searchInput}
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, tone, setting, or Storyweaver"
          />
        </label>

        <label className={styles.filterWrap}>
          <span className={styles.controlLabel}>Setting</span>
          <select
            className={styles.select}
            value={settingFilter}
            onChange={(event) => setSettingFilter(event.target.value)}
          >
            {settingOptions.map((setting) => (
              <option key={setting} value={setting}>
                {setting === "all" ? "All settings" : setting}
              </option>
            ))}
          </select>
        </label>
      </section>

      {isLoading ? (
        <div className={styles.stateCard}>
          <h2>Loading games...</h2>
          <p>Pulling threads and seeing what tables are alive.</p>
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className={styles.stateCard}>
          <h2>Couldn’t load live games</h2>
          <p>
            The shelf is falling back to placeholder data so you can keep building the frontend without the API
            breathing down your neck.
          </p>
        </div>
      ) : null}

      {!isLoading && filteredGames.length === 0 ? (
        <div className={styles.stateCard}>
          <h2>No games found</h2>
          <p>Try a different search or setting filter.</p>
        </div>
      ) : null}

      {!isLoading && filteredGames.length > 0 ? (
        <section className={styles.grid}>
          {filteredGames.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`} className={styles.card}>
              <div className={styles.cardBackdrop}>
                {game.coverImageUrl ? <img className={styles.coverImage} src={game.coverImageUrl} alt="" /> : null}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                  <p className={styles.storyweaver}>Storyweaver · {game.storyweaverName}</p>
                  <span className={styles.joinPill}>
                    {game.joinPolicy === "open" ? "Open Join" : "Request Required"}
                  </span>
                </div>

                <div className={styles.titleBlock}>
                  <h2 className={styles.cardTitle}>{game.name}</h2>
                  <p className={styles.setting}>{game.settingKey ?? "No setting assigned"}</p>
                </div>

                <p className={styles.pitch}>{game.pitch || "No campaign pitch yet."}</p>

                <div className={styles.chipRow}>
                  {game.toneModules.length > 0 ? (
                    game.toneModules.slice(0, 4).map((tone) => (
                      <span key={tone} className={styles.chip}>
                        {tone}
                      </span>
                    ))
                  ) : (
                    <span className={styles.chipMuted}>No tone modules yet</span>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.playerMeta}>
                    {game.playerCount}
                    {game.maxPlayers ? ` / ${game.maxPlayers}` : ""} players
                  </span>
                  <span className={styles.enterCta}>View game</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : null}
    </div>
  );
}
