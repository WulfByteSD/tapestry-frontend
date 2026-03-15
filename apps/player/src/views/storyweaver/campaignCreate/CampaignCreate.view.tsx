// apps/player/src/views/storyweaver/campaignCreate/CampaignCreate.view.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CampaignStatus } from "@tapestry/types";
import { Button, Card, CardBody, CardHeader, SelectField, TextField, TextAreaField } from "@tapestry/ui";
import { useCreateCampaignMutation } from "@/lib/campaign-hooks";
import styles from "./CampaignCreate.module.scss";

type FormState = {
  name: string;
  status: CampaignStatus;
  settingKey: string;
  toneModulesText: string;
  sourcesText: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  name: "",
  status: "active",
  settingKey: "",
  toneModulesText: "",
  sourcesText: "core",
  notes: "",
};

function parseList(input: string): string[] {
  return input
    .split(/[\n,]/g)
    .map((value) => value.trim())
    .filter(Boolean);
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Campaign name is required.";
  } else if (form.name.trim().length < 3) {
    errors.name = "Give it at least 3 characters.";
  }

  if (parseList(form.sourcesText).length === 0) {
    errors.sourcesText = "Add at least one source. Use 'core' if nothing else yet.";
  }

  return errors;
}

export default function CampaignCreateView() {
  const router = useRouter();
  const createCampaign = useCreateCampaignMutation();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const parsedToneModules = useMemo(() => parseList(form.toneModulesText), [form.toneModulesText]);

  const parsedSources = useMemo(() => parseList(form.sourcesText), [form.sourcesText]);

  const apiError =
    (createCampaign.error as any)?.response?.data?.message ||
    (createCampaign.error as any)?.response?.data?.error ||
    (createCampaign.error as Error | null)?.message ||
    "";

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));

    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      status: form.status,
      settingKey: form.settingKey.trim() || undefined,
      toneModules: parsedToneModules,
      sources: parsedSources.length ? parsedSources : ["core"],
      notes: form.notes.trim() || undefined,
    };

    try {
      const result = await createCampaign.mutateAsync(payload);
      const id = result?.payload?._id || result?._id;

      if (id) {
        router.push(`/storyweaver/campaigns/${id}`);
        return;
      }

      router.push("/storyweaver");
    } catch {
      // handled by apiError block
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>Storyweaver</p>
        <h1 className={styles.title}>Create a new campaign</h1>
        <p className={styles.subtitle}>
          Start with the table-facing bones: name, setting, tone dials, and content sources. Invites, join requests, and
          encounter tracking can layer in after this.
        </p>
      </div>

      <div className={styles.grid}>
        <Card className={styles.formCard}>
          <CardHeader>Create Campaign</CardHeader>
          <CardBody>
            <form className={styles.form} onSubmit={handleSubmit}>
              <TextField
                label="Campaign Name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                error={errors.name}
                floatingLabel
              />

              <div className={styles.twoCol}>
                <TextField
                  label="Setting Key"
                  value={form.settingKey}
                  onChange={(e) => updateField("settingKey", e.target.value)}
                  hint="Optional for now. Example: woven-realms"
                  floatingLabel
                />

                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value as CampaignStatus)}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </SelectField>
              </div>

              <TextField
                label="Tone Modules"
                value={form.toneModulesText}
                onChange={(e) => updateField("toneModulesText", e.target.value)}
                hint="Comma or newline separated"
                floatingLabel
              />

              <TextField
                label="Content Sources"
                value={form.sourcesText}
                onChange={(e) => updateField("sourcesText", e.target.value)}
                error={errors.sourcesText}
                hint="Comma or newline separated"
                floatingLabel
              />

              <TextAreaField
                // label="Notes"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="What is this campaign about? What should players expect?"
                hint="Optional. Good place for pitch text or table expectations."
                rows={6}
                floatingLabel
              />

              {apiError ? <p className={styles.errorBanner}>{apiError}</p> : null}

              <div className={styles.actions}>
                <Button type="button" variant="ghost" tone="neutral" onClick={() => router.push("/storyweaver")}>
                  Cancel
                </Button>

                <Button type="submit" isLoading={createCampaign.isPending}>
                  Create Campaign
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card className={styles.previewCard}>
          <CardHeader>Campaign Preview</CardHeader>
          <CardBody>
            <div className={styles.previewBanner}>
              <p className={styles.previewEyebrow}>Preview</p>
              <h2 className={styles.previewTitle}>{form.name.trim() || "Unnamed Campaign"}</h2>
              <p className={styles.previewMeta}>
                {form.settingKey.trim() || "No setting selected"} · {form.status}
              </p>
            </div>

            <section className={styles.previewSection}>
              <h3>Tone Dials</h3>
              <div className={styles.tokenRow}>
                {parsedToneModules.length > 0 ? (
                  parsedToneModules.map((tone) => (
                    <span key={tone} className={styles.token}>
                      {tone}
                    </span>
                  ))
                ) : (
                  <span className={styles.placeholder}>No tone modules yet</span>
                )}
              </div>
            </section>

            <section className={styles.previewSection}>
              <h3>Sources</h3>
              <div className={styles.tokenRow}>
                {parsedSources.length > 0 ? (
                  parsedSources.map((source) => (
                    <span key={source} className={styles.token}>
                      {source}
                    </span>
                  ))
                ) : (
                  <span className={styles.placeholder}>No sources yet</span>
                )}
              </div>
            </section>

            <section className={styles.previewSection}>
              <h3>Campaign Pitch</h3>
              <p className={styles.notesPreview}>{form.notes.trim() || "No pitch written yet."}</p>
            </section>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
