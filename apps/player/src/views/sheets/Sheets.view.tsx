"use client";
import type { CharacterSheet } from "@tapestry/types";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Sheets.module.scss";
import { Button, Card, CardBody, CardHeader, TextField } from "@tapestry/ui";
import SheetCard from "@/components/sheetCard/SheetCard.component";
import { useCharacterSheetsQuery } from "@/lib/character-hooks";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export default function SheetsView() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 1000);

  const { data, isLoading } = useCharacterSheetsQuery({
    keyword: debounced || undefined,
    pageNumber: 1,
    pageLimit: 50,
    sortOptions: "-updatedAt",
    // pass filterOptions/includeOptions here.
  });

  const sheets: CharacterSheet[] = data?.payload ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Sheets</h1>
          <p className={styles.subTitle}>Your characters, ready to play.</p>
        </div>

        <div className={styles.actions}>
          <Button
            tone="gold"
            variant="solid"
            onClick={() => router.push("/characters/new")} // create this route next
          >
            New Character
          </Button>
        </div>
      </div>

      <div className={styles.searchRow}>
        <TextField
          id="sheetSearch"
          label="Search"
          placeholder="Search characters…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {sheets.length === 0 ? (
        <Card className={styles.emptyCard}>
          <CardHeader className={styles.emptyHeader}>
            <div className={styles.emptyTitle}>No characters found</div>
            <div className={styles.emptySub}>
              {sheets.length === 0 ? "Create your first character to get started." : "Try a different search."}
            </div>
          </CardHeader>

          <CardBody className={styles.emptyBody}>
            {sheets.length === 0 ? (
              <Button tone="gold" fullWidth onClick={() => router.push("/characters/new")}>
                Create Character
              </Button>
            ) : (
              <Button tone="purple" variant="outline" fullWidth onClick={() => setQuery("")}>
                Clear Search
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className={styles.grid}>
          {sheets.map((c: CharacterSheet) => (
            <SheetCard key={c._id} character={c} />
          ))}
        </div>
      )}
    </div>
  );
}
