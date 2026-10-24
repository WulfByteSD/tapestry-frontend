'use client';

import { useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Button, Checkbox, Loader, TextField } from '@tapestry/ui';
import { adventureApi } from './adventure.api';
import { errorMessage, newId } from './adventure.helpers';
import type { Encounter } from './adventure.types';
import type { EditorPartProps } from './StoryEditor.component';
import AuthoringRichField from '@/features/authoring/AuthoringRichField.component';
import styles from './Adventures.module.scss';

export default function EncounterEditor({ content, onChange, onRemove }: EditorPartProps) {
  const [selectedId, setSelectedId] = useState(content.encounters[0]?.id ?? '');
  const [search, setSearch] = useState(''); const [keyword, setKeyword] = useState(''); const [page, setPage] = useState(1);
  const selected = content.encounters.find(e => e.id === selectedId) ?? content.encounters[0];
  const catalog = useQuery({ queryKey: ['adventures', 'combatants', keyword, page], queryFn: () => adventureApi.combatants(keyword, page), enabled: !!selected, retry: false });
  const referenced = useQueries({ queries: (selected?.combatants ?? []).map(c => ({ queryKey: ['adventures', 'combatant', c.combatantId], queryFn: () => adventureApi.combatant(c.combatantId), retry: false })) });
  const update = (patch: Partial<Encounter>) => onChange({ ...content, encounters: content.encounters.map(e => e.id === selected.id ? { ...e, ...patch } : e) });
  const add = () => { const id = newId('encounter'); onChange({ ...content, encounters: [...content.encounters, { id, title: 'Untitled encounter', notes: '', combatants: [] }] }); setSelectedId(id); };
  return <>
    <div className={styles.sectionHeading}><div><h2>Recommend an encounter</h2><p>Give the Storyweaver a starting point. Combatants and quantities are suggestions, never a required roster.</p></div><Button onClick={add} disabled={content.encounters.length >= 100}>Add encounter</Button></div>
    {!selected ? <div className={styles.empty}><h3>Conflict is optional.</h3><p>Add a recommendation when it serves the adventure.</p></div> : <div className={styles.split}>
      <nav className={styles.outline} aria-label="Encounter recommendations">{content.encounters.map(e => <Button key={e.id} variant="ghost" tone="neutral" aria-current={e.id === selected.id ? 'true' : undefined} onClick={() => setSelectedId(e.id)}>{e.title || 'Untitled encounter'}<small>{e.combatants.length} combatant entries</small></Button>)}</nav>
      <div className={styles.fields} key={selected.id}>
        <TextField id="encounter-title" label="Encounter title" maxLength={200} value={selected.title} onChange={e => update({ title: e.target.value })} />
        <AuthoringRichField id="encounter-notes" label="Storyweaver guidance" maxLength={100000} value={selected.notes} onChange={value => update({ notes: value })} />
        <section className={styles.group}><h3>Suggested combatants</h3>{!selected.combatants.length && <p>No combatants selected. Recommendations can start with notes alone.</p>}
          {selected.combatants.map((c, i) => referenced[i]?.data === null ? null : <div className={styles.combatantRow} key={c.combatantId}>
            <div><strong>{referenced[i]?.data?.name ?? 'Combatant reference'}</strong><p>{referenced[i]?.isPending ? 'Loading reference…' : referenced[i]?.isError ? 'Could not load this reference. Retry when the connection is available.' : referenced[i]?.data?.status === 'published' ? 'Published' : `${referenced[i]?.data?.status ?? 'Unknown status'} · must be published before this adventure`}</p>{referenced[i]?.isError && <Button variant="ghost" onClick={() => void referenced[i].refetch()}>Retry reference</Button>}</div>
            <TextField id={`quantity-${c.combatantId}`} type="number" min={1} max={1000} step={1} label="Suggested quantity" value={Number.isNaN(c.quantity) ? '' : c.quantity} onChange={e => update({ combatants: selected.combatants.map((entry, index) => index === i ? { ...entry, quantity: e.target.value === '' ? NaN : Number(e.target.value) } : entry) })} />
            <Button variant="ghost" tone="danger" aria-label={`Remove ${referenced[i]?.data?.name ?? 'combatant'}`} onClick={() => update({ combatants: selected.combatants.filter((_, index) => index !== i) })}>Remove</Button>
          </div>)}
        </section>
        <section className={styles.group}><h3>Choose from existing combatants</h3>
          <div className={styles.search}><TextField id="combatant-search" label="Find a combatant" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setPage(1); setKeyword(search); } }} /><Button variant="outline" onClick={() => { setPage(1); setKeyword(search); }}>Search</Button></div>
          {catalog.isPending ? <Loader caption="Loading combatants…" /> : catalog.isError ? <div role="alert"><p>{errorMessage(catalog.error)}</p><Button variant="outline" onClick={() => void catalog.refetch()}>Retry combatants</Button></div> : <>
            <ul className={styles.catalog}>{catalog.data.payload.filter(c => c.status !== 'archived').map(c => <li key={c._id}><div><strong>{c.name}</strong><p>{[c.category, c.tier, c.status].filter(Boolean).join(' · ')}</p></div><Button variant="outline" disabled={selected.combatants.some(entry => entry.combatantId === c._id) || selected.combatants.length >= 100} onClick={() => update({ combatants: [...selected.combatants, { combatantId: c._id, quantity: 1 }] })}>{selected.combatants.some(entry => entry.combatantId === c._id) ? 'Added' : 'Add'}</Button></li>)}</ul>
            {!catalog.data.payload.length && <p>No combatants found. Try a different name.</p>}
            <div className={styles.actions}><Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous combatants</Button><span>Page {page}</span><Button variant="ghost" disabled={page >= (catalog.data.metadata?.pages ?? page)} onClick={() => setPage(page + 1)}>Next combatants</Button></div>
          </>}
        </section>
        <details className={styles.disclosure}><summary>Recommend in sections · {content.sections.filter(s => s.encounterIds.includes(selected.id)).length}</summary><div className={styles.checks}>{content.sections.map(s => <Checkbox key={s.id} label={s.title} checked={s.encounterIds.includes(selected.id)} onChange={checked => onChange({ ...content, sections: content.sections.map(section => section.id === s.id ? { ...section, encounterIds: checked ? [...section.encounterIds, selected.id] : section.encounterIds.filter(id => id !== selected.id) } : section) })} />)}{!content.sections.length && <p>This recommendation can remain independent of a section.</p>}</div></details>
        <Button variant="ghost" tone="danger" onClick={() => onRemove('encounters', selected.id)}>Remove encounter</Button>
      </div>
    </div>}
  </>;
}
