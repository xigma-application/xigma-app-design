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
    expect(screen.getByRole('button', { name: 'Rename file' })).toHaveTextContent('Untitled');
  });

  it('should keep the renamed name after a commit', () => {
    // before
    render(<File />);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Rename file' }));
    const field = screen.getByRole('textbox', { name: 'Rename file' });
    fireEvent.change(field, { target: { value: 'Screenshots' } });
    fireEvent.blur(field);

    // result
    expect(screen.getByRole('button', { name: 'Rename file' })).toHaveTextContent('Screenshots');
  });
});
