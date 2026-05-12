import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import type { ErrorRequestHandler } from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024;

fs.mkdirSync(uploadsDir, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      cb(null, `${unique}-${file.originalname}`);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
});

export const getRelativeUploadPath = (file: Express.Multer.File): string => path.relative(path.join(__dirname, '..'), file.path);

export const removeUploadedFile = (file: Express.Multer.File): void => {
  fs.unlink(file.path, () => {});
};

export const handleUploadErrors: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? `File exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB`
      : err.message;
    res.status(400).json({ errors: { file: message } });
    return;
  }
  next(err);
};
