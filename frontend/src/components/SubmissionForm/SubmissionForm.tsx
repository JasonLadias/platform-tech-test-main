import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import classNames from 'classnames';
import FileDropzone from '../FileDropzone/FileDropzone';
import styles from './SubmissionForm.module.css';

type SubmitFormValues = {
  name: string;
  message: string;
};

type SubmitResponse = {
  name: string;
  message: string;
  filePath?: string;
};

type FieldErrors = { name?: string; message?: string; file?: string };

const validate = (
  values: { name: string; message: string },
  file: File | null,
): FieldErrors => {
  const errors: FieldErrors = {};
  if (values.name.trim().length < 1) errors.name = 'Name is required';
  if (values.message.trim().length < 5) {
    errors.message = 'Message must be at least 5 characters';
  }
  if (!file) errors.file = 'Please attach a file';
  return errors;
};

function SubmissionForm() {
  const [formData, setFormData] = useState<SubmitFormValues>({
    name: '',
    message: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [response, setResponse] = useState<SubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (submitAttempted) {
      setErrors(validate(nextData, file));
    }
  };

  const handleFileChange = (next: File | null) => {
    setFile(next);
    if (submitAttempted) {
      setErrors(validate(formData, next));
    }
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitAttempted(true);

    const trimmed = {
      name: formData.name.trim(),
      message: formData.message.trim(),
    };
    const nextErrors = validate(trimmed, file);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const body = new FormData();
      body.append('name', trimmed.name);
      body.append('message', trimmed.message);
      body.append('file', file as File);
      const res = await fetch('/api/submit', { method: 'POST', body });
      const data: SubmitResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            Name
          </label>
          <input
            className={classNames(styles.input, {
              [styles.inputInvalid]: errors.name,
            })}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <span id="name-error" className={styles.fieldError} role="alert">
              {errors.name}
            </span>
          )}
        </div>
        <FileDropzone
          value={file}
          onChange={handleFileChange}
          error={errors.file}
        />
        <div className={styles.field}>
          <label className={styles.label} htmlFor="message">
            Message
          </label>
          <textarea
            className={classNames(styles.input, {
              [styles.inputInvalid]: errors.message,
            })}
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Write a short message..."
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <span id="message-error" className={styles.fieldError} role="alert">
              {errors.message}
            </span>
          )}
        </div>
        <button className={styles.button} type="submit">
          Submit
        </button>
      </form>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {response && (
        <div className={styles.response}>
          <h2 className={styles.responseTitle}>Response</h2>
          <pre className={styles.responseBody}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}

export default SubmissionForm;
