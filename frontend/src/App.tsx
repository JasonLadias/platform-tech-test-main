import SubmissionForm from './components/SubmissionForm/SubmissionForm';
import styles from './App.module.css';

const App = () => (
  <main className={styles.card}>
    <h1 className={styles.title}>Form Submission</h1>
    <p className={styles.subtitle}>
      Fill in the details below and submit to see the server response.
    </p>
    <SubmissionForm />
  </main>
);

export default App;
