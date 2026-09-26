import { Card, CardBody, CardHeader, FormField, FormGroup, TextField } from '@tapestry/ui';
import type { ResourceEditorTabProps } from '../resourceEditor.types';
import styles from '../ResourceEditor.module.scss';

export default function PresentationTab({ form, disabled }: ResourceEditorTabProps) {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Presentation</h2>
          <p className={styles.sectionSubtitle}>Optional artwork and thumbnails used to present this resource around the store and library surfaces.</p>
        </div>
      </CardHeader>
      <CardBody className={styles.formBody}>
        <FormGroup>
          <FormField name="coverImageUrl">
            {(field) => (
              <TextField floatingLabel id={field.id} label="Cover Image URL" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled} />
            )}
          </FormField>
          <FormField name="thumbnailImageUrl">
            {(field) => (
              <TextField floatingLabel id={field.id} label="Thumbnail URL" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled} />
            )}
          </FormField>
        </FormGroup>

        <FormGroup>
          <FormField name="spineImageUrl">
            {(field) => (
              <TextField floatingLabel id={field.id} label="Spine Image URL" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled} />
            )}
          </FormField>
          <FormField name="bannerImageUrl">
            {(field) => (
              <TextField floatingLabel id={field.id} label="Banner Image URL" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled} />
            )}
          </FormField>
        </FormGroup>
      </CardBody>
    </Card>
  );
}
