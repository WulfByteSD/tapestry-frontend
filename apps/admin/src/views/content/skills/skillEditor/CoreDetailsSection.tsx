import React from 'react';
import { Card, CardBody, CardHeader, Form, FormField, FormGroup, SelectField, TagInputField, TextAreaField, TextField, type UseFormReturn } from '@tapestry/ui';
import { SkillEditorFormValues } from './editor.types';
import { SKILL_SETTING_OPTIONS, SKILL_CATEGORY_OPTIONS, SKILL_STATUS_OPTIONS, SKILL_ASPECT_OPTIONS } from './editor.constants';

import styles from './SkillEditor.module.scss';

type CoreDetailsSectionProps = {
  form: UseFormReturn<SkillEditorFormValues>;
  disabled: boolean;
};

export const CoreDetailsSection = ({ form, disabled }: CoreDetailsSectionProps) => {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Core Details</h2>
          <p className={styles.sectionSubtitle}>These fields define the skill identity and its content metadata.</p>
        </div>
      </CardHeader>
      <CardBody>
        <Form form={form} className={styles.form}>
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
                  inputMode="text"
                  autoComplete="off"
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
                  inputMode="text"
                  autoComplete="off"
                  disabled={disabled}
                />
              )}
            </FormField>
          </FormGroup>
          <FormField name="notes">
            {(field) => (
              <TextAreaField
                floatingLabel
                id={field.id}
                label="Notes"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                inputMode="text"
                autoComplete="off"
                disabled={disabled}
              />
            )}
          </FormField>
          <FormGroup>
            <FormField name="settingKeys">
              {(field) => (
                <SelectField
                  mode="multiple"
                  floatingLabel
                  id={field.id}
                  label="Associated Settings"
                  value={field.value as (string | number)[]}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  disabled={disabled}
                  placeholder="Select setting(s)..."
                  options={SKILL_SETTING_OPTIONS}
                />
              )}
            </FormField>
          </FormGroup>
          <FormGroup>
            <FormField name="category">
              {(field) => (
                <SelectField
                  floatingLabel
                  id={field.id}
                  label="Category"
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  disabled={disabled}
                  placeholder="Select category..."
                  options={SKILL_CATEGORY_OPTIONS}
                />
              )}
            </FormField>
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
                  disabled={disabled}
                  options={SKILL_STATUS_OPTIONS}
                />
              )}
            </FormField>
          </FormGroup>
          <FormGroup>
            <FormField name="defaultAspect">
              {(field) => (
                <SelectField
                  floatingLabel
                  id={field.id}
                  label="Default Aspect"
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  disabled={disabled}
                  placeholder="Optional: Select default aspect..."
                  options={SKILL_ASPECT_OPTIONS}
                />
              )}
            </FormField>
          </FormGroup>
          <FormField name="tags">
            {(field) => (
              <TagInputField
                floatingLabel
                id={field.id}
                label="Tags"
                value={field.value as string[]}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled={disabled}
                placeholder="Type a tag and press comma or enter..."
              />
            )}
          </FormField>
        </Form>
      </CardBody>
    </Card>
  );
};
