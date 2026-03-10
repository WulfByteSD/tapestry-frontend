"use client";

import { useEffect } from "react";
import { Button, Form, FormField, TextField, useForm } from "@tapestry/ui";
import { usePlayerProfile, useUpdatePlayerProfile } from "@/lib/settings-hooks";
import styles from "./AccountDetails.module.scss";

type Props = {
  profileId?: string | null;
};

type ProfileFormValues = {
  displayName: string;
  bio: string;
  timezone: string;
};

export default function ProfileDetailsSection({ profileId }: Props) {
  const { data: profile, isLoading } = usePlayerProfile(profileId);
  const updateProfile = useUpdatePlayerProfile(profileId);

  const form = useForm<ProfileFormValues>({
    initialValues: {
      displayName: "",
      bio: "",
      timezone: "",
    },
    validators: {
      displayName: (value) => (String(value).trim() ? undefined : "Display name is required."),
      bio: (value) => (String(value).length <= 500 ? undefined : "Bio must be 500 characters or less."),
    },
    onSubmit: async (values) => {
      await updateProfile.mutateAsync({
        displayName: values.displayName.trim(),
        bio: values.bio.trim() || undefined,
        timezone: values.timezone.trim() || undefined,
      });
    },
  });

  useEffect(() => {
    if (!profile) return;

    form.replaceValues({
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      timezone: profile.timezone ?? "",
    });
  }, [profile]);

  if (!profileId) {
    return null;
  }

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Profile</h2>
          <p className={styles.sectionSubtitle}>Update how you appear across Tapestry.</p>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.muted}>Loading profile…</p>
      ) : (
        <Form form={form} className={styles.formStack}>
          <FormField name="displayName">
            {(field) => (
              <TextField
                id={field.id}
                label="Display name"
                value={String(field.value ?? "")}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled={updateProfile.isPending}
              />
            )}
          </FormField>

          <FormField name="bio">
            {(field) => (
              <TextField
                id={field.id}
                label="Bio"
                value={String(field.value ?? "")}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled={updateProfile.isPending}
              />
            )}
          </FormField>

          <FormField name="timezone">
            {(field) => (
              <TextField
                id={field.id}
                label="Timezone"
                placeholder="America/New_York"
                value={String(field.value ?? "")}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled={updateProfile.isPending}
              />
            )}
          </FormField>

          <div className={styles.actionsRow}>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </Form>
      )}
    </section>
  );
}
