'use client';

import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { BiUpload, BiX, BiFile, BiCheck, BiError } from 'react-icons/bi';
import type { UploadProps, UploadFile, UploadChangeInfo } from './upload.types';
import styles from './Upload.module.scss';

function generateUid() {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function fileToUploadFile(file: File): UploadFile {
  return {
    uid: generateUid(),
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'done',
    originFile: file,
  };
}

export default function Upload({
  accept,
  multiple = false,
  disabled = false,
  maxCount,
  fileList: controlledFileList,
  defaultFileList = [],
  onChange,
  onRemove,
  beforeUpload,
  children,
  className = '',
  dropzoneText = 'Click or drag file to this area to upload',
  dropzoneHint = 'Support for a single or bulk upload.',
  showFileList = true,
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalFileList, setInternalFileList] = useState<UploadFile[]>(defaultFileList);

  const isControlled = controlledFileList !== undefined;
  const currentFileList = isControlled ? controlledFileList : internalFileList;

  const updateFileList = useCallback(
    (newFileList: UploadFile[]) => {
      if (!isControlled) {
        setInternalFileList(newFileList);
      }
    },
    [isControlled]
  );

  const triggerChange = useCallback(
    (file: UploadFile, newFileList: UploadFile[]) => {
      onChange?.({ file, fileList: newFileList });
    },
    [onChange]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      let fileArray = Array.from(files);

      // Respect maxCount
      if (maxCount !== undefined) {
        const remaining = maxCount - currentFileList.length;
        if (remaining <= 0) return;
        fileArray = fileArray.slice(0, remaining);
      }

      // beforeUpload validation
      if (beforeUpload) {
        const filteredFiles: File[] = [];
        for (const file of fileArray) {
          try {
            const result = await beforeUpload(file, fileArray);
            if (result !== false) {
              filteredFiles.push(file);
            }
          } catch {
            // Reject file if beforeUpload throws
          }
        }
        fileArray = filteredFiles;
      }

      if (fileArray.length === 0) return;

      const newFiles = fileArray.map(fileToUploadFile);
      const newFileList = multiple ? [...currentFileList, ...newFiles] : newFiles;

      updateFileList(newFileList);

      // Trigger onChange for each new file
      newFiles.forEach((file) => {
        triggerChange(file, newFileList);
      });
    },
    [beforeUpload, currentFileList, maxCount, multiple, triggerChange, updateFileList]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input to allow re-selecting the same file
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  const handleRemove = useCallback(
    async (file: UploadFile) => {
      if (onRemove) {
        const result = await onRemove(file);
        if (result === false) return;
      }

      const newFileList = currentFileList.filter((f) => f.uid !== file.uid);
      updateFileList(newFileList);

      const removedFile = { ...file, status: 'removed' as const };
      triggerChange(removedFile, newFileList);
    },
    [currentFileList, onRemove, triggerChange, updateFileList]
  );

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'done':
        return <BiCheck className={styles.statusIconSuccess} />;
      case 'error':
        return <BiError className={styles.statusIconError} />;
      case 'uploading':
        return <div className={styles.spinner} />;
      default:
        return <BiFile className={styles.statusIcon} />;
    }
  };

  return (
    <div className={`${styles.uploadContainer} ${className}`}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className={styles.hiddenInput}
          aria-label="File upload input"
        />

        {children || (
          <div className={styles.dropzoneContent}>
            <BiUpload className={styles.uploadIcon} aria-hidden="true" />
            <p className={styles.dropzoneText}>{dropzoneText}</p>
            {dropzoneHint && <p className={styles.dropzoneHint}>{dropzoneHint}</p>}
          </div>
        )}
      </div>

      {showFileList && currentFileList.length > 0 && (
        <div className={styles.fileList}>
          {currentFileList.map((file) => (
            <div key={file.uid} className={styles.fileItem} data-status={file.status}>
              <div className={styles.fileIcon}>{getStatusIcon(file.status)}</div>

              <div className={styles.fileInfo}>
                <div className={styles.fileName} title={file.name}>
                  {file.name}
                </div>
                <div className={styles.fileSize}>{formatFileSize(file.size)}</div>
                {file.error && <div className={styles.fileError}>{String(file.error)}</div>}
              </div>

              <button
                type="button"
                className={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(file);
                }}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
              >
                <BiX />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
