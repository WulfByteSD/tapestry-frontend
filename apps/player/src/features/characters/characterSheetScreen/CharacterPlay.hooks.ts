'use client';
import { useState } from 'react';
import type { AspectSelection, SheetAction } from './CharacterSheet.types';
export function useCharacterPlay() {
  const [action, setAction] = useState<SheetAction | null>(null);
  const [aspect, setAspect] = useState<AspectSelection | null>(null);
  function openApproach(selection: AspectSelection) { setAspect(selection); setAction('approach'); }
  return { action, aspect, openAction: setAction, openApproach, close: () => setAction(null) };
}

export function useAspectDisclosure() {
  const [expanded, setExpanded] = useState(false);
  return { expanded, toggle: () => setExpanded((value) => !value) };
}
