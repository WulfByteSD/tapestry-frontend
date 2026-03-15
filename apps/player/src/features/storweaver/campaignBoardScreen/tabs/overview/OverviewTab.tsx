import { useEffect, useMemo, useState } from "react";
import { SelectField, TextAreaField, TextField } from "@tapestry/ui";
import type { CampaignType, SettingDefinition } from "@tapestry/types";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import type { ApiListResponse } from "@tapestry/api-client/src/list/list.types";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import styles from "./OverviewTab.module.scss";

type Props = {
  campaign: CampaignType & { _id: string };
  updateMutation: UseMutationResult<any, any, any, any>;
  settingsQuery: UseQueryResult<ApiListResponse<SettingDefinition>, Error>;
  isArchived: boolean;
};

function parseList(input: string): string[] {
  return input
    .split(/[\n,]/g)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function OverviewTab({ campaign, updateMutation, settingsQuery, isArchived }: Props) {
  const [notesDraft, setNotesDraft] = useState("");
  const [tonesDraft, setTonesDraft] = useState("");
  const [sourcesDraft, setSourcesDraft] = useState("");

  useEffect(() => {
    setNotesDraft(campaign.notes ?? "");
    setTonesDraft((campaign.toneModules ?? []).join(", "));
    setSourcesDraft((campaign.sources ?? []).join(", "));
  }, [campaign._id, campaign.notes, campaign.toneModules, campaign.sources]);

  const debouncedSaveNotes = useDebouncedCallback((value: string) => {
    updateMutation.mutate({ notes: value });
  }, 600);

  const sources = useMemo(() => parseList(sourcesDraft), [sourcesDraft]);
  const tones = useMemo(() => parseList(tonesDraft), [tonesDraft]);

  return (
    <div className={styles.grid}>
      <section className={styles.mainPanel}>
        <TextAreaField
          label="Campaign Pitch"
          floatingLabel
          value={notesDraft}
          onChange={(e) => {
            setNotesDraft(e.target.value);
            debouncedSaveNotes.call(e.target.value);
          }}
          onBlur={() => debouncedSaveNotes.flush()}
          placeholder="What is this campaign about?"
          rows={10}
          disabled={isArchived}
        />
        <TextField
          label="Campaign Avatar URL"
          floatingLabel
          value={campaign.avatar || ""}
          onChange={(e) => updateMutation.mutate({ avatar: e.target.value || null })}
          placeholder="https://example.com/avatar.png"
          disabled={isArchived}
          helpText="Displayed on the campaign card and roster. Should be a square image for best results."
        />
      </section>

      <aside className={styles.sidePanel}>
        <section className={styles.editBlock}>
          <SelectField
            label="Campaign Status"
            value={campaign.status || "draft"}
            onChange={(e) => updateMutation.mutate({ status: e.target.value as "draft" | "active" | "archived" })}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </SelectField>
        </section>

        <section className={styles.editBlock}>
          <SelectField
            label="Setting"
            value={campaign.settingKey || ""}
            onChange={(e) => updateMutation.mutate({ settingKey: e.target.value || null })}
            disabled={settingsQuery.isLoading || isArchived}
          >
            <option value="">No setting</option>
            {settingsQuery.data?.payload?.map((setting) => (
              <option key={setting._id} value={setting.key}>
                {setting.name}
              </option>
            ))}
            {!settingsQuery.isLoading && !settingsQuery.data?.payload?.length && (
              <option value="" disabled>
                No settings available
              </option>
            )}
          </SelectField>
        </section>

        <section className={styles.editBlock}>
          <TextField
            label="Tone Modules"
            floatingLabel
            value={tonesDraft}
            onChange={(e) => setTonesDraft(e.target.value)}
            onBlur={() => updateMutation.mutate({ toneModules: parseList(tonesDraft) })}
            placeholder="dragon-dial, romance-dial"
            disabled={isArchived}
          />
          <div className={styles.tokenRow}>
            {tones.length ? (
              tones.map((tone) => (
                <span key={tone} className={styles.token}>
                  {tone}
                </span>
              ))
            ) : (
              <span className={styles.empty}>No tone modules yet</span>
            )}
          </div>
        </section>

        <section className={styles.editBlock}>
          <TextField
            value={sourcesDraft}
            onChange={(e) => setSourcesDraft(e.target.value)}
            onBlur={() =>
              updateMutation.mutate({
                sources: parseList(sourcesDraft).length ? parseList(sourcesDraft) : ["core"],
              })
            }
            floatingLabel
            label="Sources"
            placeholder="core, woven-realms"
            disabled={isArchived}
          />
          <div className={styles.tokenRow}>
            {sources.length ? (
              sources.map((source) => (
                <span key={source} className={styles.token}>
                  {source}
                </span>
              ))
            ) : (
              <span className={styles.empty}>No sources yet</span>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
