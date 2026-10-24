'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Loader, SelectField, TextField } from '@tapestry/ui';
import AuthoringMultiSelect from '@/features/authoring/AuthoringMultiSelect.component';
import { lookupApi } from './unwoven.lookups';
import { addOrigin, originChoices } from './unwoven.rules';
import type { FormProps } from './unwoven.types';
import styles from './Unwoven.module.scss';

export function SettingsPicker({ draft, onChange, disabled }: FormProps) {
  const query = useQuery({ queryKey: ['unwoven', 'settings'], queryFn: lookupApi.settings, retry: false });
  const available = query.data ?? [], unknown = draft.settingKeys.filter(key => !available.some(s => s.key === key));
  return <section>{query.isPending && <Loader caption="Loading settings." />}{query.isError && <p role="alert">Settings could not be loaded. Existing selections are preserved. <Button type="button" variant="ghost" onClick={() => void query.refetch()}>Retry settings</Button></p>}
    <AuthoringMultiSelect id="settingKeys" label="Settings" value={draft.settingKeys} options={[...available.map(s => ({ value: s.key, label: `${s.name}${s.status === 'archived' ? ' (archived)' : ''}`, disabled: s.status === 'archived' })), ...unknown.map(value => ({ value, label: `${value} (saved; unavailable)`, disabled: true }))]} disabled={disabled || !query.isSuccess} onChange={settingKeys => onChange({ ...draft, settingKeys })} hint="Select existing settings. Saved unavailable values stay until you explicitly remove them." />
    {query.isSuccess && !available.length && <p>No settings are available. Create a setting in Settings management before selecting it here.</p>}</section>;
}
export function OriginPicker({ draft, onChange, disabled }: FormProps) {
  const [custom, setCustom] = useState('');
  const catalog = useQuery({ queryKey: ['unwoven', 'origins'], queryFn: lookupApi.origins, retry: false });
  const values = draft.origins ?? (draft.origin ? [draft.origin] : []);
  const update = (origins: string[]) => onChange({ ...draft, origins, origin: origins.join(' / ') });
  return <section>{catalog.isPending && <Loader caption="Loading catalog origins." />}{catalog.isError && <p role="alert">Catalog origins could not be loaded. Saved tags and guide suggestions remain available. <Button type="button" variant="ghost" onClick={() => void catalog.refetch()}>Retry origins</Button></p>}<AuthoringMultiSelect id="origins" label="Origins" value={values} options={originChoices(values, catalog.data ?? []).map(value => ({ value, label: value }))} onChange={update} disabled={disabled} hint="Guide suggestions and catalog tags. Add custom origins; existing spellings are preserved." />
    <div className={styles.actions}><TextField id="custom-origin" label="Custom origin" value={custom} disabled={disabled} onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (custom.trim()) { update(addOrigin(values, custom)); setCustom(''); } } }} /><Button type="button" variant="outline" disabled={disabled || !custom.trim()} onClick={() => { update(addOrigin(values, custom)); setCustom(''); }}>Add origin</Button></div></section>;
}
export function LorePicker({ draft, onChange, disabled }: FormProps) {
  const [search, setSearch] = useState(''), [keyword, setKeyword] = useState(''), [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['unwoven', 'lore', keyword, page], queryFn: () => lookupApi.lore(keyword, page), retry: false });
  const selected = useQuery({ queryKey: ['unwoven', 'lore-node', draft.loreNodeId], queryFn: () => lookupApi.loreNode(draft.loreNodeId!), enabled: !!draft.loreNodeId, retry: false });
  return <section className={styles.fields}><h3>Lore connection</h3>{draft.loreNodeId && <div className={styles.actions}><span>{selected.isPending ? 'Loading selected lore…' : selected.data?.name ?? 'Saved lore reference (unavailable; preserved)'}</span><Button type="button" variant="ghost" disabled={disabled} onClick={() => onChange({ ...draft, loreNodeId: null })}>Clear lore connection</Button>{selected.isError && <Button type="button" variant="ghost" onClick={() => void selected.refetch()}>Retry selected lore</Button>}</div>}
    <div className={styles.actions}><TextField id="lore-search" label="Search lore nodes" value={search} disabled={disabled} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setKeyword(search); setPage(1); } }} /><Button type="button" variant="outline" disabled={disabled} onClick={() => { setKeyword(search); setPage(1); }}>Search lore</Button></div>
    {query.isPending ? <Loader caption="Loading lore nodes." /> : query.isError ? <p role="alert">Lore search is unavailable. Your current connection is unchanged. <Button type="button" onClick={() => void query.refetch()}>Retry lore search</Button></p> : <>
      <SelectField id="loreNodeId" label="Connect a lore node" disabled={disabled || !query.data.payload.length} value={query.data.payload.some(n => n._id === draft.loreNodeId) ? draft.loreNodeId ?? '' : ''} options={[{ value: '', label: query.data.payload.length ? 'Choose a search result' : 'No matching lore nodes' }, ...query.data.payload.map(node => ({ value: node._id, label: `${node.name} · ${node.settingKey} · ${node.kind}` }))]} onChange={e => { if (e.target.value) onChange({ ...draft, loreNodeId: e.target.value }); }} />
      <div className={styles.actions}><Button type="button" variant="ghost" disabled={disabled || page <= 1} onClick={() => setPage(page - 1)}>Previous lore</Button><span>Page {page}</span><Button type="button" variant="ghost" disabled={disabled || page >= (query.data.metadata?.pages ?? 1)} onClick={() => setPage(page + 1)}>Next lore</Button></div></>}
  </section>;
}
