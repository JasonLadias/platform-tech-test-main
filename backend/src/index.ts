import { config } from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateSubmission } from './validation.js';
import {
  upload,
  getRelativeUploadPath,
  removeUploadedFile,
  handleUploadErrors,
} from './upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.join(__dirname, '../../.env') });
const { BACKEND_PORT } = process.env;

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

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// eslint-disable-next-line no-console
app.listen(BACKEND_PORT, () => console.log(`Server running on port ${BACKEND_PORT}`));
