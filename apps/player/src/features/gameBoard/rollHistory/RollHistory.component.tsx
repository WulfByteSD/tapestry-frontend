'use client';

import { Button, Loader } from '@tapestry/ui';
import { TbDice, TbRefresh } from 'react-icons/tb';
import { useRollHistory, ROLLS_PER_PAGE } from './RollHistory.hooks';
import { rollError } from './RollHistory.helpers';
import { RollHistoryRow } from './RollHistoryRow.component';
import type { RollHistoryProps } from './RollHistory.types';
import styles from './RollHistory.module.scss';

export function RollHistory(props: RollHistoryProps) {
  const { query, data, page, setPage, refresh } = useRollHistory(props);
  const rolls = data?.payload ?? [];
  const metadata = data?.metadata;
  return (
    <section className={styles.history} aria-label="Campaign roll history">
      <header className={styles.header}><div><h2><TbDice aria-hidden="true" /> Rolls</h2><p>The table’s saved rolls, newest first.</p></div><Button type="button" variant="outline" size="sm" leftIcon={<TbRefresh aria-hidden="true" />} disabled={query.isFetching} onClick={refresh}>Refresh</Button></header>
      <div key={`${props.campaignId}:${props.currentUserId}:${page}`} className={styles.scroll} tabIndex={0} role="region" aria-label="Saved campaign rolls" aria-busy={query.isFetching}>
        {query.isPending ? <div className={styles.state}><Loader label="Loading saved rolls…" /></div> : query.isError ? <div className={styles.state} role="alert"><h3>Roll history unavailable</h3><p>{rollError(query.error)}</p><Button type="button" variant="outline" onClick={() => void query.refetch()}>Try again</Button></div> : !rolls.length ? <div className={styles.state}><h3>{page > 1 ? 'No rolls on this page' : 'The next roll starts the record'}</h3><p>{page > 1 ? 'Return to the latest rolls to see the current history.' : 'Saved rolls for this campaign will appear here. Use Quick Roll at the table to make a roll.'}</p>{page > 1 ? <Button type="button" variant="outline" onClick={() => setPage(1)}>Latest rolls</Button> : null}</div> : <ol className={styles.list}>{rolls.map((roll) => <RollHistoryRow key={roll._id} roll={roll} currentUserId={props.currentUserId} />)}</ol>}
      </div>
      <footer className={styles.footer}>
        <p aria-live="polite">{metadata ? metadata.totalCount === 0 ? 'No saved rolls' : `${rolls.length ? `${(page - 1) * ROLLS_PER_PAGE + 1}–${(page - 1) * ROLLS_PER_PAGE + rolls.length} of ` : ''}${metadata.totalCount} saved rolls` : query.isFetching ? 'Loading history…' : 'History unavailable'}</p>
        {metadata && metadata.pages > 1 && rolls.length > 0 ? <nav aria-label="Roll history pages"><Button type="button" variant="ghost" size="sm" disabled={page <= 1 || query.isFetching} onClick={() => setPage(page - 1)}>Newer</Button><span>Page {page} of {metadata.pages}</span><Button type="button" variant="ghost" size="sm" disabled={page >= metadata.pages || query.isFetching} onClick={() => setPage(page + 1)}>Older</Button></nav> : null}
        <small>Names reflect current profiles. Saved rolls are retained for 90 days.</small>
      </footer>
    </section>
  );
}
