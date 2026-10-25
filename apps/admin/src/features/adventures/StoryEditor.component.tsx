'use client';

import { useState } from 'react';
import { Button, Checkbox, SelectField, TextField } from '@tapestry/ui';
import type { AdventureContent, StorySection } from './adventure.types';
import { moveSection, newId } from './adventure.helpers';
import AuthoringRichField from '@/features/authoring/AuthoringRichField.component';
import styles from './Adventures.module.scss';

export interface EditorPartProps {
  content: AdventureContent;
  onChange: (content: AdventureContent) => void;
  onRemove: (collection: 'sections' | 'resources' | 'encounters', id: string) => void;
}
export default function StoryEditor({ content, onChange, onRemove }: EditorPartProps) {
  const [selectedId, setSelectedId] = useState(content.sections[0]?.id ?? '');
  const selected = content.sections.find(s => s.id === selectedId) ?? content.sections[0];
  const update = (patch: Partial<StorySection>) => onChange({ ...content, sections: content.sections.map(s => s.id === selected.id ? { ...s, ...patch } : s) });
  const add = () => {
    const id = newId('section');
    onChange({ ...content, sections: [...content.sections, { id, title: 'Untitled section', storyText: '', storyweaverNotes: '', context: '', sortOrder: content.sections.length, resourceIds: [], encounterIds: [], links: [] }].map((section, sortOrder) => ({ ...section, sortOrder })) });
    setSelectedId(id);
  };
  const move = (direction: -1 | 1) => onChange(moveSection(content, selected.id, direction));
  const toggle = (key: 'resourceIds' | 'encounterIds', id: string, checked: boolean) => update({ [key]: checked ? [...selected[key], id] : selected[key].filter(value => value !== id) });
  return <>
    <div className={styles.sectionHeading}><div><h2>Shape the story</h2><p>Write scenes in any order. Links offer routes through the story, with room for skips and revisits.</p></div><Button onClick={add} disabled={content.sections.length >= 200}>Add section</Button></div>
    {!selected ? <div className={styles.empty}><h3>A story can begin anywhere.</h3><p>Add your first section when you are ready. You can save an adventure without one.</p></div> : <div className={styles.split}>
      <nav className={styles.outline} aria-label="Story sections">{content.sections.map((s, i) => <Button key={s.id} variant="ghost" tone="neutral" aria-current={s.id === selected.id ? 'true' : undefined} onClick={() => setSelectedId(s.id)}><span className={styles.ordinal}>{String(i + 1).padStart(2, '0')}</span>{s.title || 'Untitled section'}</Button>)}</nav>
      <div className={styles.fields} key={selected.id}>
        <div className={styles.actions}><span aria-live="polite">Position {content.sections.findIndex(s => s.id === selected.id) + 1} of {content.sections.length}</span><Button variant="outline" tone="neutral" disabled={content.sections[0].id === selected.id} onClick={() => move(-1)}>Move earlier</Button><Button variant="outline" tone="neutral" disabled={content.sections.at(-1)?.id === selected.id} onClick={() => move(1)}>Move later</Button></div>
        <TextField id="section-title" label="Section title" maxLength={200} value={selected.title} onChange={e => update({ title: e.target.value })} />
        <AuthoringRichField id="section-context" label="Scene context" hint="What should the Storyweaver know before entering this section?" maxLength={100000} value={selected.context} onChange={value => update({ context: value })} />
        <AuthoringRichField id="section-story" label="Story text" hint="Private adventure reference. To share a passage with players later, add a player-shareable Story text resource." maxLength={100000} value={selected.storyText} onChange={value => update({ storyText: value })} />
        <details className={styles.disclosure}><summary>Private Storyweaver notes{selected.storyweaverNotes ? ' · added' : ''}</summary><AuthoringRichField id="section-notes" label="Storyweaver notes" maxLength={100000} value={selected.storyweaverNotes} onChange={value => update({ storyweaverNotes: value })} /></details>
        <section className={styles.group}><h3>Where can the story go?</h3><p>Links describe possibilities. They do not lock progression or require completion.</p>
          {selected.links.map((link, index) => <div className={styles.linkRow} key={index}>
            <SelectField id={`link-target-${index}`} label="Destination" value={link.sectionId} options={content.sections.map(s => ({ value: s.id, label: s.title }))} onChange={e => update({ links: selected.links.map((l, i) => i === index ? { ...l, sectionId: e.target.value } : l) })} />
            <TextField id={`link-label-${index}`} label="Link label" maxLength={200} value={link.label} onChange={e => update({ links: selected.links.map((l, i) => i === index ? { ...l, label: e.target.value } : l) })} />
            <AuthoringRichField id={`link-context-${index}`} label="When this route makes sense" maxLength={100000} value={link.context} onChange={value => update({ links: selected.links.map((l, i) => i === index ? { ...l, context: value } : l) })} />
            <Button variant="ghost" tone="danger" onClick={() => update({ links: selected.links.filter((_, i) => i !== index) })}>Remove link {index + 1}</Button>
          </div>)}
          <Button variant="outline" disabled={selected.links.length >= 200} onClick={() => update({ links: [...selected.links, { sectionId: content.sections.find(s => s.id !== selected.id)?.id ?? selected.id, label: 'Continue the story', context: '' }] })}>Add story link</Button>
        </section>
        <details className={styles.disclosure}><summary>Contextual resources · {selected.resourceIds.length}</summary><p>Choose any materials that help run this section. They stay reusable throughout this adventure.</p><div className={styles.checks}>{content.resources.map(r => <Checkbox key={r.id} label={r.title} checked={selected.resourceIds.includes(r.id)} onChange={checked => toggle('resourceIds', r.id, checked)} />)}{!content.resources.length && <p>Add optional materials in Resources, then associate them here.</p>}</div></details>
        <details className={styles.disclosure}><summary>Recommended encounters · {selected.encounterIds.length}</summary><div className={styles.checks}>{content.encounters.map(e => <Checkbox key={e.id} label={e.title} checked={selected.encounterIds.includes(e.id)} onChange={checked => toggle('encounterIds', e.id, checked)} />)}{!content.encounters.length && <p>No recommendations yet. Add one in Encounters when useful.</p>}</div></details>
        <Button variant="ghost" tone="danger" onClick={() => onRemove('sections', selected.id)}>Remove section</Button>
      </div>
    </div>}
  </>;
}
