export type FieldErrors = { name?: string; message?: string; file?: string };

export type ValidationResult = {
  name: string;
  message: string;
  errors: FieldErrors;
};

export const validateSubmission = (
  body: Record<string, unknown>,
  file: Express.Multer.File | undefined,
): ValidationResult => {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  const errors: FieldErrors = {};
  if (name.length < 1) errors.name = 'Name is required';
  if (message.length < 5) errors.message = 'Message must be at least 5 characters';
  if (!file) errors.file = 'Please attach a file';

  return { name, message, errors };
};
