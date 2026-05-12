import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import classNames from 'classnames';
import styles from './FileDropzone.module.css';

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

type FileDropzoneProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  maxSize?: number;
  disabled?: boolean;
  label?: string;
  error?: string;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function FileDropzone({
  value,
  onChange,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  label = 'Attachment',
  error,
}: FileDropzoneProps) {
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const reason = rejections[0].errors[0];
        const message = reason?.code === 'file-too-large'
          ? `File exceeds ${formatBytes(maxSize)}`
          : reason?.message ?? 'File was rejected';
        setRejectionError(message);
        return;
      }
      setRejectionError(null);
      if (accepted[0]) onChange(accepted[0]);
    },
    [maxSize, onChange],
  );

  const {
    getRootProps, getInputProps, isDragActive, isDragReject,
  } = useDropzone({
    multiple: false,
    maxSize,
    disabled: disabled || value !== null,
    onDrop,
  });

  const displayedError = error ?? rejectionError;

  const dropzoneClassName = classNames(styles.dropzone, {
    [styles.dropzoneActive]: isDragActive,
    [styles.dropzoneReject]: isDragReject || Boolean(displayedError),
    [styles.dropzoneDisabled]: disabled,
  });

  const handleRemove = () => {
    setRejectionError(null);
    onChange(null);
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      {value ? (
        <div className={styles.selected}>
          <div className={styles.selectedInfo}>
            <span className={styles.selectedName}>{value.name}</span>
            <span className={styles.selectedSize}>{formatBytes(value.size)}</span>
          </div>
          <button
            type="button"
            className={styles.removeButton}
            onClick={handleRemove}
            disabled={disabled}
          >
            Remove
          </button>
        </div>
      ) : (
        <div {...getRootProps({ className: dropzoneClassName, 'aria-label': label })}>
          <input {...getInputProps()} />
          <span className={styles.primaryText}>
            {isDragActive ? 'Drop the file here' : 'Drag a file here, or click to browse'}
          </span>
          <span className={styles.secondaryText}>
            Up to
            {formatBytes(maxSize)}
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
