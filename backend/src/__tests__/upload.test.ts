import {
  describe, it, expect, vi, afterEach,
} from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import {
  getRelativeUploadPath,
  removeUploadedFile,
  handleUploadErrors,
} from '../upload.js';

const backendDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const fakeFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File => ({
  fieldname: 'file',
  originalname: 'note.txt',
  encoding: '7bit',
  mimetype: 'text/plain',
  size: 4,
  destination: path.join(backendDir, 'uploads'),
  filename: 'note.txt',
  path: path.join(backendDir, 'uploads', 'note.txt'),
  buffer: Buffer.from(''),
  stream: undefined as unknown as Express.Multer.File['stream'],
  ...overrides,
});

const mockRes = () => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('getRelativeUploadPath', () => {
  it('returns a path relative to the backend directory', () => {
    const file = fakeFile({ path: path.join(backendDir, 'uploads', '123-abc-note.txt') });
    expect(getRelativeUploadPath(file)).toBe(path.join('uploads', '123-abc-note.txt'));
  });
});

describe('removeUploadedFile', () => {
  it('calls fs.unlink with the file path', () => {
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockImplementation(((_p, cb) => cb(null)) as typeof fs.unlink);
    const file = fakeFile({ path: '/tmp/whatever.txt' });

    removeUploadedFile(file);

    expect(unlinkSpy).toHaveBeenCalledTimes(1);
    expect(unlinkSpy.mock.calls[0][0]).toBe('/tmp/whatever.txt');
  });
});

describe('handleUploadErrors', () => {
  it('responds 400 with a size-limit message for LIMIT_FILE_SIZE', () => {
    const res = mockRes();
    const next = vi.fn();
    const err = new multer.MulterError('LIMIT_FILE_SIZE', 'file');

    handleUploadErrors(err, {} as never, res as never, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ errors: { file: 'File exceeds 5 MB' } });
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 400 with the raw multer message for other MulterErrors', () => {
    const res = mockRes();
    const next = vi.fn();
    const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file');

    handleUploadErrors(err, {} as never, res as never, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ errors: { file: err.message } });
    expect(next).not.toHaveBeenCalled();
  });

  it('passes non-multer errors to next() without touching the response', () => {
    const res = mockRes();
    const next = vi.fn();
    const err = new Error('boom');

    handleUploadErrors(err, {} as never, res as never, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.statusCode).toBe(0);
    expect(res.body).toBeUndefined();
  });
});
