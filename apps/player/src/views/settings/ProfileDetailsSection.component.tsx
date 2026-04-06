'use client';

import { useEffect } from 'react';
import { Button, Form, FormField, Loader, Select, TextField, useForm } from '@tapestry/ui';
import { usePlayerProfile, useUpdatePlayerProfile } from '@/lib/settings-hooks';
import { TIMEZONES } from '@tapestry/types';
import styles from './AccountDetails.module.scss';

type Props = {
  profileId?: string | null;
};

type ProfileFormValues = {
  avatar: string;
  displayName: string;
  bio: string;
  timezone: string;
};

export default function ProfileDetailsSection({ profileId }: Props) {
  const { data: profile, isLoading } = usePlayerProfile(profileId);
  const updateProfile = useUpdatePlayerProfile(profileId);

  const form = useForm<ProfileFormValues>({
    initialValues: {
      avatar: '',
      displayName: '',
      bio: '',
      timezone: '',
    },
    validators: {
      avatar: (value) => {
        if (!value) return undefined; // Avatar is optional
        try {
          new URL(value);
          return undefined;
        } catch {
          return 'Avatar must be a valid URL.';
        }
      },
      displayName: (value) => (String(value).trim() ? undefined : 'Display name is required.'),
      bio: (value) => (String(value).length <= 500 ? undefined : 'Bio must be 500 characters or less.'),
    },
    onSubmit: async (values) => {
      await updateProfile.mutateAsync({
        avatar: values.avatar.trim() || undefined,
        displayName: values.displayName.trim(),
        bio: values.bio.trim() || undefined,
        timezone: values.timezone.trim() || undefined,
      });
    },
  });

  useEffect(() => {
    if (!profile) return;

    form.replaceValues({
      avatar: profile.avatar ?? '',
      displayName: profile.displayName ?? '',
      bio: profile.bio ?? '',
      timezone: profile.timezone ?? '',
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
        <Loader size="md" tone="gold" label="Loading profile…" />
      ) : (
        <Form form={form} className={styles.formStack}>
          <FormField name="avatar">
            {(field) => (
              <TextField
                id={field.id}
                label="Avatar URL"
                floatingLabel
                placeholder="https://example.com/avatar.png"
                value={String(field.value ?? '')}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled={updateProfile.isPending}
              />
            )}
          </FormField>

          <FormField name="displayName">
            {(field) => (
              <TextField
                id={field.id}
                label="Display name"
                floatingLabel
                value={String(field.value ?? '')}
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
                floatingLabel
                placeholder="A short bio to introduce yourself to other Tapestry users."
                value={String(field.value ?? '')}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled={updateProfile.isPending}
              />
            )}
          </FormField>

          <FormField name="timezone">
            {(field) => (
              <Select
                id={field.id}
                value={String(field.value ?? '')}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                disabled={updateProfile.isPending}
                style={{ padding: '0.75rem', fontSize: '1rem' }}
              >
                <option value="">Select timezone...</option>
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <div className={styles.actionsRow}>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Saving…' : 'Save profile'}
            </Button>
          </div>
        </Form>
      )}
    </section>
  );
}
