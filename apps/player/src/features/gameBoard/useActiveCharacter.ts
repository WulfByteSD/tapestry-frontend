import { useEffect, useMemo, useState } from 'react';
import type { CharacterSheet } from '@tapestry/types';
import { useCampaignCharacters } from '@/lib/character-hooks';

/**
 * Per-campaign localStorage key for active character selection
 */
function getStorageKey(campaignId: string): string {
  return `tapestry:activeCharacter:${campaignId}`;
}

/**
 * Read active character ID from localStorage
 */
function readFromStorage(campaignId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(getStorageKey(campaignId));
  } catch {
    return null;
  }
}

/**
 * Write active character ID to localStorage
 */
function writeToStorage(campaignId: string, characterId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(campaignId);
    if (characterId === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, characterId);
    }
  } catch {
    // Silent fail for localStorage errors
  }
}

/**
 * Hook for managing active character selection within a campaign.
 *
 * - Persists selection in localStorage per campaign
 * - Defaults to null (no character / "as self" mode)
 * - Auto-validates that selected character is still attached to campaign
 * - Clears selection if character is detached
 * - Filters characters by ownership (players see only their own, SW sees all)
 *
 * @param campaignId - The campaign ID to scope the selection to
 * @param currentUserId - The current user's ID for ownership filtering
 * @param isSW - Whether the current user is a Storyweaver (SW or co-SW)
 * @returns Active character state and setters
 */
export function useActiveCharacter(campaignId: string, currentUserId: string | undefined, isSW: boolean) {
  const { data: allCharacters = [], isLoading } = useCampaignCharacters(campaignId);

  // Filter characters based on ownership
  // SW/co-SW see all characters, regular players see only their own
  const characters = useMemo(() => {
    if (!currentUserId) return [];
    if (isSW) return allCharacters as CharacterSheet[];
    return (allCharacters as CharacterSheet[]).filter((char) => char.player === currentUserId);
  }, [allCharacters, currentUserId, isSW]);

  // Initialize from localStorage
  const [activeCharacterId, setActiveCharacterIdState] = useState<string | null>(() => readFromStorage(campaignId));

  // Validate that active character is still in the campaign and accessible to user
  useEffect(() => {
    if (isLoading || !activeCharacterId || !currentUserId) return;

    const isStillAttached = characters.some((char) => char._id === activeCharacterId);

    // Clear selection if character was detached
    if (!isStillAttached) {
      setActiveCharacterIdState(null);
      writeToStorage(campaignId, null);
    }
  }, [activeCharacterId, characters, isLoading, campaignId, currentUserId]);

  // Find the active character data
  const activeCharacter = useMemo(() => {
    if (!activeCharacterId) return null;
    return characters.find((char) => char._id === activeCharacterId) ?? null;
  }, [activeCharacterId, characters]);

  // Setter that persists to localStorage
  const setActiveCharacter = (characterId: string | null) => {
    setActiveCharacterIdState(characterId);
    writeToStorage(campaignId, characterId);
  };

  // Convenience method to clear selection
  const clearActiveCharacter = () => {
    setActiveCharacter(null);
  };

  return {
    /** ID of the currently selected character, or null for "as self" mode */
    activeCharacterId,
    /** Full character data for the active character, or null */
    activeCharacter,
    /** Set the active character by ID, or null to clear */
    setActiveCharacter,
    /** Clear the active character selection (return to "as self") */
    clearActiveCharacter,
    /** Whether character data is still loading */
    isLoading,
    /** Characters accessible to this user (filtered by ownership) */
    characters,
  };
}
