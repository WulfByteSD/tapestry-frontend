import React from 'react';
import { Card, CardBody, CardHeader, Form, FormField, FormGroup, SelectField, TagInputField, TextAreaField, TextField, type UseFormReturn } from '@tapestry/ui';
import { AbilityEditorFormValues } from './editor.types';
import {
  ABILITY_SETTING_OPTIONS,
  ABILITY_CATEGORY_OPTIONS,
  ABILITY_STATUS_OPTIONS,
  ABILITY_SOURCE_TYPE_OPTIONS,
  ABILITY_ACTIVATION_OPTIONS,
  ABILITY_USAGE_MODEL_OPTIONS,
  ABILITY_ASPECT_OPTIONS,
} from './editor.constants';

import styles from './AbilityEditor.module.scss';

type CoreDetailsSectionProps = {
  form: UseFormReturn<AbilityEditorFormValues>;
  disabled: boolean;
};

export const CoreDetailsSection = ({ form, disabled }: CoreDetailsSectionProps) => {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Core Details</h2>
          <p className={styles.sectionSubtitle}>These fields define the ability identity and its content metadata.</p>
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
          <FormField name="summary">
            {(field) => (
              <TextAreaField
                floatingLabel
                id={field.id}
                label="Summary"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                inputMode="text"
                autoComplete="off"
                disabled={disabled}
                placeholder="Brief description of the ability..."
              />
            )}
          </FormField>
          <FormField name="effectText">
            {(field) => (
              <TextAreaField
                floatingLabel
                id={field.id}
                label="Effect Text"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                inputMode="text"
                autoComplete="off"
                disabled={disabled}
                placeholder="Detailed mechanical effects..."
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
                  options={ABILITY_SETTING_OPTIONS}
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
                  options={ABILITY_CATEGORY_OPTIONS}
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
                  options={ABILITY_STATUS_OPTIONS}
                />
              )}
            </FormField>
          </FormGroup>
          <FormGroup>
            <FormField name="sourceType">
              {(field) => (
                <SelectField
                  floatingLabel
                  id={field.id}
                  label="Source Type"
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  disabled={disabled}
                  options={ABILITY_SOURCE_TYPE_OPTIONS}
                />
              )}
            </FormField>
            <FormField name="activation">
              {(field) => (
                <SelectField
                  floatingLabel
                  id={field.id}
                  label="Activation"
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  disabled={disabled}
                  options={ABILITY_ACTIVATION_OPTIONS}
                />
              )}
            </FormField>
            <FormField name="usageModel">
              {(field) => (
                <SelectField
                  floatingLabel
                  id={field.id}
                  label="Usage Model"
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  disabled={disabled}
                  options={ABILITY_USAGE_MODEL_OPTIONS}
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
                  options={ABILITY_ASPECT_OPTIONS}
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
