import {
  Button,
  Card,
  CardBody,
  CardHeader,
  FormField,
  FormGroup,
  SelectField,
  TagInputField,
  TextAreaField,
  TextField,
  type SelectOption,
} from '@tapestry/ui';
import {
  RESOURCE_ACCESS_POLICY_OPTIONS,
  RESOURCE_FORMAT_OPTIONS,
  RESOURCE_KIND_OPTIONS,
  RESOURCE_STATUS_OPTIONS,
  slugifyValue,
} from '../../../resource.helpers';
import type { ResourceEditorTabProps } from '../resourceEditor.types';
import styles from '../ResourceEditor.module.scss';

export default function BasicsTab({ form, disabled }: ResourceEditorTabProps) {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Identity & Access</h2>
          <p className={styles.sectionSubtitle}>Describe the library resource itself and how it should be exposed to players.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          tone="neutral"
          onClick={() => {
            const derived = slugifyValue(form.values.title);
            form.setValue('key', derived, { touch: true, validate: true });
            form.setValue('slug', derived, { touch: true, validate: true });
          }}
          disabled={disabled || !form.values.title.trim()}
        >
          Derive Key & Slug
        </Button>
      </CardHeader>
      <CardBody className={styles.formBody}>
        <FormGroup>
          <FormField name="title">
            {(field) => (
              <TextField
                floatingLabel
                id={field.id}
                label="Title"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled={disabled}
              />
            )}
          </FormField>
          <FormField name="subtitle">
            {(field) => (
              <TextField floatingLabel id={field.id} label="Subtitle" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled} />
            )}
          </FormField>
        </FormGroup>

        <FormGroup>
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
                helpText="Slug-like identifier used across the library and store."
                disabled={disabled}
              />
            )}
          </FormField>
          <FormField name="slug">
            {(field) => (
              <TextField
                floatingLabel
                id={field.id}
                label="Slug"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                helpText="Preferred public-facing path segment."
                disabled={disabled}
              />
            )}
          </FormField>
        </FormGroup>

        <FormField name="summary">
          {(field) => (
            <TextAreaField floatingLabel id={field.id} label="Summary" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} rows={3} disabled={disabled} />
          )}
        </FormField>

        <FormField name="description">
          {(field) => (
            <TextAreaField floatingLabel id={field.id} label="Description" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} rows={6} disabled={disabled} />
          )}
        </FormField>

        <FormGroup>
          <FormField name="kind">
            {(field) => (
              <SelectField
                floatingLabel
                id={field.id}
                label="Kind"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={RESOURCE_KIND_OPTIONS as unknown as SelectOption[]}
                disabled={disabled}
              />
            )}
          </FormField>
          <FormField name="format">
            {(field) => (
              <SelectField
                floatingLabel
                id={field.id}
                label="Format"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={RESOURCE_FORMAT_OPTIONS as unknown as SelectOption[]}
                disabled={disabled}
              />
            )}
          </FormField>
        </FormGroup>

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
                options={RESOURCE_STATUS_OPTIONS as unknown as SelectOption[]}
                disabled={disabled}
              />
            )}
          </FormField>
          <FormField name="accessPolicy">
            {(field) => (
              <SelectField
                floatingLabel
                id={field.id}
                label="Access Policy"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={RESOURCE_ACCESS_POLICY_OPTIONS as unknown as SelectOption[]}
                disabled={disabled}
              />
            )}
          </FormField>
        </FormGroup>

        <FormGroup>
          <FormField name="tags">
            {(field) => (
              <TagInputField
                floatingLabel
                id={field.id}
                label="Tags"
                value={field.value as string[]}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
                placeholder="Type a tag and press comma or enter..."
              />
            )}
          </FormField>
          <FormField name="authors">
            {(field) => (
              <TagInputField
                floatingLabel
                id={field.id}
                label="Authors"
                value={field.value as string[]}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
                placeholder="Type an author and press comma or enter..."
              />
            )}
          </FormField>
        </FormGroup>

        <FormField name="publishedAt">
          {(field) => (
            <TextField floatingLabel id={field.id} label="Published Date" type="date" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled} />
          )}
        </FormField>
      </CardBody>
    </Card>
  );
}
