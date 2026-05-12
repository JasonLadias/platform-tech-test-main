import React from 'react';
import {
  describe, it, expect, vi,
} from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileDropzone from './FileDropzone';

const renderDropzone = (overrides: Partial<React.ComponentProps<typeof FileDropzone>> = {}) => {
  const props: React.ComponentProps<typeof FileDropzone> = {
    value: overrides.value ?? null,
    onChange: overrides.onChange ?? vi.fn(),
    error: overrides.error,
  };
  const utils = render(
    <FileDropzone value={props.value} onChange={props.onChange} error={props.error} />,
  );
  return { ...utils, props };
};

describe('FileDropzone', () => {
  it('renders the browse prompt when no file is selected', () => {
    renderDropzone();
    expect(screen.getByText('Drag a file here, or click to browse')).toBeInTheDocument();
  });

  it('renders the filename, formatted size, and a Remove button when a file is selected', () => {
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'size', { value: 2048 });
    renderDropzone({ value: file });

    expect(screen.getByText('note.txt')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('calls onChange(null) when Remove is clicked', async () => {
    const user = userEvent.setup();
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' });
    const { props } = renderDropzone({ value: file });

    await user.click(screen.getByRole('button', { name: /remove/i }));

    expect(props.onChange).toHaveBeenCalledWith(null);
  });

  it('calls onChange with the file when one is selected via the input', async () => {
    const user = userEvent.setup();
    const { props, container } = renderDropzone();
    const file = new File(['hi'], 'pic.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => expect(props.onChange).toHaveBeenCalledTimes(1));
    expect(props.onChange).toHaveBeenCalledWith(file);
  });

  it('renders the error prop as an alert', () => {
    renderDropzone({ error: 'Please attach a file' });
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Please attach a file');
  });
});
