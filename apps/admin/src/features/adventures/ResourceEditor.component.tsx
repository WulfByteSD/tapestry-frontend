'use client';

import { useState } from 'react';
import { Button, Checkbox, SelectField, TextField, Upload, type UploadFile } from '@tapestry/ui';
import type { Adventure, Material, MaterialKind } from './adventure.types';
import type { EditorPartProps } from './StoryEditor.component';
import { adventureApi } from './adventure.api';
import { downloadBlob, errorMessage, kinds, newId } from './adventure.helpers';
import AuthoringRichField from '@/features/authoring/AuthoringRichField.component';
import AuthoringListField from '@/features/authoring/AuthoringListField.component';
import styles from './Adventures.module.scss';

interface Props extends EditorPartProps {
  record?: Adventure;
  dirty: boolean;
  locked: boolean;
  mutate: (operation: () => Promise<Adventure | void>, message: string) => Promise<boolean>;
}
export default function ResourceEditor({ content, onChange, onRemove, record, dirty, locked, mutate }: Props) {
  const [selectedId, setSelectedId] = useState(content.resources[0]?.id ?? '');
  const [kind, setKind] = useState('');
  const [tag, setTag] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [fileError, setFileError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const selected = content.resources.find((r) => r.id === selectedId);
  const filtered = content.resources.filter(
    (r) =>
      (!kind || r.kind === kind) &&
      (!tag || r.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))) &&
      (!sectionId ||
        (sectionId === 'unassigned' ? !content.sections.some((s) => s.resourceIds.includes(r.id)) : content.sections.find((s) => s.id === sectionId)?.resourceIds.includes(r.id)))
  );
  const update = (patch: Partial<Material>) => {
    if (selected) onChange({ ...content, resources: content.resources.map((r) => (r.id === selected.id ? { ...r, ...patch } : r)) });
  };
  const choose = (id: string) => {
    setSelectedId(id);
    setFiles([]);
    setFileError('');
  };
  const add = () => {
    const id = newId('resource');
    setKind('');
    setTag('');
    setSectionId('');
    choose(id);
    onChange({ ...content, resources: [...content.resources, { id, title: 'Untitled resource', kind: 'handout', visibility: 'storyweaver', text: '', tags: [] }] });
  };
  const upload = async () => {
    const file = files[0]?.originFile;
    if (!record || !selected || !file || dirty || locked) return;
    if (await mutate(() => adventureApi.upload(record, selected.id, file), 'Protected attachment saved to the draft. Publish to update owner access.')) setFiles([]);
  };
  const download = async () => {
    if (!record || !selected || downloading) return;
    setDownloading(true);
    setFileError('');
    try {
      const blob = await adventureApi.download(record.id, selected.id);
      const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf' }[blob.type] ?? 'bin';
      downloadBlob(blob, `${selected.id}.${extension}`);
    } catch (error) {
      setFileError(errorMessage(error));
    } finally {
      setDownloading(false);
    }
  };
  return (
    <>
      <div className={styles.sectionHeading}>
        <div>
          <h2>A library for this adventure</h2>
          <p>Keep maps, handouts and passages together. Use each in as many sections as you need—or leave it unassigned.</p>
        </div>
        <Button onClick={add} disabled={content.resources.length >= 200}>
          Add resource
        </Button>
      </div>
      <div className={styles.filters}>
        <SelectField id="resource-kind-filter" label="Kind" value={kind} onChange={(e) => setKind(e.target.value)} options={[{ value: '', label: 'All kinds' }, ...kinds]} />
        <TextField id="resource-tag-filter" label="Filter tags" value={tag} onChange={(e) => setTag(e.target.value)} />
        <SelectField
          id="resource-section-filter"
          label="Section"
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          options={[{ value: '', label: 'All sections' }, { value: 'unassigned', label: 'Unassigned' }, ...content.sections.map((s) => ({ value: s.id, label: s.title }))]}
        />
      </div>
      <div className={styles.split}>
        <nav className={styles.outline} aria-label="Adventure resources">
          {filtered.map((r) => (
            <Button key={r.id} variant="ghost" tone="neutral" aria-current={selected?.id === r.id ? 'true' : undefined} onClick={() => choose(r.id)}>
              {r.title || 'Untitled resource'}
              <small>{kinds.find((k) => k.value === r.kind)?.label}</small>
            </Button>
          ))}
          {!filtered.length && <p>{content.resources.length ? 'No materials match these filters.' : 'No resources yet. Materials are optional.'}</p>}
        </nav>
        {!selected ? (
          <div className={styles.empty}>
            <h3>Materials with a purpose.</h3>
            <p>Select a resource to edit it, or add one when the story calls for it.</p>
          </div>
        ) : (
          <div className={styles.fields} key={selected.id}>
            {!filtered.some((r) => r.id === selected.id) && <p className={styles.note}>Editing “{selected.title}”, which is outside the current filter.</p>}
            <TextField id="material-title" label="Resource title" value={selected.title} maxLength={200} onChange={(e) => update({ title: e.target.value })} />
            <SelectField
              id="material-kind"
              label="Resource kind"
              options={kinds}
              value={selected.kind}
              disabled={!!selected.hasAsset}
              hint={selected.hasAsset ? 'Remove the draft attachment before changing its kind.' : undefined}
              onChange={(e) => {
                const kind = e.target.value as MaterialKind;
                update({ kind, ...(kind === 'storyweaver_note' ? { visibility: 'storyweaver' as const } : {}) });
                setFiles([]);
              }}
            />
            <SelectField
              id="material-visibility"
              label="Who is this material for?"
              value={selected.visibility}
              disabled={selected.kind === 'storyweaver_note'}
              options={[
                { value: 'storyweaver', label: 'Private · Storyweaver only' },
                { value: 'players', label: 'Can be shared with players' },
              ]}
              hint="Player-shareable resources still require an explicit campaign share. This editor does not share them."
              onChange={(e) => update({ visibility: e.target.value as Material['visibility'] })}
            />
            <AuthoringRichField
              id="material-text"
              label={selected.kind === 'storyweaver_note' ? 'Private notes' : 'Resource text'}
              maxLength={100000}
              value={selected.text}
              onChange={(value) => update({ text: value })}
            />
            <AuthoringListField id="material-tags" label="Tags" maxItems={30} maxLength={80} value={selected.tags} onChange={(tags) => update({ tags })} />
            {(selected.kind === 'map' || selected.kind === 'handout') && (
              <section className={styles.group}>
                <h3>Protected attachment</h3>
                <p>PNG, JPEG, WebP or PDF, up to 10 MiB. Maps need an attachment before publication.</p>
                {selected.hasAsset && (
                  <div className={styles.actions}>
                    <span>
                      {selected.asset?.contentType} · {Math.ceil((selected.asset?.bytes ?? 0) / 1024)} KiB
                    </span>
                    <Button variant="outline" onClick={download} isLoading={downloading}>
                      Download saved attachment
                    </Button>
                    <Button
                      variant="ghost"
                      tone="danger"
                      disabled={dirty || locked}
                      onClick={() => {
                        setFileError('');
                        setFiles([]);
                        if (record) void mutate(() => adventureApi.removeAsset(record, selected.id), 'Attachment removed from the draft. Published content is unchanged.');
                      }}
                    >
                      Remove draft attachment
                    </Button>
                  </div>
                )}
                <Upload
                  key={selected.id}
                  disabled={locked || dirty || !record}
                  accept=".png,.jpg,.jpeg,.webp,.pdf"
                  fileList={files}
                  maxCount={1}
                  beforeUpload={(file) => {
                    const valid = file.size > 0 && file.size <= 10 * 1024 * 1024 && /\.(png|jpe?g|webp|pdf)$/i.test(file.name);
                    setFileError(valid ? '' : 'Choose a nonempty PNG, JPEG, WebP or PDF no larger than 10 MiB.');
                    return valid;
                  }}
                  onChange={(info) => setFiles(info.fileList)}
                  dropzoneText="Choose a protected attachment"
                  dropzoneHint="Selecting a file does not upload it. Use Upload to draft below."
                />
                <p className={styles.hint}>
                  {dirty || !record
                    ? 'Save the draft before selecting or changing attachments.'
                    : 'A file selection stays only in this view. Upload it before switching resources or leaving.'}
                </p>
                {files.length > 0 && (
                  <Button onClick={upload} disabled={locked || dirty || !record}>
                    Upload to draft
                  </Button>
                )}
                {fileError && (
                  <p role="alert" className={styles.error}>
                    {fileError}
                  </p>
                )}
              </section>
            )}
            <details className={styles.disclosure}>
              <summary>Use in sections · {content.sections.filter((s) => s.resourceIds.includes(selected.id)).length}</summary>
              <div className={styles.checks}>
                {content.sections.map((s) => (
                  <Checkbox
                    key={s.id}
                    label={s.title}
                    checked={s.resourceIds.includes(selected.id)}
                    onChange={(checked) =>
                      onChange({
                        ...content,
                        sections: content.sections.map((section) =>
                          section.id === s.id
                            ? { ...section, resourceIds: checked ? [...section.resourceIds, selected.id] : section.resourceIds.filter((id) => id !== selected.id) }
                            : section
                        ),
                      })
                    }
                  />
                ))}
                {!content.sections.length && <p>Add sections whenever you need them. This resource can remain unassigned.</p>}
              </div>
            </details>
            <Button variant="ghost" tone="danger" onClick={() => onRemove('resources', selected.id)}>
              Remove resource
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
