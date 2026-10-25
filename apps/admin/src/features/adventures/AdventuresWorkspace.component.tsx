'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Loader, SelectField, TextField } from '@tapestry/ui';
import { useMe } from '@/lib/auth-hooks';
import { adventureApi } from './adventure.api';
import { errorMessage } from './adventure.helpers';
import { AuthoringProse } from '@/features/authoring/AuthoringRichField.component';
import styles from './Adventures.module.scss';

export default function AdventuresWorkspace() {
  const { data: user } = useMe();
  const [page, setPage] = useState(0); const [search, setSearch] = useState(''); const [status, setStatus] = useState('');
  const query = useQuery({ queryKey: ['adventures', 'list', user?._id, page], queryFn: () => adventureApi.list(page), enabled: !!user, retry: false });
  const rows = query.data?.filter(a => (!status || a.status === status) && (!search || `${a.title} ${a.summary}`.toLowerCase().includes(search.toLowerCase()))) ?? [];
  return <div className={styles.workspace} data-adventure-workspace>
    <header className={styles.hero}><div><p className={styles.eyebrow}>Storyweaver workshop</p><h1>Adventures</h1><p>Build a world to step into. Gather its story, materials and encounter ideas, then publish when it is ready.</p></div><Link href="/adventures/new" className={styles.primaryLink}>Create adventure <span aria-hidden="true">→</span></Link></header>
    <section className={styles.indexSurface} aria-label="Adventure modules">
      <div className={styles.filters}><TextField id="adventure-search" label="Find on this page" value={search} onChange={e => setSearch(e.target.value)} /><SelectField id="adventure-status" label="Publication state" value={status} options={[{ value: '', label: 'All states on this page' }, { value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }]} onChange={e => setStatus(e.target.value)} /></div>
      {query.isPending ? <Loader caption="Loading adventure modules…" /> : query.isError ? <div className={styles.empty} role="alert"><h2>Adventures could not be loaded</h2><p>{errorMessage(query.error)}</p><Button onClick={() => void query.refetch()}>Retry</Button></div> : <>
        {!rows.length ? <div className={styles.empty}><h2>{query.data.length ? 'No matches on this page' : page ? 'No more adventures' : 'Your first adventure starts here'}</h2><p>{query.data.length ? 'Adjust the filters or browse another page.' : page ? 'Return to the previous page to keep browsing.' : 'Start with a title and an existing library module. Add sections and materials in whatever order works for you.'}</p>{!page && !query.data.length && <Link href="/adventures/new">Create your first adventure →</Link>}</div> : <ul className={styles.moduleList}>{rows.map(a => <li key={a._id}><div><p className={styles.eyebrow}>{a.status === 'published' ? 'Published access · draft available to edit' : a.status}</p><h2><Link href={`/adventures/${a._id}`}>{a.title}</Link></h2><AuthoringProse value={a.summary || ''} fallback="No summary added yet." /></div><Link href={`/adventures/${a._id}`} className={styles.editLink} aria-label={`Edit ${a.title}`}>Edit adventure <span aria-hidden="true">→</span></Link></li>)}</ul>}
        <footer className={styles.pagination}><p>Page {page + 1} · up to 50 adventures per page</p><div className={styles.actions}><Button variant="outline" disabled={page === 0 || query.isFetching} onClick={() => setPage(page - 1)}>Previous page</Button><Button variant="outline" disabled={query.data.length < 50 || query.isFetching || page >= 10000} onClick={() => setPage(page + 1)}>Next page</Button></div></footer>
      </>}
    </section>
    <p className={styles.footnote}>Each adventure belongs to one library module. Its existing Resource Access Grant covers the full adventure, including free claims through the existing product.</p>
  </div>;
}
