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
import { slugifyValue, STORE_STATUS_OPTIONS, STORE_VISIBILITY_OPTIONS } from '../../../store.helpers';
import type { ProductEditorTabProps } from '../productEditor.types';
import styles from '../ProductEditor.module.scss';

export default function BasicsTab({ form, disabled }: ProductEditorTabProps) {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Identity & Visibility</h2>
          <p className={styles.sectionSubtitle}>Define how this product is identified in the catalog and how visible it should be to players.</p>
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
                helpText="Slug-like identifier used for stable product keys."
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
                helpText="Optional. Leave blank to let the server derive it from the title."
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
                options={STORE_STATUS_OPTIONS as unknown as SelectOption[]}
                disabled={disabled}
              />
            )}
          </FormField>
          <FormField name="visibility">
            {(field) => (
              <SelectField
                floatingLabel
                id={field.id}
                label="Visibility"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                options={STORE_VISIBILITY_OPTIONS as unknown as SelectOption[]}
                disabled={disabled}
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
      </CardBody>
    </Card>
  );
}
