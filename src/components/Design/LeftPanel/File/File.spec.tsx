import { fireEvent, render, screen } from '@testing-library/react';

// components
import File from './File';

describe('File snapshots', () => {
  it('should render File', () => {
    // before
    const { asFragment } = render(<File />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('File behaviors', () => {
  it('should default the file name to Untitled', () => {
    // before
    render(<File />);

    // result
    expect(screen.getByRole('textbox', { name: 'Rename file' })).toHaveValue('Untitled');
  });

  it('should keep the renamed name after a commit', () => {
    // before
    render(<File />);
    const field = screen.getByRole('textbox', { name: 'Rename file' });

    // action
    fireEvent.change(field, { target: { value: 'Screenshots' } });
    fireEvent.blur(field);

    // result
    expect(field).toHaveValue('Screenshots');
  });
});
