import {
  describe, it, expect, afterEach,
} from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../app.js';

const backendDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const uploadsDir = path.join(backendDir, 'uploads');

const createdFiles: string[] = [];
const rememberFile = (filePath: string | undefined): void => {
  if (filePath) createdFiles.push(path.join(backendDir, filePath));
};

afterEach(() => {
  while (createdFiles.length) {
    const filePath = createdFiles.pop()!;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

describe('POST /api/submit', () => {
  it('accepts a valid submission and returns the relative file path', async () => {
    const res = await request(app)
      .post('/api/submit')
      .field('name', 'Jay')
      .field('message', 'hello world')
      .attach('file', Buffer.from('hello'), 'note.txt');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Jay');
    expect(res.body.message).toBe('hello world');
    expect(typeof res.body.filePath).toBe('string');
    expect(res.body.filePath.startsWith(`uploads${path.sep}`)).toBe(true);

    rememberFile(res.body.filePath);
    expect(fs.existsSync(path.join(backendDir, res.body.filePath))).toBe(true);
  });

  it('400s when name is missing', async () => {
    const res = await request(app)
      .post('/api/submit')
      .field('message', 'hello world')
      .attach('file', Buffer.from('hello'), 'note.txt');

    expect(res.status).toBe(400);
    expect(res.body.errors.name).toBe('Name is required');
  });

  it('400s when message is missing', async () => {
    const res = await request(app)
      .post('/api/submit')
      .field('name', 'Jay')
      .attach('file', Buffer.from('hello'), 'note.txt');

    expect(res.status).toBe(400);
    expect(res.body.errors.message).toBe('Message must be at least 5 characters');
  });

  it('400s when message is too short', async () => {
    const res = await request(app)
      .post('/api/submit')
      .field('name', 'Jay')
      .field('message', 'hey!')
      .attach('file', Buffer.from('hello'), 'note.txt');

    expect(res.status).toBe(400);
    expect(res.body.errors.message).toBe('Message must be at least 5 characters');
  });

  it('400s when no file is attached', async () => {
    const res = await request(app)
      .post('/api/submit')
      .field('name', 'Jay')
      .field('message', 'hello world');

    expect(res.status).toBe(400);
    expect(res.body.errors.file).toBe('Please attach a file');
  });

  it('deletes the uploaded file when validation fails', async () => {
    const before = new Set(fs.readdirSync(uploadsDir));

    const res = await request(app)
      .post('/api/submit')
      .field('message', 'hello world')
      .attach('file', Buffer.from('orphan'), 'orphan.txt');

    expect(res.status).toBe(400);

    const after = fs.readdirSync(uploadsDir);
    const leaked = after.filter((name) => !before.has(name));
    leaked.forEach((name) => createdFiles.push(path.join(uploadsDir, name)));

    expect(leaked).toEqual([]);
  });

  it('400s when the uploaded file exceeds 5 MB', async () => {
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1, 0);
    const res = await request(app)
      .post('/api/submit')
      .field('name', 'Jay')
      .field('message', 'hello world')
      .attach('file', oversized, 'big.bin');

    expect(res.status).toBe(400);
    expect(res.body.errors.file).toBe('File exceeds 5 MB');
  });
});
