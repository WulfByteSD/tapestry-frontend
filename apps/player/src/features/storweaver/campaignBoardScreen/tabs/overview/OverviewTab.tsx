import { useEffect, useMemo, useState } from "react";
import { Select, SelectField, Switcher, TextAreaField, TextField } from "@tapestry/ui";
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
  const [expectationsDraft, setExpectationsDraft] = useState("");
  const [tonesDraft, setTonesDraft] = useState("");
  const [sourcesDraft, setSourcesDraft] = useState("");

  useEffect(() => {
    setNotesDraft(campaign.notes ?? "");
    setExpectationsDraft((campaign as any).tableExpectations ?? "");
    setTonesDraft((campaign.toneModules ?? []).join(", "));
    setSourcesDraft((campaign.sources ?? []).join(", "));
  }, [campaign._id, campaign.notes, (campaign as any).tableExpectations, campaign.toneModules, campaign.sources]);

  const debouncedSave = useDebouncedCallback((field: string, value: string) => {
    updateMutation.mutate({ [field]: value });
  }, 600);

  const sources = useMemo(() => parseList(sourcesDraft), [sourcesDraft]);
  const tones = useMemo(() => parseList(tonesDraft), [tonesDraft]);

  return (
    <div className={styles.grid}>
      <section className={styles.mainPanel}>
        <section className={styles.editBlock}>
          <TextAreaField
            label="Campaign Pitch"
            floatingLabel
            value={notesDraft}
            className={styles.textarea}
            onChange={(e) => {
              setNotesDraft(e.target.value);
              debouncedSave.call("notes", e.target.value);
            }}
            onBlur={() => debouncedSave.flush()}
            placeholder="What is this campaign about?"
            rows={10}
            disabled={isArchived}
          />
        </section>
        <section className={styles.editBlock}>
          <TextAreaField
            label="Table Expectations"
            floatingLabel
            value={expectationsDraft}
            className={styles.textarea}
            onChange={(e) => {
              setExpectationsDraft(e.target.value);
              debouncedSave.call("tableExpectations", e.target.value);
            }}
            onBlur={() => debouncedSave.flush()}
            placeholder="House rules, content warnings, session length, playstyle guidelines..."
            rows={8}
            disabled={isArchived}
            helpText="Guidelines for players joining this campaign."
          />
        </section>
        <section className={styles.editBlock}>
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

        <section className={styles.editBlock}>
          <Switcher
            label="Discoverable"
            onChange={(value) => updateMutation.mutate({ discoverable: value })}
            checked={campaign.discoverable ?? false}
            disabled={isArchived}
          />
        </section>
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
          <TextField
            label="Max Players"
            type="number"
            value={(campaign as any).maxPlayers?.toString() || ""}
            onChange={(e) => {
              const val = e.target.value;
              updateMutation.mutate({ maxPlayers: val ? parseInt(val, 10) : null });
            }}
            placeholder="Unlimited"
            disabled={isArchived}
            helpText="Leave empty for no limit"
            min={1}
            max={100}
          />
        </section>

        <section className={styles.editBlock}>
          <SelectField
            label="Join Policy"
            value={(campaign as any).joinPolicy || "invite-only"}
            onChange={(e) => updateMutation.mutate({ joinPolicy: e.target.value })}
            disabled={isArchived}
          >
            <option value="open">Open - Anyone can join</option>
            <option value="request">Request - Requires approval</option>
            <option value="invite-only">Invite Only</option>
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
