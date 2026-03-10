import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CharacterSheet } from "@tapestry/types";
import { api, tokenStore } from "@/lib/api";
import { cleanParams, listCharacters, type ListQueryParams } from "@tapestry/api-client";
import { useMe } from "./auth-hooks";
import { useProfile } from "@tapestry/hooks/src/useProfile";
 
export function useCharacterSheetsQuery(params: ListQueryParams = {}) {
  const cleaned = useMemo(() => cleanParams(params), [params]);
  const { data: me } = useMe();
  const { data: profile } = useProfile(api, me, "player");

  return useQuery({
    queryKey: ["characters", cleaned],
    queryFn: () => listCharacters<CharacterSheet>(api, cleaned),
    enabled: !!profile,          // don’t hammer 401s if user isn’t logged in
    staleTime: 30_000,
    retry: 1,
  });
}