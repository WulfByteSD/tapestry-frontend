import { Button, Card, CardBody, CardHeader, FormField, FormGroup, TextField } from '@tapestry/ui';
import { createEmptyGalleryEntry } from '../../../store.helpers';
import type { ProductEditorTabProps } from '../productEditor.types';
import styles from '../ProductEditor.module.scss';

export default function PresentationTab({ form, disabled }: ProductEditorTabProps) {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Storefront Presentation</h2>
          <p className={styles.sectionSubtitle}>Configure the main imagery and any gallery entries used for richer product storytelling.</p>
        </div>
      </CardHeader>
      <CardBody className={styles.formBody}>
        <FormGroup>
          <FormField name="imageUrl">
            {(field) => (
              <TextField floatingLabel id={field.id} label="Image URL" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled} />
            )}
          </FormField>
          <FormField name="coverImageUrl">
            {(field) => (
              <TextField floatingLabel id={field.id} label="Cover Image URL" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled} />
            )}
          </FormField>
        </FormGroup>

        <FormField name="gallery">
          {(field) => (
            <div className={styles.sectionStack}>
              <div className={styles.subsectionHeader}>
                <div>
                  <h3 className={styles.subsectionTitle}>Gallery</h3>
                  <p className={styles.subsectionCopy}>Add supporting images for the storefront gallery. Empty rows are ignored on submit.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  tone="neutral"
                  onClick={() => {
                    form.setValue('gallery', [...form.values.gallery, createEmptyGalleryEntry()], { touch: true, validate: true });
                  }}
                  disabled={disabled}
                >
                  Add Image
                </Button>
              </div>

              {form.values.gallery.length === 0 ? (
                <div className={styles.emptyState}>No gallery entries yet.</div>
              ) : (
                <div className={styles.collectionStack}>
                  {form.values.gallery.map((entry, index) => (
                    <div key={`gallery-${index}`} className={styles.collectionCard}>
                      <div className={styles.collectionCardHeader}>
                        <strong>Gallery Image {index + 1}</strong>
                        <Button
                          type="button"
                          variant="ghost"
                          tone="danger"
                          onClick={() => {
                            form.setValue(
                              'gallery',
                              form.values.gallery.filter((_, galleryIndex) => galleryIndex !== index),
                              { touch: true, validate: true }
                            );
                          }}
                          disabled={disabled}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className={styles.collectionCardBody}>
                        <TextField
                          floatingLabel
                          label="URL"
                          value={entry.url}
                          onChange={(event) => {
                            const nextGallery = [...form.values.gallery];
                            nextGallery[index] = {
                              ...entry,
                              url: event.target.value,
                            };
                            form.setValue('gallery', nextGallery, { touch: true, validate: true });
                          }}
                          disabled={disabled}
                        />
                        <TextField
                          floatingLabel
                          label="Alt Text"
                          value={entry.alt}
                          onChange={(event) => {
                            const nextGallery = [...form.values.gallery];
                            nextGallery[index] = {
                              ...entry,
                              alt: event.target.value,
                            };
                            form.setValue('gallery', nextGallery, { touch: true, validate: true });
                          }}
                          disabled={disabled}
                        />
                        <TextField
                          floatingLabel
                          label="Caption"
                          value={entry.caption}
                          onChange={(event) => {
                            const nextGallery = [...form.values.gallery];
                            nextGallery[index] = {
                              ...entry,
                              caption: event.target.value,
                            };
                            form.setValue('gallery', nextGallery, { touch: true, validate: true });
                          }}
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {field.shouldShowError && field.error ? <p className={styles.errorText}>{field.error}</p> : null}
            </div>
          )}
        </FormField>
      </CardBody>
    </Card>
  );
}
