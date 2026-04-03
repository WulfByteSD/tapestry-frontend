import type { ReactNode } from 'react';

export type UploadFileStatus = 'uploading' | 'done' | 'error' | 'removed';

export type UploadFile = {
  uid: string;
  name: string;
  size: number;
  type: string;
  status: UploadFileStatus;
  originFile?: File;
  error?: Error | string;
};

export type UploadChangeInfo = {
  file: UploadFile;
  fileList: UploadFile[];
};

export type BeforeUploadResult = boolean | Promise<boolean>;

export type UploadProps = {
  /** File type filter (e.g. ".csv", "image/*", ".pdf,.doc") */
  accept?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Disable the upload component */
  disabled?: boolean;
  /** Maximum number of files allowed */
  maxCount?: number;
  /** Controlled file list */
  fileList?: UploadFile[];
  /** Default file list (uncontrolled) */
  defaultFileList?: UploadFile[];
  /** Callback when file list changes */
  onChange?: (info: UploadChangeInfo) => void;
  /** Callback when removing a file. Return false to prevent removal */
  onRemove?: (file: UploadFile) => void | boolean | Promise<boolean>;
  /** Hook before file is added. Return false to reject the file */
  beforeUpload?: (file: File, fileList: File[]) => BeforeUploadResult;
  /** Custom trigger/dropzone content */
  children?: ReactNode;
  /** Custom CSS class */
  className?: string;
  /** Dropzone primary text */
  dropzoneText?: string;
  /** Dropzone hint text */
  dropzoneHint?: string;
  /** Show file list */
  showFileList?: boolean;
};
