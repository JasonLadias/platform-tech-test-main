import React, { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import classNames from 'classnames';
import styles from './FileDropzone.module.css';

const MAX_SIZE = 5 * 1024 * 1024;
const LABEL = 'Attachment';

type FileDropzoneProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  error: string | undefined;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function FileDropzone({ value, onChange, error }: FileDropzoneProps) {
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const reason = rejections[0].errors[0];
        const message = reason?.code === 'file-too-large'
          ? `File exceeds ${formatBytes(MAX_SIZE)}`
          : (reason?.message ?? 'File was rejected');
        setRejectionError(message);
        return;
      }
      setRejectionError(null);
      if (accepted[0]) onChange(accepted[0]);
    },
    [onChange],
  );

  const {
    getRootProps, getInputProps, isDragActive, isDragReject,
  } = useDropzone({
    multiple: false,
    maxSize: MAX_SIZE,
    disabled: value !== null,
    onDrop,
  });

  const displayedError = error ?? rejectionError;

  const dropzoneClassName = classNames(styles.dropzone, {
    [styles.dropzoneActive]: isDragActive,
    [styles.dropzoneReject]: isDragReject || Boolean(displayedError),
  });

  const handleRemove = () => {
    setRejectionError(null);
    onChange(null);
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{LABEL}</span>
      {value ? (
        <div className={styles.selected}>
          <div className={styles.selectedInfo}>
            <span className={styles.selectedName}>{value.name}</span>
            <span className={styles.selectedSize}>
              {formatBytes(value.size)}
            </span>
          </div>
          <button
            type="button"
            className={styles.removeButton}
            onClick={handleRemove}
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          {...getRootProps({
            className: dropzoneClassName,
            'aria-label': LABEL,
          })}
        >
          <input {...getInputProps()} />
          <span className={styles.primaryText}>
            {isDragActive
              ? 'Drop the file here'
              : 'Drag a file here, or click to browse'}
          </span>
          <span className={styles.secondaryText}>
            Up to
            {formatBytes(MAX_SIZE)}
          </span>
        </div>
      )}
      {displayedError && (
        <span className={styles.error} role="alert">
          {displayedError}
        </span>
      )}
    </div>
  );
}

export default FileDropzone;
