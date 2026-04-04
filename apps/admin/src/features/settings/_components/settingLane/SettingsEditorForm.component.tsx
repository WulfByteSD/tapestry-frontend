// apps/admin/src/features/content/_components/settingsLane/SettingsEditorForm.tsx
'use client';

import { useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Checkbox, Form, FormField, FormGroup, SelectField, TextField, TextAreaField, useForm, TagInput, TagInputField } from '@tapestry/ui';
import styles from './SettingsEditorForm.module.scss';

type SettingFormValues = {
  key: string;
  name: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  tagsText: string[];
  rulesetVersion: number;
  modules: {
    items: boolean;
    lore: boolean;
    maps: boolean;
    magic: boolean;
  };
};

type Props = {
  mode: 'create' | 'edit';
  draft: SettingFormValues;
  setDraft: (updater: (prev: SettingFormValues) => SettingFormValues) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
};

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

export default function SettingsEditorForm({ mode, draft, setDraft, onSave, onCancel, onDelete, isSaving = false, isDeleting = false }: Props) {
  const form = useForm<SettingFormValues>({
    initialValues: draft,
  });

  // Sync form with external draft changes
  useEffect(() => {
    form.replaceValues(draft);
  }, [draft]);

  // Sync external draft with form changes
  useEffect(() => {
    setDraft(() => form.values);
  }, [form.values, setDraft]);

  const disabled = isSaving || isDeleting;

  return (
    <div className={styles.form}>
      <Card>
        <CardHeader className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Core Details</h2>
            <p className={styles.sectionSubtitle}>Basic metadata for this setting definition.</p>
          </div>
        </CardHeader>
        <CardBody>
          <Form form={form}>
            <FormGroup>
              <FormField name="name">
                {(field) => (
                  <TextField
                    floatingLabel
                    id={field.id}
                    label="Name"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    placeholder="Woven Realms"
                    disabled={disabled}
                  />
                )}
              </FormField>

              <FormField name="key">
                {(field) => (
                  <TextField
                    floatingLabel
                    id={field.id}
                    label="Key"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    helpText="Slug-like identifier. Example: woven-realms"
                    placeholder="woven-realms"
                    disabled={disabled}
                  />
                )}
              </FormField>
            </FormGroup>

            <FormField name="description">
              {(field) => (
                <TextAreaField
                  floatingLabel
                  id={field.id}
                  label="Description"
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  placeholder="A rich fantasy world filled with..."
                  rows={4}
                  disabled={disabled}
                />
              )}
            </FormField>

            <FormGroup>
              <FormField name="status">
                {(field) => (
                  <SelectField
                    floatingLabel
                    id={field.id}
                    label="Status"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    options={STATUS_OPTIONS}
                    disabled={disabled}
                  />
                )}
              </FormField>

              <FormField name="tagsText">
                {(field) => (
                  <TagInputField
                    floatingLabel
                    id={field.id}
                    label="Tags"
                    value={field?.value as string[]}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    disabled={disabled}
                    placeholder="Type a tag and press comma or enter..."
                  />
                )}
              </FormField>
            </FormGroup>
          </Form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Enabled Modules</h2>
            <p className={styles.sectionSubtitle}>Choose which content modules are available for this setting.</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className={styles.checkboxGrid}>
            <Checkbox
              label="Items"
              checked={form.values.modules.items}
              onChange={(checked) => form.setValue('modules', { ...form.values.modules, items: checked })}
              disabled={disabled}
            />

            <Checkbox
              label="Lore"
              checked={form.values.modules.lore}
              onChange={(checked) => form.setValue('modules', { ...form.values.modules, lore: checked })}
              disabled={disabled}
            />

            <Checkbox
              label="Maps"
              checked={form.values.modules.maps}
              onChange={(checked) => form.setValue('modules', { ...form.values.modules, maps: checked })}
              disabled={disabled}
            />

            <Checkbox
              label="Magic"
              checked={form.values.modules.magic}
              onChange={(checked) => form.setValue('modules', { ...form.values.modules, magic: checked })}
              disabled={disabled}
            />
          </div>
        </CardBody>
      </Card>

      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <Button variant="solid" tone="gold" onClick={onSave} isLoading={isSaving} disabled={isDeleting}>
            {mode === 'create' ? 'Create Setting' : 'Save Changes'}
          </Button>

          <Button variant="outline" tone="neutral" onClick={onCancel} disabled={isSaving || isDeleting}>
            Cancel
          </Button>
        </div>

        {mode === 'edit' && onDelete ? (
          <div className={styles.footerDanger}>
            <Button variant="outline" tone="danger" onClick={onDelete} isLoading={isDeleting} disabled={isSaving}>
              Delete Setting
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
