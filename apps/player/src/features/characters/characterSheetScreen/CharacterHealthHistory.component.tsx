import { useInfiniteQuery } from '@tanstack/react-query';
import { Button, Loader } from '@tapestry/ui';
import { getCharacterHealthAudit } from '@tapestry/api-client';
import { useProfile } from '@tapestry/hooks/src/useProfile';
import { useMe } from '@/lib/auth-hooks';
import { api } from '@/lib/api';
import type { CharacterHealthHistoryProps } from './CharacterSheet.types';
import styles from './CharacterHealthHistory.module.scss';

export function CharacterHealthHistory({ sheet }: CharacterHealthHistoryProps) {
  const { data: me } = useMe();
  const profile = useProfile(api, me, 'player');
  const playerId = profile.data?.payload._id;
  const owner = !!playerId && playerId === sheet.player;
  const query = useInfiniteQuery({ queryKey: ['character-health-audit', sheet._id, playerId], queryFn: ({ pageParam }) => getCharacterHealthAudit(api, sheet._id, pageParam), initialPageParam: undefined as string | undefined, getNextPageParam: page => page.payload.nextCursor ?? undefined, enabled: owner, retry: false });
  if (profile.isLoading) return <Loader label="Checking your character…" />;
  if (!owner) return <p className={styles.muted}>Encounter health history is available to this character’s owner.</p>;
  const entries = query.data?.pages.flatMap(page => page.payload.items) ?? [];
  return <section className={styles.history} aria-label="Encounter health history"><h3>Encounter health history</h3><p className={styles.muted}>Health and condition changes applied by a Storyweaver. Private scene details appear only while you have access.</p>{query.isLoading ? <Loader label="Loading health history…" /> : query.isError ? <div role="alert"><p>History could not be loaded.</p><Button variant="outline" onClick={() => void query.refetch()}>Retry</Button></div> : !entries.length ? <p className={styles.muted}>No encounter health changes recorded yet.</p> : <ol className={styles.entries}>{entries.map(entry => <li key={entry.id}><header><strong>{entry.action.replace(/_/g, ' ')}</strong><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time></header><p>{entry.actorName ?? 'Storyweaver'}{entry.sourceLabel ? ` · ${entry.sourceLabel}` : ''}{entry.encounterTitle ? ` · ${entry.encounterTitle}` : ''}{entry.sceneTitle ? ` / ${entry.sceneTitle}` : ''}</p><p>HP <strong>{entry.before.hp.current}/{entry.before.hp.max} → {entry.after.hp.current}/{entry.after.hp.max}</strong> · Temporary HP {entry.before.hp.temp} → {entry.after.hp.temp}</p>{entry.calculation && <p className={styles.muted}>Incoming harm {entry.calculation.incomingHarm} − Protection {entry.calculation.protection} = Effective harm {entry.calculation.effectiveHarm} · Temporary HP absorbed {entry.calculation.tempAbsorbed}{entry.calculation.allowBlockedWithoutCondition ? ' · Applied without a condition by explicit confirmation' : ''}</p>}<p className={styles.muted}>Conditions: {entry.before.conditions.map(condition => condition.label ?? condition.key).join(', ') || 'None'} → {entry.after.conditions.map(condition => condition.label ?? condition.key).join(', ') || 'None'}</p>{entry.notes && <p>{entry.notes}</p>}{entry.correctionOf && <p className={styles.muted}>Correction of a previous change.</p>}</li>)}</ol>}{query.hasNextPage && <Button variant="outline" isLoading={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>Load older changes</Button>}</section>;
}
