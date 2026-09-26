import { Card, CardBody, CardHeader, FormField, FormGroup, TextField, Upload } from '@tapestry/ui';
import { formatBytes, formatDate, resourceFormatAccept } from '../../../resource.helpers';
import type { ResourceReleaseTabProps } from '../resourceEditor.types';
import styles from '../ResourceEditor.module.scss';

export default function ReleaseTab({
  form,
  disabled,
  fileList,
  onFileChange,
  onFileRemove,
  beforeUpload,
  isUploading,
  uploadPreviewUrl,
  uploadResourceType,
}: ResourceReleaseTabProps) {
  return (
    <Card>
      <CardHeader className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Canonical Release</h2>
          <p className={styles.sectionSubtitle}>Upload the Cloudinary-backed document first, then save the resource with the returned metadata in `currentRelease`.</p>
        </div>
      </CardHeader>
      <CardBody className={styles.formBody}>
        <FormGroup>
          <FormField name="releaseVersion">
            {(field) => (
              <TextField
                floatingLabel
                id={field.id}
                label="Release Version"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled={disabled}
              />
            )}
          </FormField>
          <TextField floatingLabel label="Provider" value="cloudinary" disabled />
        </FormGroup>

        <Upload
          accept={resourceFormatAccept(form.values.format)}
          multiple={false}
          maxCount={1}
          disabled={disabled || isUploading}
          fileList={fileList}
          onChange={onFileChange}
          onRemove={onFileRemove}
          beforeUpload={beforeUpload}
          dropzoneText="Upload canonical resource file"
          dropzoneHint="This posts to `/api/v1/upload/cloudinary/file` and maps the returned metadata into the resource release."
        />

        <div className={styles.notice}>
          The library now assumes `/api/v1/library/resources` is live. Upload first so `assetKey`, `mimeType`, and `sizeBytes` are present before saving.
        </div>

        <div className={styles.metaStrip}>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Asset Key</span>
            <strong className={styles.metaValue}>{form.values.releaseAssetKey || '--'}</strong>
          </div>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>MIME Type</span>
            <strong className={styles.metaValue}>{form.values.releaseMimeType || '--'}</strong>
          </div>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Size</span>
            <strong className={styles.metaValue}>{formatBytes(form.values.releaseSizeBytes)}</strong>
          </div>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Resource Type</span>
            <strong className={styles.metaValue}>{uploadResourceType || '--'}</strong>
          </div>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Current Release Published</span>
            <strong className={styles.metaValue}>{formatDate(form.values.releasePublishedAt ? `${form.values.releasePublishedAt}T00:00:00.000Z` : undefined)}</strong>
          </div>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Delivery URL</span>
            <strong className={styles.metaValue}>{uploadPreviewUrl || '--'}</strong>
          </div>
        </div>

        <FormGroup>
          <FormField name="releasePublishedAt">
            {(field) => (
              <TextField floatingLabel id={field.id} label="Release Published Date" type="date" value={field.value as string} onChange={field.onChange} onBlur={field.onBlur} disabled={disabled} />
            )}
          </FormField>
          <FormField name="releaseAssetKey">
            {(field) => (
              <TextField
                floatingLabel
                id={field.id}
                label="Asset Key"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                helpText="Populated automatically from the Cloudinary upload response."
                disabled
              />
            )}
          </FormField>
        </FormGroup>

        <FormGroup>
          <FormField name="releaseMimeType">
            {(field) => (
              <TextField
                floatingLabel
                id={field.id}
                label="MIME Type"
                value={field.value as string}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled
              />
            )}
          </FormField>
          <FormField name="releaseSizeBytes">
            {(field) => (
              <TextField
                floatingLabel
                id={field.id}
                label="Size (bytes)"
                type="number"
                value={field.value as number | undefined}
                valueMode="number"
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={field.shouldShowError ? field.error : undefined}
                disabled
              />
            )}
          </FormField>
        </FormGroup>
      </CardBody>
    </Card>
  );
}
