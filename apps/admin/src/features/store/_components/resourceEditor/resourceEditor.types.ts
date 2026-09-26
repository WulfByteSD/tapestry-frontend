import type { UploadFile, UseFormReturn } from '@tapestry/ui';
import type { ResourceEditorFormValues } from '../../resource.types';

export type ResourceEditorTabProps = {
  form: UseFormReturn<ResourceEditorFormValues>;
  disabled: boolean;
};

export type ResourceReleaseTabProps = ResourceEditorTabProps & {
  fileList: UploadFile[];
  onFileChange: (info: { file: UploadFile; fileList: UploadFile[] }) => Promise<void>;
  onFileRemove: (file: UploadFile) => Promise<boolean>;
  beforeUpload: (file: File, fileList: File[]) => boolean | Promise<boolean>;
  isUploading: boolean;
  uploadPreviewUrl: string;
  uploadResourceType: string;
};

export type UseResourceEditorTabsParams = ResourceReleaseTabProps;
