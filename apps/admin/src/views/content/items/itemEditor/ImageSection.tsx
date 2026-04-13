import React from 'react';
import Image from 'next/image';
import { Card, CardBody, CardHeader, Form, FormField, TextField, Upload, type UseFormReturn } from '@tapestry/ui';
import { ItemEditorFormValues } from './editor.types';

import styles from './ItemEditor.module.scss';

type ImageSectionProps = {
  form: UseFormReturn<ItemEditorFormValues>;
  disabled: boolean;
};

export const ImageSection = ({ form, disabled }: ImageSectionProps) => {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Image</h2>
          <p className={styles.sectionSubtitle}>Set an image URL or upload a file directly once cloud storage is available.</p>
        </div>
      </CardHeader>
      <CardBody>
        <div className={styles.imageSectionLayout}>
          <div className={styles.imagePreviewPanel}>
            {form.values.imageUrl ? (
              <Image src={form.values.imageUrl} alt={form.values.name || 'Item preview'} fill style={{ objectFit: 'contain' }} unoptimized />
            ) : (
              <div className={styles.imagePreviewEmpty}>
                <span className={styles.imagePreviewEmptyText}>No image</span>
              </div>
            )}
          </div>

          <div className={styles.imageFieldPanel}>
            <Form form={form} className={styles.form}>
              <FormField name="imageUrl">
                {(field) => (
                  <TextField
                    floatingLabel
                    id={field.id}
                    label="Image URL"
                    value={field.value as string}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={field.shouldShowError ? field.error : undefined}
                    inputMode="url"
                    autoComplete="off"
                    disabled={disabled}
                    placeholder="https://..."
                  />
                )}
              </FormField>
            </Form>

            <Upload disabled dropzoneText="Upload image" dropzoneHint="Cloud storage coming soon." showFileList={false} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
