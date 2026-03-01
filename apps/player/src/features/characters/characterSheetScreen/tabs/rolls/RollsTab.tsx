"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getRolls } from "@tapestry/api-client";
import { RollResultCard, type RollResultData } from "@/components/rollResultCard/RollResultCard.component";
import { RollListItem } from "./RollListItem.component";
import { Button } from "@tapestry/ui";
import styles from "./RollsTab.module.scss";

interface Props {
  sheet: any;
}

export function RollsTab({ sheet }: Props) {
  const [selectedRoll, setSelectedRoll] = useState<RollResultData | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["rolls", sheet._id],
    queryFn: () =>
      getRolls(api, {
        filterOptions: `character;${sheet._id}`,
        pageLimit: 20,
        sortOptions: "-createdAt",
      }),
    enabled: !!sheet._id,
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Loading rolls...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Error loading rolls. Please try again.</div>
      </div>
    );
  }

  const rolls = data?.payload || [];

  if (selectedRoll) {
    return (
      <div className={styles.container}>
        <div className={styles.expandedView}>
          <Button
            onClick={() => setSelectedRoll(null)}
            variant="outline"
            className={styles.backButton}
          >
            ← Back to List
          </Button>
          <RollResultCard result={selectedRoll} />
        </div>
      </div>
    );
  }

  if (rolls.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          No rolls yet. Make your first roll from the Overview tab!
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.rollsList}>
        {rolls.map((roll: any) => (
          <RollListItem
            key={roll.rollId || roll._id}
            roll={roll}
            onClick={() => setSelectedRoll(roll)}
          />
        ))}
      </div>
    </div>
  );
}
