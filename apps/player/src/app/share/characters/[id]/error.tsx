'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@tapestry/ui';
import { PublicSheetState } from '@/features/characters/publicCharacterSheet/PublicSheetState';

export default function SharedCharacterError({ reset }: { reset: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <PublicSheetState title="Character sheet unavailable" message="The character sheet could not be reached. Please try again in a moment.">
      <Button variant="outline" onClick={retry} isLoading={isPending}>{isPending ? 'Trying again…' : 'Try again'}</Button>
    </PublicSheetState>
  );
}
