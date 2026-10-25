import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RichTextEditor, SelectField, Switcher, TextField } from '@tapestry/ui';
import type { CampaignType } from '@tapestry/types';
import { useUpdateCampaignMutation, useSettingsQuery } from '@/lib/campaign-hooks';
import { useDebouncedCallback } from '@/lib/useDebouncedCallback';
import { noteBodyForEditor } from '@/features/characters/noteContent';
import styles from './OverviewZone.module.scss';

type Props = {
  campaign: CampaignType & { _id: string; maxPlayers?: number | null; joinPolicy?: string };
  isSW: boolean;
  isArchived: boolean;
};

function parseList(input: string): string[] {
  return input.split(/[\n,]/g).map((value) => value.trim()).filter(Boolean);
}

function getPreviewUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return value;
  try {
    const url = new URL(value);
    // Preview only sources supported by Next Image; the saved input remains unchanged.
    return url.protocol === 'https:' && !url.port && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export default function OverviewZone({ campaign, isArchived }: Props) {
  const updateMutation = useUpdateCampaignMutation(campaign._id);
  const settingsQuery = useSettingsQuery();
  const [notesDraft, setNotesDraft] = useState('');
  const [expectationsDraft, setExpectationsDraft] = useState('');
  const [tonesDraft, setTonesDraft] = useState('');
  const [sourcesDraft, setSourcesDraft] = useState('');
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null);
  const pitchEditorRef = useRef<HTMLDivElement>(null);
  const expectationsEditorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotesDraft(campaign.notes ?? '');
    setExpectationsDraft(campaign.tableExpectations ?? '');
    setTonesDraft((campaign.toneModules ?? []).join(', '));
    setSourcesDraft((campaign.sources ?? []).join(', '));
  }, [campaign._id, campaign.notes, campaign.tableExpectations, campaign.toneModules, campaign.sources]);

  const debouncedSave = useDebouncedCallback((field: string, value: string) => {
    updateMutation.mutate({ [field]: value });
  }, 600);

  const sources = useMemo(() => parseList(sourcesDraft), [sourcesDraft]);
  const tones = useMemo(() => parseList(tonesDraft), [tonesDraft]);
  const previewUrl = getPreviewUrl(campaign.avatar);

  return (
    <div className={styles.overview}>
      <header className={styles.header}>
        <div>
          <h2>Campaign overview</h2>
          <p>Shape the campaign players discover: its story, expectations, and who can join the table.</p>
        </div>
        <p className={styles.saveStatus} role={updateMutation.isError ? 'alert' : 'status'}>
          {updateMutation.isPending ? 'Saving changes…' : updateMutation.isError ? 'Your latest change could not be saved. Please try editing the field again.' : 'Changes save automatically.'}
        </p>
      </header>

      <div className={styles.grid}>
        <div className={styles.mainPanel}>
          <section className={styles.section} aria-labelledby="campaign-presentation-heading">
            <h3 id="campaign-presentation-heading">Campaign presentation</h3>
            <div
              ref={pitchEditorRef}
              className={styles.editorField}
              role="group"
              aria-labelledby="campaign-pitch-label"
              aria-describedby="campaign-pitch-help"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) debouncedSave.flush();
              }}
            >
              <p id="campaign-pitch-label" className={styles.fieldLabel}>Campaign pitch</p>
              <RichTextEditor
                value={noteBodyForEditor(notesDraft)}
                className={styles.richEditor}
                onChange={(html) => {
                  // Ignore editor mount/disabled synchronization; toolbar edits retain focus here.
                  if (!pitchEditorRef.current?.contains(document.activeElement)) return;
                  setNotesDraft(html);
                  debouncedSave.call('notes', html);
                }}
                placeholder="What is this campaign about?"
                minHeight={220}
                disabled={isArchived}
              />
              <p id="campaign-pitch-help" className={styles.fieldHelp}>The introduction players read on the campaign overview.</p>
            </div>
            <div className={styles.artworkEditor}>
              <TextField
                id="campaign-artwork-input"
                label="Campaign artwork URL"
                value={campaign.avatar || ''}
                onChange={(event) => updateMutation.mutate({ avatar: event.target.value || null })}
                placeholder="https://example.com/avatar.png"
                disabled={isArchived}
                helpText="Used for the campaign artwork and avatar. A square image works well."
              />
              <div className={styles.artworkPreview}>
                {previewUrl && failedPreviewUrl !== previewUrl ? (
                  <Image src={previewUrl} alt="Campaign artwork preview" width={320} height={320} sizes="160px" onError={() => setFailedPreviewUrl(previewUrl)} />
                ) : <span>{campaign.avatar ? 'Artwork preview unavailable' : 'No artwork yet'}</span>}
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="campaign-expectations-editor-heading">
            <h3 id="campaign-expectations-editor-heading">At the table</h3>
            <div
              ref={expectationsEditorRef}
              className={styles.editorField}
              role="group"
              aria-labelledby="campaign-expectations-label"
              aria-describedby="campaign-expectations-help"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) debouncedSave.flush();
              }}
            >
              <p id="campaign-expectations-label" className={styles.fieldLabel}>Table expectations</p>
              <RichTextEditor
                value={noteBodyForEditor(expectationsDraft)}
                className={styles.richEditor}
                onChange={(html) => {
                  if (!expectationsEditorRef.current?.contains(document.activeElement)) return;
                  setExpectationsDraft(html);
                  debouncedSave.call('tableExpectations', html);
                }}
                placeholder="House rules, content warnings, session length, playstyle guidelines..."
                minHeight={220}
                disabled={isArchived}
              />
              <p id="campaign-expectations-help" className={styles.fieldHelp}>Guidelines for players joining this campaign.</p>
            </div>
          </section>
        </div>

        <aside className={styles.sidePanel}>
          <section className={styles.section} aria-labelledby="campaign-joining-heading">
            <h3 id="campaign-joining-heading">Joining & status</h3>
            <Switcher id="campaign-discoverable-input" label="Discoverable" onChange={(value) => updateMutation.mutate({ discoverable: value })} checked={campaign.discoverable ?? false} disabled={isArchived} />
            <SelectField
              id="campaign-join-policy-input"
              label="Join policy"
              value={campaign.joinPolicy || 'invite-only'}
              onChange={(event) => updateMutation.mutate({ joinPolicy: event.target.value })}
              disabled={isArchived}
            >
              <option value="open">Open - Anyone can join</option>
              <option value="approval">Request - Requires approval</option>
              <option value="invite-only">Invite Only</option>
            </SelectField>
            <TextField
              id="campaign-capacity-input"
              label="Max players"
              type="number"
              value={campaign.maxPlayers?.toString() || ''}
              onChange={(event) => {
                const value = event.target.value;
                updateMutation.mutate({ maxPlayers: value ? parseInt(value, 10) : null });
              }}
              placeholder="Unlimited"
              disabled={isArchived}
              helpText="Leave empty for no limit"
              min={1}
              max={100}
            />
            <SelectField
              id="campaign-status-input"
              label="Campaign status"
              value={campaign.status || 'draft'}
              onChange={(event) => updateMutation.mutate({ status: event.target.value as 'draft' | 'active' | 'archived' })}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </SelectField>
          </section>

          <section className={styles.section} aria-labelledby="campaign-world-heading">
            <h3 id="campaign-world-heading">World & tone</h3>
            <SelectField
              id="campaign-setting-input"
              label="Setting"
              value={campaign.settingKey || ''}
              onChange={(event) => updateMutation.mutate({ settingKey: event.target.value || null })}
              disabled={settingsQuery.isLoading || isArchived}
            >
              <option value="">No setting</option>
              {settingsQuery.data?.payload?.map((setting) => <option key={setting._id} value={setting.key}>{setting.name}</option>)}
              {!settingsQuery.isLoading && !settingsQuery.data?.payload?.length ? <option value="" disabled>No settings available</option> : null}
            </SelectField>
            <div className={styles.editBlock}>
              <TextField
                id="campaign-tones-input"
                label="Tone Modules"
                value={tonesDraft}
                onChange={(event) => setTonesDraft(event.target.value)}
                onBlur={() => updateMutation.mutate({ toneModules: parseList(tonesDraft) })}
                placeholder="dragon-dial, romance-dial"
                disabled={isArchived}
              />
              <div className={styles.tokenRow}>
                {tones.length ? tones.map((tone) => <span key={tone} className={styles.token}>{tone}</span>) : <span className={styles.empty}>No Tone Modules yet</span>}
              </div>
            </div>
            <div className={styles.editBlock}>
              <TextField
                id="campaign-sources-input"
                label="Sources"
                value={sourcesDraft}
                onChange={(event) => setSourcesDraft(event.target.value)}
                onBlur={() => updateMutation.mutate({ sources: parseList(sourcesDraft).length ? parseList(sourcesDraft) : ['core'] })}
                placeholder="core, woven-realms"
                disabled={isArchived}
              />
              <div className={styles.tokenRow}>
                {sources.length ? sources.map((source) => <span key={source} className={styles.token}>{source}</span>) : <span className={styles.empty}>No sources yet</span>}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
