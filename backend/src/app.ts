import express, { type Request, type Response } from 'express';
import { validateSubmission } from './validation.js';
import {
  upload,
  getRelativeUploadPath,
  removeUploadedFile,
  handleUploadErrors,
} from './upload.js';

const app = express();

app.use(express.json());

app.post('/api/submit', upload.single('file'), (req: Request, res: Response) => {
  const { name, message, errors } = validateSubmission(req.body, req.file);

  if (Object.keys(errors).length > 0) {
    if (req.file) removeUploadedFile(req.file);
    res.status(400).json({ errors });
    return;
  }

  const filePath = getRelativeUploadPath(req.file!);
  res.json({ name, message, filePath });
});

app.use(handleUploadErrors);

app.use((err: unknown, _req: Request, res: Response) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
