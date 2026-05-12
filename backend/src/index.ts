import { config } from 'dotenv';
import express, { type Request, type Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.join(__dirname, '../../.env') });
const { BACKEND_PORT } = process.env;

const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      cb(null, `${unique}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const app = express()

app.use(express.json());

app.post('/api/submit', upload.single('file'), (req: Request, res: Response) => {
  const { name, message } = req.body;
  const filePath = req.file
    ? path.relative(path.join(__dirname, '..'), req.file.path)
    : undefined;
  res.json({ name, message, filePath });
});

// eslint-disable-next-line no-console
app.listen(BACKEND_PORT, () => console.log(`Server running on port ${BACKEND_PORT}`));
