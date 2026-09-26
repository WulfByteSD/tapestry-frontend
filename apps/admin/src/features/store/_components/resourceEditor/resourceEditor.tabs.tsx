'use client';

import { useMemo } from 'react';
import type { TabsItem } from '@tapestry/ui';
import type { UseResourceEditorTabsParams } from './resourceEditor.types';
import BasicsTab from './sections/BasicsTab.component';
import PresentationTab from './sections/PresentationTab.component';
import ReleaseTab from './sections/ReleaseTab.component';

export function useResourceEditorTabs({
  form,
  disabled,
  fileList,
  onFileChange,
  onFileRemove,
  beforeUpload,
  isUploading,
  uploadPreviewUrl,
  uploadResourceType,
}: UseResourceEditorTabsParams): TabsItem[] {
  return useMemo(
    () => [
      {
        key: 'basics',
        label: 'Basics',
        children: <BasicsTab form={form} disabled={disabled} />,
      },
      {
        key: 'presentation',
        label: 'Presentation',
        children: <PresentationTab form={form} disabled={disabled} />,
      },
      {
        key: 'release',
        label: 'Release',
        children: (
          <ReleaseTab
            form={form}
            disabled={disabled}
            fileList={fileList}
            onFileChange={onFileChange}
            onFileRemove={onFileRemove}
            beforeUpload={beforeUpload}
            isUploading={isUploading}
            uploadPreviewUrl={uploadPreviewUrl}
            uploadResourceType={uploadResourceType}
          />
        ),
      },
    ],
    [beforeUpload, disabled, fileList, form, isUploading, onFileChange, onFileRemove, uploadPreviewUrl, uploadResourceType]
  );
}
