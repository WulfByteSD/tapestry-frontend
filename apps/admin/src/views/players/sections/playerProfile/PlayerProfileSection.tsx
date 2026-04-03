'use client';

import { useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, TextField, TextAreaField, SelectField, Form, FormField, useForm, CopyField } from '@tapestry/ui';
import { TIMEZONES } from '@tapestry/types';
import { usePlayerDetail, useUpdatePlayerProfile } from '@/lib/player-admin';
import styles from './PlayerProfileSection.module.scss';

const ROLE_OPTIONS = [
  { value: 'player', label: 'Player' },
  { value: 'storyweaver', label: 'Storyweaver' },
];

function formatDate(value?: string | Date) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type PlayerProfileFormValues = {
  displayName: string;
  bio: string;
  timezone: string;
  roles: string[];
};

type PlayerProfileSectionProps = {
  playerId: string;
};

export function PlayerProfileSection({ playerId }: PlayerProfileSectionProps) {
  const { data: playerData } = usePlayerDetail(playerId);
  const updateMutation = useUpdatePlayerProfile(playerId);

  const player = playerData?.payload;

  const form = useForm<PlayerProfileFormValues>({
    initialValues: {
      displayName: '',
      bio: '',
      timezone: '',
      roles: [],
    },
  });

  // Initialize form when player data loads
  useEffect(() => {
    if (player) {
      form.replaceValues({
        displayName: player.displayName || '',
        bio: player.bio || '',
        timezone: player.timezone || '',
        roles: player.roles || [],
      });
    }
  }, [player]);

  const handleSave = () => {
    updateMutation.mutate(
      {
        displayName: form.values.displayName.trim() || undefined,
        bio: form.values.bio.trim() || undefined,
        timezone: form.values.timezone.trim() || undefined,
        roles: form.values.roles,
      },
      {
        onSuccess: () => {
          // Reset form dirty state by replacing values with current values
          form.replaceValues(form.values);
        },
      }
    );
  };

  const handleReset = () => {
    form.reset();
  };

  if (!player) return null;

  return (
    <Card className={styles.profileCard}>
      <CardHeader>
        <h2>Player Profile</h2>
      </CardHeader>
      <CardBody>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <CopyField
              label="Player ID"
              value={player._id}
              variant="field"
              displayAs="code"
              truncate
              size="sm"
              copyMessage="Player ID copied to clipboard"
              className={styles.copyField}
            />
          </div>

          <Form form={form} className={styles.form}>
            <div className={styles.formRow}>
              <FormField name="displayName">
                {(field) => (
                  <TextField
                    id={field.id}
                    label="Display Name"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    placeholder="Enter display name"
                    disabled={updateMutation.isPending}
                  />
                )}
              </FormField>
            </div>

            <div className={styles.formRow}>
              <FormField name="bio">
                {(field) => (
                  <TextAreaField
                    id={field.id}
                    label="Bio"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    placeholder="Enter bio"
                    rows={3}
                    disabled={updateMutation.isPending}
                  />
                )}
              </FormField>
            </div>

            <div className={styles.formRow}>
              <FormField name="timezone">
                {(field) => (
                  <SelectField
                    id={field.id}
                    label="Timezone"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    placeholder="Select timezone..."
                    disabled={updateMutation.isPending}
                    options={TIMEZONES}
                  />
                )}
              </FormField>
            </div>

            <div className={styles.formRow}>
              <FormField name="roles">
                {(field) => (
                  <SelectField
                    mode="multiple"
                    id={field.id}
                    label="Roles"
                    value={field.value as string[]}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    placeholder="Select roles..."
                    disabled={updateMutation.isPending}
                    options={ROLE_OPTIONS}
                  />
                )}
              </FormField>
            </div>
          </Form>

          <div className={styles.infoRow}>
            <span className={styles.label}>Created</span>
            <span className={styles.value}>{formatDate(player.createdAt)}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Updated</span>
            <span className={styles.value}>{formatDate(player.updatedAt)}</span>
          </div>
        </div>

        {form.isDirty && (
          <div className={styles.formActions}>
            <Button variant="outline" tone="neutral" onClick={handleReset} disabled={updateMutation.isPending}>
              Reset
            </Button>
            <Button tone="purple" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        {updateMutation.isError && <div className={styles.errorMessage}>Failed to update profile. Please try again.</div>}
      </CardBody>
    </Card>
  );
}
