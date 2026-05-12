import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import type { SubmitFormValues, SubmitResponse } from './types';
import FileDropzone from './components/FileDropzone/FileDropzone';
import styles from './App.module.css';

const App = () => {
  const [formData, setFormData] = useState<SubmitFormValues>({ name: '', message: '' });
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<SubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      const body = new FormData();
      body.append('name', formData.name);
      body.append('message', formData.message);
      if (file) body.append('file', file);
      const res = await fetch('/api/submit', { method: 'POST', body });
      const data: SubmitResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <main className={styles.card}>
      <h1 className={styles.title}>Form Submission</h1>
      <p className={styles.subtitle}>
        Fill in the details below and submit to see the server response.
      </p>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">Name</label>
          <input
            className={styles.input}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <FileDropzone value={file} onChange={setFile} />
        <div className={styles.field}>
          <label className={styles.label} htmlFor="message">Message</label>
          <textarea
            className={styles.input}
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Write a short message..."
            minLength={10}
          ></textarea>
        </div>
        <button className={styles.button} type="submit">Submit</button>
      </form>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {response && (
        <div className={styles.response}>
          <h2 className={styles.responseTitle}>Response</h2>
          <pre className={styles.responseBody}>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}

export default App;
