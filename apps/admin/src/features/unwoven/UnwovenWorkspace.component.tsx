'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Loader, SelectField, TextField } from '@tapestry/ui';
import { useMe } from '@/lib/auth-hooks';
import { unwovenApi } from './unwoven.api';
import { errorMessage } from './unwoven.helpers';
import { categories } from './UnwovenDetails.form';
import styles from './Unwoven.module.scss';
export default function UnwovenWorkspace() {
  const { data: user } = useMe();
  const [search, setSearch] = useState(''), [keyword, setKeyword] = useState(''), [page, setPage] = useState(1), [status, setStatus] = useState(''), [category, setCategory] = useState('');
  const query = useQuery({ queryKey: ['unwoven', 'list', user?._id, keyword, page, status, category], queryFn: () => unwovenApi.list(keyword, page, status, category), enabled: !!user, retry: false });
  return <div className={styles.workspace} data-unwoven-workspace><header className={styles.hero}><div><p className={styles.eyebrow}>The adversary catalog</p><h1>Unwoven</h1><p>Build the creatures, rivals, allies, and hazards that give your stories teeth. Find an existing entry or begin with a blank stat block.</p></div><Link className={styles.primaryLink} href="/unwoven/new">Create Unwoven <span aria-hidden>→</span></Link></header>
    <section className={styles.indexSurface} aria-label="Unwoven catalog"><form className={styles.filters} onSubmit={e => { e.preventDefault(); setPage(1); setKeyword(search.trim()); }}><TextField id="unwoven-search" label="Search name, key, or setting" value={search} onChange={e => setSearch(e.target.value)} /><Button type="submit" variant="outline">Search</Button><SelectField id="status-filter" label="Status" value={status} options={[{ value: '', label: 'All statuses' }, ...['draft', 'published', 'archived'].map(value => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))]} onChange={e => { setPage(1); setStatus(e.target.value); }} /><SelectField id="category-filter" label="Category" value={category} options={[{ value: '', label: 'All categories' }, ...categories]} onChange={e => { setPage(1); setCategory(e.target.value); }} /></form>
      {query.isPending ? <Loader caption="Loading Unwoven." /> : query.isError ? <div className={styles.empty} role="alert"><h2>The catalog could not load</h2><p>{errorMessage(query.error)}</p><Button onClick={() => void query.refetch()}>Retry catalog</Button></div> : <>
        {!query.data.payload.length ? <div className={styles.empty}><h2>{keyword || status || category ? 'No matching Unwoven' : 'The catalog is waiting'}</h2><p>Try another search or create a new entry.</p>{(keyword || status || category || page > 1) && <Button variant="outline" onClick={() => { setSearch(''); setKeyword(''); setStatus(''); setCategory(''); setPage(1); }}>Reset filters</Button>}</div> : <ul className={styles.catalog}>{query.data.payload.map(c => <li key={c._id}><div><p className={styles.eyebrow}>{c.status} · {c.category}{c.tier && ` · ${c.tier}`}</p><h2><Link href={`/unwoven/${c._id}`}>{c.name}</Link></h2><p>{[c.role, c.origin, c.settingKeys.join(', ')].filter(Boolean).join(' · ') || c.key}</p></div><div className={styles.rowStats}><span><strong>{c.statline.hp}</strong> HP</span><span><strong>{c.statline.defenseTN}</strong> Defense</span><span>{c.statline.harm}</span></div><Link className={styles.editLink} href={`/unwoven/${c._id}`}>Edit <span className={styles.srOnly}>{c.name}</span> →</Link></li>)}</ul>}
        <div className={styles.pagination}><p>{query.data.metadata?.totalCount ?? query.data.payload.length} {(query.data.metadata?.totalCount ?? query.data.payload.length) === 1 ? 'entry' : 'entries'} · Page {page} of {Math.max(1, query.data.metadata?.pages ?? 1)}</p><div className={styles.actions}><Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="ghost" disabled={page >= (query.data.metadata?.pages ?? 1)} onClick={() => setPage(page + 1)}>Next</Button></div></div>
      </>}
    </section><p className={styles.footnote}>Archived entries remain here so you can restore or revise them. Removing an entry permanently omits it from adventure recommendations.</p></div>;
}
