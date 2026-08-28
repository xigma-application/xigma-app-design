import { fireEvent, render, screen } from '@testing-library/react';

// components
import Header from './Header';

describe('Header snapshots', () => {
  it('should render Header with the file name', () => {
    // before
    const { asFragment } = render(<Header name="Untitled" onRenameFile={vi.fn()} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Header behaviors', () => {
  it('should show the file name in the rename field', () => {
    // before
    render(<Header name="Screenshots" onRenameFile={vi.fn()} />);

    // result
    expect(screen.getByRole('textbox', { name: 'Rename file' })).toHaveValue('Screenshots');
  });

  it('should call onRenameFile with the committed name', () => {
    // mock
    const onRenameFile = vi.fn();

    // before
    render(<Header name="Untitled" onRenameFile={onRenameFile} />);
    const field = screen.getByRole('textbox', { name: 'Rename file' });

    // action
    fireEvent.change(field, { target: { value: 'Screenshots' } });
    fireEvent.blur(field);

    // result
    expect(onRenameFile).toHaveBeenCalledWith('Screenshots');
  });

  it('should render the menu and collapse buttons', () => {
    // before
    render(<Header name="Untitled" onRenameFile={vi.fn()} />);

    // result
    expect(screen.getByRole('button', { name: 'File menu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse panel' })).toBeInTheDocument();
  });
});
