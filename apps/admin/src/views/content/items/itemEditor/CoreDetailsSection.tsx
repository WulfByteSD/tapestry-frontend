import React from 'react';
import { Card, CardBody, CardHeader, Checkbox, Form, FormField, FormGroup, SelectField, TagInputField, TextAreaField, TextField, type UseFormReturn } from '@tapestry/ui';
import { ItemEditorFormValues } from './editor.types';
import { ITEM_SETTING_OPTIONS, ITEM_CATEGORY_OPTIONS, ITEM_STATUS_OPTIONS, ITEM_SLOT_OPTIONS } from './editor.constants';

import styles from './ItemEditor.module.scss';

type CoreDetailsSectionProps = {
  form: UseFormReturn<ItemEditorFormValues>;
  disabled: boolean;
};

export const CoreDetailsSection = ({ form, disabled }: CoreDetailsSectionProps) => {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Core Details</h2>
          <p className={styles.sectionSubtitle}>These fields define the item identity and its content metadata.</p>
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
                  options={ITEM_SETTING_OPTIONS}
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
                  options={ITEM_CATEGORY_OPTIONS}
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
                  options={ITEM_STATUS_OPTIONS}
                />
              )}
            </FormField>
          </FormGroup>
          <FormGroup>
            <FormField name="protection">
              {(field) => (
                <TextField
                  floatingLabel
                  id={field.id}
                  label="Protection"
                  type="number"
                  value={field.value as number}
                  valueMode="number"
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  disabled={disabled}
                  placeholder="0"
                />
              )}
            </FormField>
            <FormField name="slot">
              {(field) => (
                <SelectField
                  floatingLabel
                  id={field.id}
                  label="Equipment Slot"
                  value={field.value as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={field.shouldShowError ? field.error : undefined}
                  disabled={disabled || !form.values.equippable}
                  placeholder="Select slot..."
                  options={ITEM_SLOT_OPTIONS}
                />
              )}
            </FormField>
          </FormGroup>
          <FormGroup>
            <FormField name="equippable">
              {(field) => (
                <div className={styles.checkboxField}>
                  <Checkbox id={field.id} checked={field.value as boolean} onChange={field.onChange} disabled={disabled} label="Equippable" />
                </div>
              )}
            </FormField>
            <FormField name="stackable">
              {(field) => (
                <div className={styles.checkboxField}>
                  <Checkbox id={field.id} checked={field.value as boolean} onChange={field.onChange} disabled={disabled} label="Stackable" />
                </div>
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
