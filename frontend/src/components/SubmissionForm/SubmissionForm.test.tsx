import React from 'react';
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubmissionForm from './SubmissionForm';

const findFileInput = (): HTMLInputElement => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
  if (!input) throw new Error('file input not found');
  return input;
};

const mockJsonResponse = (
  body: unknown,
  init: { ok?: boolean; status?: number } = {},
): Response => ({
  ok: init.ok ?? true,
  status: init.status ?? 200,
  json: () => Promise.resolve(body),
} as Response);

describe('SubmissionForm', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the three fields and a Submit button', () => {
    render(<SubmissionForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByText(/attachment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows all three errors when submitting an empty form', async () => {
    const user = userEvent.setup();
    render(<SubmissionForm />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Message must be at least 5 characters')).toBeInTheDocument();
    expect(screen.getByText('Please attach a file')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('re-validates live after a failed submit attempt', async () => {
    const user = userEvent.setup();
    render(<SubmissionForm />);

    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText('Name is required')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/name/i), 'Jay');

    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    expect(screen.getByText('Message must be at least 5 characters')).toBeInTheDocument();
    expect(screen.getByText('Please attach a file')).toBeInTheDocument();
  });

  it('submits a valid form and renders the response', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(mockJsonResponse({
      name: 'Jay',
      message: 'hello world',
      filePath: 'uploads/abc-note.txt',
    }));

    render(<SubmissionForm />);

    await user.type(screen.getByLabelText(/name/i), 'Jay');
    await user.type(screen.getByLabelText(/message/i), 'hello world');
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' });
    await user.upload(findFileInput(), file);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/submit');
    expect(init.method).toBe('POST');
    const body = init.body as FormData;
    expect(body.get('name')).toBe('Jay');
    expect(body.get('message')).toBe('hello world');
    expect(body.get('file')).toBeInstanceOf(File);
    expect((body.get('file') as File).name).toBe('note.txt');

    const responseBlock = await screen.findByText(/^Response$/);
    const pre = responseBlock.parentElement!.querySelector('pre')!;
    expect(within(pre).getByText(/uploads\/abc-note\.txt/)).toBeInTheDocument();
  });

  it('trims name and message before sending', async () => {
    const user = userEvent.setup();
    render(<SubmissionForm />);

    await user.type(screen.getByLabelText(/name/i), '  Jay  ');
    await user.type(screen.getByLabelText(/message/i), '  hello world  ');
    await user.upload(findFileInput(), new File(['x'], 'x.txt'));

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = fetchMock.mock.calls[0][1].body as FormData;
    expect(body.get('name')).toBe('Jay');
    expect(body.get('message')).toBe('hello world');
  });

  it('surfaces server-returned field errors when the API responds 400', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(mockJsonResponse(
      { errors: { file: 'File exceeds 5 MB' } },
      { ok: false, status: 400 },
    ));

    render(<SubmissionForm />);

    await user.type(screen.getByLabelText(/name/i), 'Jay');
    await user.type(screen.getByLabelText(/message/i), 'hello world');
    await user.upload(findFileInput(), new File(['x'], 'x.txt'));

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText('File exceeds 5 MB')).toBeInTheDocument();
    expect(screen.queryByText(/^Response$/)).not.toBeInTheDocument();
  });

  it('renders an error alert when fetch rejects', async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValueOnce(new Error('Network down'));

    render(<SubmissionForm />);

    await user.type(screen.getByLabelText(/name/i), 'Jay');
    await user.type(screen.getByLabelText(/message/i), 'hello world');
    await user.upload(findFileInput(), new File(['x'], 'x.txt'));

    await user.click(screen.getByRole('button', { name: /submit/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network down');
  });
});
