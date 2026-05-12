import { describe, it, expect } from 'vitest';
import { validateSubmission } from '../validation.js';

const fakeFile = { path: '/tmp/x' } as Express.Multer.File;

describe('validateSubmission', () => {
  it('returns all three errors for an empty body and no file', () => {
    const { errors } = validateSubmission({}, undefined);
    expect(errors).toEqual({
      name: 'Name is required',
      message: 'Message must be at least 5 characters',
      file: 'Please attach a file',
    });
  });

  it('flags a whitespace-only name', () => {
    const { errors } = validateSubmission({ name: '   ', message: 'hello there' }, fakeFile);
    expect(errors.name).toBe('Name is required');
    expect(errors.message).toBeUndefined();
    expect(errors.file).toBeUndefined();
  });

  it('flags a 4-character message but accepts a 5-character one (boundary)', () => {
    const tooShort = validateSubmission({ name: 'Jay', message: 'hey!' }, fakeFile);
    expect(tooShort.errors.message).toBe('Message must be at least 5 characters');

    const justRight = validateSubmission({ name: 'Jay', message: 'hello' }, fakeFile);
    expect(justRight.errors.message).toBeUndefined();
  });

  it('treats non-string body fields as empty', () => {
    const { name, message, errors } = validateSubmission(
      { name: 42, message: null } as unknown as Record<string, unknown>,
      fakeFile,
    );
    expect(name).toBe('');
    expect(message).toBe('');
    expect(errors.name).toBe('Name is required');
    expect(errors.message).toBe('Message must be at least 5 characters');
  });

  it('returns trimmed name and message with no errors when input is valid', () => {
    const { name, message, errors } = validateSubmission(
      { name: '  Jay  ', message: '  hello world  ' },
      fakeFile,
    );
    expect(name).toBe('Jay');
    expect(message).toBe('hello world');
    expect(errors).toEqual({});
  });
});
