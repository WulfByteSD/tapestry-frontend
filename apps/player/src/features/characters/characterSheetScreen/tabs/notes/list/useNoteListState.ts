// tabs/notes/list/useNoteListState.ts
"use client";

import { useEffect, useState } from "react";
import type { NoteCardKind } from "@tapestry/types";
import { ALL_KIND, DEFAULT_PAGE_SIZE } from "../functions";

export type NoteListFilterKind = NoteCardKind | typeof ALL_KIND;

export type NoteListState = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  kindFilter: NoteListFilterKind;
  setKindFilter: (value: NoteListFilterKind) => void;
  pinnedOnly: boolean;
  setPinnedOnly: (value: boolean) => void;
  visibleCount: number;
  setVisibleCount: (value: number | ((prev: number) => number)) => void;
  clearFilters: () => void;
};

export function useNoteListState(): NoteListState {
  const [searchQuery, setSearchQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<NoteListFilterKind>(ALL_KIND);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(DEFAULT_PAGE_SIZE);
  }, [searchQuery, kindFilter, pinnedOnly]);

  function clearFilters() {
    setSearchQuery("");
    setKindFilter(ALL_KIND);
    setPinnedOnly(false);
  }

  return {
    searchQuery,
    setSearchQuery,
    kindFilter,
    setKindFilter,
    pinnedOnly,
    setPinnedOnly,
    visibleCount,
    setVisibleCount,
    clearFilters,
  };
}
