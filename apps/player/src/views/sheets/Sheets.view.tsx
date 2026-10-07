"use client";
import type { CharacterSheet } from "@tapestry/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Sheets.module.scss";
import { Button, Card, CardBody, CardHeader, Loader, TextField } from "@tapestry/ui";
import SheetCard from "@/components/sheetCard/SheetCard.component";
import { useCharacterSheetsQuery } from "@/lib/character-hooks";
import { useProfile } from "@tapestry/hooks";
import { api } from "@/lib/api";
import { useMe } from "@/lib/auth-hooks";

export default function SheetsView() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const meQuery = useMe();
  const profileQuery = useProfile(api, meQuery.data, "player");
  const profile = profileQuery.data;

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const sheetsQuery = useCharacterSheetsQuery({
    keyword: keyword || undefined,
    pageNumber: 1,
    pageLimit: 50,
    sortOptions: "-updatedAt",
    filterOptions: `player;${profile?.payload?._id}`,
  });

  const sheets: CharacterSheet[] = sheetsQuery.data?.payload ?? [];
  const profileReady = !!profile?.payload?._id;
  const isLoading = meQuery.isLoading || profileQuery.isLoading || (profileReady && sheetsQuery.isPending);
  const hasError = meQuery.isError || profileQuery.isError || (!isLoading && !profileReady) || sheetsQuery.isError;
  const isSearching = query.trim() !== keyword;
  const isBusy = isLoading || isSearching || sheetsQuery.isFetching;
  const isFirstCharacter = !hasError && !isBusy && !keyword && sheets.length === 0;

  function clearSearch() {
    setQuery("");
    setKeyword("");
  }

  function retry() {
    if (meQuery.isError || !meQuery.data?.profileRefs?.player) {
      void meQuery.refetch();
    } else if (profileQuery.isError || !profileReady) {
      void profileQuery.refetch();
    } else {
      void sheetsQuery.refetch();
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Sheets</h1>
          <p className={styles.subTitle}>Your characters, ready to play.</p>
        </div>
        {!isFirstCharacter && (
          <div className={styles.actions}>
            <Button tone="gold" variant="solid" onClick={() => router.push("/characters/new")}>
              New Character
            </Button>
          </div>
        )}
      </div>

      <div className={styles.searchRow}>
        <TextField
          className={styles.searchField}
          id="sheetSearch"
          label="Search characters"
          placeholder="Search characters…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.searchStatus}>
          {!isLoading && isBusy && (
            <Loader size="sm" layout="inline" label={isSearching || keyword ? "Searching characters…" : "Refreshing characters…"} />
          )}
        </div>
      </div>

      <section className={styles.results} aria-label="Character sheets" aria-busy={isBusy}>
        {hasError && (
          <Card className={sheets.length ? styles.errorNotice : styles.emptyCard} inlay={false}>
            <CardHeader className={styles.emptyHeader}>
              <h2 className={styles.emptyTitle}>{sheets.length ? "Characters couldn’t be refreshed" : "Characters couldn’t be loaded"}</h2>
              <p className={styles.emptySub}>Please try again in a moment.</p>
            </CardHeader>
            <CardBody className={styles.emptyBody}>
              <Button tone="gold" variant="outline" onClick={retry} disabled={isBusy}>Try Again</Button>
            </CardBody>
          </Card>
        )}
        {isLoading && !sheets.length ? (
          <div className={styles.loadingState}>
            <Loader size="lg" tone="gold" label="Loading your characters…" caption="Getting your sheets ready." />
          </div>
        ) : sheets.length > 0 ? (
          <div className={styles.grid}>
            {sheets.map((c: CharacterSheet) => (
              <SheetCard key={c._id} character={c} />
            ))}
          </div>
        ) : !hasError && !isBusy ? (
          <Card className={styles.emptyCard} inlay={false}>
            <CardHeader className={styles.emptyHeader}>
              <h2 className={styles.emptyTitle}>{keyword ? "No matching characters" : "Your first character starts here"}</h2>
              <p className={styles.emptySub}>
                {keyword ? <>No characters match “{keyword}”. Try another name or clear your search.</> : "Create a character and keep their story close. Your character sheets will appear here."}
              </p>
            </CardHeader>
            <CardBody className={styles.emptyBody}>
              {keyword ? (
                <Button tone="gold" variant="outline" onClick={clearSearch}>Clear Search</Button>
              ) : (
                <Button tone="gold" onClick={() => router.push("/characters/new")}>Create Your First Character</Button>
              )}
            </CardBody>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
