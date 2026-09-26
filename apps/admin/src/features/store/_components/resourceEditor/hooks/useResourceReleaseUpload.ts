'use client';

import { useCallback, useState } from 'react';
import { deriveApiErrorMessage, useAlert, type UploadFile, type UseFormReturn } from '@tapestry/ui';
import { applyUploadedAsset } from '../../../resource.helpers';
import type { ResourceEditorFormValues } from '../../../resource.types';
import { useUploadStoreResourceFile } from '../../../_hooks/useStoreResources';

type UseResourceReleaseUploadParams = {
  addAlert: ReturnType<typeof useAlert>['addAlert'];
  form: UseFormReturn<ResourceEditorFormValues>;
  uploadResourceFile: ReturnType<typeof useUploadStoreResourceFile>;
};

function createSyntheticUploadFile(values: ResourceEditorFormValues): UploadFile[] {
  if (!values.releaseAssetKey.trim()) {
    return [];
  }

  return [
    {
      uid: `existing-${values.releaseAssetKey}`,
      name: values.releaseAssetKey.split('/').pop() || values.releaseAssetKey,
      size: values.releaseSizeBytes ?? 0,
      type: values.releaseMimeType || 'application/octet-stream',
      status: 'done',
    },
  ];
}

export function useResourceReleaseUpload({ addAlert, form, uploadResourceFile }: UseResourceReleaseUploadParams) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState('');
  const [uploadResourceType, setUploadResourceType] = useState('');

  const resetUploadMetadata = useCallback(() => {
    setUploadPreviewUrl('');
    setUploadResourceType('');
  }, []);

  const syncWithValues = useCallback(
    (values: ResourceEditorFormValues) => {
      setFileList(createSyntheticUploadFile(values));
      resetUploadMetadata();
    },
    [resetUploadMetadata]
  );

  const resetForNewResource = useCallback(() => {
    setFileList([]);
    resetUploadMetadata();
  }, [resetUploadMetadata]);

  const beforeUpload = useCallback(
    (file: File) => {
      const maxBytes = 100 * 1024 * 1024;
      if (file.size > maxBytes) {
        addAlert({
          type: 'error',
          message: 'File must be smaller than 100MB.',
        });
        return false;
      }

      if (form.values.format === 'pdf' && !file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        addAlert({
          type: 'error',
          message: 'PDF resources should upload a .pdf file.',
        });
        return false;
      }

      return true;
    },
    [addAlert, form.values.format]
  );

  const handleFileChange = useCallback(
    async (info: { file: UploadFile; fileList: UploadFile[] }) => {
      if (!info.file.originFile) {
        setFileList(info.fileList);
        return;
      }

      const uploadingFile: UploadFile = {
        ...info.file,
        status: 'uploading',
      };

      setFileList([uploadingFile]);

      try {
        const result = await uploadResourceFile.mutateAsync({
          file: info.file.originFile,
          type: form.values.format,
        });
        const asset = result.payload[0];

        if (!asset) {
          throw new Error('Upload completed without asset metadata.');
        }

        setFileList([
          {
            ...uploadingFile,
            status: 'done',
            name: asset.fileName,
            size: asset.bytes,
            type: asset.mimeType,
          },
        ]);
        setUploadPreviewUrl(asset.url);
        setUploadResourceType(asset.resourceType);
        form.setValues(applyUploadedAsset(form.values, asset), { validate: true, touch: true });

        addAlert({
          type: 'success',
          message: 'File uploaded',
          description: 'Cloudinary metadata has been attached to the resource release.',
        });
      } catch (error) {
        const message = deriveApiErrorMessage(error, 'Failed to upload the canonical resource file.');
        setFileList([
          {
            ...uploadingFile,
            status: 'error',
            error: message,
          },
        ]);

        addAlert({
          type: 'error',
          message: 'Upload failed',
          description: message,
        });
      }
    },
    [addAlert, form, uploadResourceFile]
  );

  const handleFileRemove = useCallback(
    async () => {
      setFileList([]);
      resetUploadMetadata();
      form.setValues(
        {
          ...form.values,
          releaseAssetKey: '',
          releaseMimeType: '',
          releaseSizeBytes: undefined,
        },
        { validate: true, touch: true }
      );
      return true;
    },
    [form, resetUploadMetadata]
  );

  return {
    beforeUpload,
    fileList,
    handleFileChange,
    handleFileRemove,
    isUploading: uploadResourceFile.isPending,
    resetForNewResource,
    syncWithValues,
    uploadPreviewUrl,
    uploadResourceType,
  };
}
