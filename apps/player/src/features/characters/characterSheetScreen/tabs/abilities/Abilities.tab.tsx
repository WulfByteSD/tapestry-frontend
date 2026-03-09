"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, CardHeader } from "@tapestry/ui";
import { api } from "@/lib/api";
import { getAbilitiesForSetting } from "@tapestry/api-client";
import type { AbilityDefinition, CharacterLearnedAbility, CharacterSheet } from "@tapestry/types";
import { useUpdateCharacterSheetMutation } from "../../characterSheet.mutations";
import { AbilityLibraryModal } from "./AbilityLibrary.modal";
import styles from "./AbilitiesTab.module.scss";

type Props = {
  sheet: CharacterSheet;
  mode: "build" | "play";
};

export function AbilitiesTab({ sheet }: Props) {
  const update = useUpdateCharacterSheetMutation(sheet._id);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const learnedAbilities = sheet.sheet.learnedAbilities ?? [];
  const effectiveAbilities = sheet.derived?.effectiveAbilities ?? [];

  const abilitiesQuery = useQuery({
    queryKey: ["content:abilities", sheet.settingKey],
    enabled: !!sheet.settingKey,
    queryFn: () => getAbilitiesForSetting(api, sheet.settingKey!),
  });

  const abilityDefinitions = abilitiesQuery.data?.payload ?? [];

  const learnedKeys = new Set(learnedAbilities.map((entry: CharacterLearnedAbility) => entry.abilityKey));

  const learnedEffective = effectiveAbilities.filter((entry) => entry.sourceType === "learned");
  const itemGrantedEffective = effectiveAbilities.filter((entry) => entry.sourceType === "item");

  function persistLearnedAbilities(nextLearned: CharacterLearnedAbility[], settingKey?: string) {
    const payload: Record<string, unknown> = {
      "sheet.learnedAbilities": nextLearned,
    };

    if (!sheet.settingKey && settingKey) {
      payload.settingKey = settingKey;
    }

    update.mutate(payload);
  }

  function handleAddAbility(ability: AbilityDefinition, settingKey: string) {
    if (learnedKeys.has(ability.key)) {
      setLibraryOpen(false);
      return;
    }

    const nextLearned = [
      ...learnedAbilities,
      {
        abilityId: ability._id,
        abilityKey: ability.key,
        sourceType: "learned" as const,
      },
    ];

    persistLearnedAbilities(nextLearned, settingKey);
    setLibraryOpen(false);
  }

  function handleRemoveLearned(abilityKey: string) {
    const nextLearned = learnedAbilities.filter((entry) => entry.abilityKey !== abilityKey);
    persistLearnedAbilities(nextLearned);
  }

  // render learned + granted groups here
  return <></>;
}
