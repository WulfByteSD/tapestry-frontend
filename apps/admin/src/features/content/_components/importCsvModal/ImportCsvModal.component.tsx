'use client';

import { useState, useCallback, useMemo } from 'react';
import { Modal, Upload, Button, useAlert } from '@tapestry/ui';
import type { UploadFile } from '@tapestry/ui';
import { useImportContentCsv } from '@/lib/content-admin';
import type { ContentAdminResource, ContentImportResult } from '@/lib/content-admin/contentAdmin.types';
import styles from './ImportCsvModal.module.scss';

type ImportCsvModalProps = {
  open: boolean;
  onClose: () => void;
  resource: ContentAdminResource;
};

type ImportStep = 'upload' | 'review';

export default function ImportCsvModal({ open, onClose, resource }: ImportCsvModalProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [step, setStep] = useState<ImportStep>('upload');
  const [dryRunResult, setDryRunResult] = useState<ContentImportResult | null>(null);

  const importMutation = useImportContentCsv();
  const { addAlert } = useAlert();

  const resourceLabel = useMemo(() => {
    const labels: Record<ContentAdminResource, string> = {
      items: 'Items',
      skills: 'Skills',
      abilities: 'Abilities',
    };
    return labels[resource];
  }, [resource]);

  const handleReset = useCallback(() => {
    setFileList([]);
    setStep('upload');
    setDryRunResult(null);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleFileChange = useCallback(
    async (info: { file: UploadFile; fileList: UploadFile[] }) => {
      setFileList(info.fileList);

      // Auto-trigger dry run when a file is added
      if (info.file.status === 'done' && info.file.originFile) {
        try {
          const result = await importMutation.mutateAsync({
            resource,
            file: info.file.originFile,
            mode: 'dry-run',
          });

          setDryRunResult(result.payload);
          setStep('review');
        } catch (error) {
          addAlert({
            type: 'error',
            message: 'Failed to validate CSV file. Please check the format and try again.',
          });
        }
      }
    },
    [importMutation, resource, addAlert]
  );

  const handleCommit = useCallback(async () => {
    const file = fileList[0]?.originFile;
    if (!file) return;

    try {
      const result = await importMutation.mutateAsync({
        resource,
        file,
        mode: 'commit',
      });

      addAlert({
        type: 'success',
        message: `Successfully imported ${result.payload.summary.creates} new and updated ${result.payload.summary.updates} existing ${resourceLabel.toLowerCase()}.`,
      });

      handleClose();
    } catch (error) {
      addAlert({
        type: 'error',
        message: 'Failed to import CSV. Please try again.',
      });
    }
  }, [fileList, importMutation, resource, addAlert, resourceLabel, handleClose]);

  const beforeUpload = useCallback(
    (file: File) => {
      const isCSV = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
      if (!isCSV) {
        addAlert({
          type: 'error',
          message: 'Only CSV files are supported.',
        });
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        addAlert({
          type: 'error',
          message: 'File must be smaller than 10MB.',
        });
        return false;
      }

      return true;
    },
    [addAlert]
  );

  const canCommit = dryRunResult && dryRunResult.summary.invalidRows === 0;
  const hasErrors = dryRunResult && dryRunResult.errors.length > 0;

  return (
    <Modal
      open={open}
      title={`Import ${resourceLabel} from CSV`}
      onCancel={handleClose}
      width={700}
      footer={
        step === 'upload' ? (
          <div className={styles.modalFooter}>
            <Button variant="ghost" tone="neutral" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className={styles.modalFooter}>
            <Button variant="ghost" tone="neutral" onClick={handleReset}>
              Start Over
            </Button>
            <Button tone="gold" onClick={handleCommit} disabled={!canCommit} isLoading={importMutation.isPending}>
              Import {dryRunResult?.summary.creates ?? 0} {resourceLabel}
            </Button>
          </div>
        )
      }
    >
      <div className={styles.content}>
        {step === 'upload' && (
          <div className={styles.uploadStep}>
            <p className={styles.stepDescription}>Upload a CSV file to batch-import {resourceLabel.toLowerCase()}. The file will be validated before import.</p>

            <Upload
              accept=".csv"
              multiple={false}
              maxCount={1}
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              dropzoneText={`Click or drag CSV file to upload`}
              dropzoneHint={`Only .csv files are supported. Maximum file size: 10MB.`}
            />

            {importMutation.isPending && <div className={styles.validatingMessage}>Validating CSV file...</div>}
          </div>
        )}

        {step === 'review' && dryRunResult && (
          <div className={styles.reviewStep}>
            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>Import Summary</h3>

              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Total Rows</span>
                  <span className={styles.summaryValue}>{dryRunResult.summary.totalRows}</span>
                </div>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Valid Rows</span>
                  <span className={styles.summaryValue} data-status="success">
                    {dryRunResult.summary.validRows}
                  </span>
                </div>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Invalid Rows</span>
                  <span className={styles.summaryValue} data-status={dryRunResult.summary.invalidRows > 0 ? 'error' : 'success'}>
                    {dryRunResult.summary.invalidRows}
                  </span>
                </div>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>New Records</span>
                  <span className={styles.summaryValue}>{dryRunResult.summary.creates}</span>
                </div>

                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Updates</span>
                  <span className={styles.summaryValue}>{dryRunResult.summary.updates}</span>
                </div>
              </div>
            </div>

            {hasErrors && (
              <div className={styles.errorsSection}>
                <h3 className={styles.errorsTitle}>Validation Errors ({dryRunResult.errors.length})</h3>
                <p className={styles.errorsDescription}>Fix these errors in your CSV file before importing.</p>

                <div className={styles.errorsList}>
                  {dryRunResult.errors.slice(0, 50).map((error, index) => (
                    <div key={index} className={styles.errorItem}>
                      <span className={styles.errorRow}>Row {error.row}</span>
                      {error.field && <span className={styles.errorField}>{error.field}:</span>}
                      <span className={styles.errorMessage}>{error.message}</span>
                    </div>
                  ))}
                  {dryRunResult.errors.length > 50 && <div className={styles.errorOverflow}>... and {dryRunResult.errors.length - 50} more errors</div>}
                </div>
              </div>
            )}

            {canCommit && (
              <div className={styles.successMessage}>
                ✓ All rows are valid. Ready to import {dryRunResult.summary.creates} new and update {dryRunResult.summary.updates} existing {resourceLabel.toLowerCase()}.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
