import { fireEvent, render, screen } from '@testing-library/react';

// components
import EditableInput from './EditableInput';

const enterEditing = (name = 'name'): HTMLInputElement => {
  fireEvent.click(screen.getByRole('button', { name }));

  return screen.getByRole('textbox', { name }) as HTMLInputElement;
};

describe('EditableInput snapshots', () => {
  it('should render its value as static text in display mode', () => {
    // before
    const { asFragment } = render(<EditableInput onChange={vi.fn()} value="Untitled" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('EditableInput behaviors', () => {
  it('should show the value as static text in display mode', () => {
    // before
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // result
    expect(screen.getByRole('button', { name: 'name' })).toHaveTextContent('Untitled');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should fall back to the placeholder when the value is empty', () => {
    // before
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} placeholder="Name me" value="" />);

    // result
    expect(screen.getByRole('button', { name: 'name' })).toHaveTextContent('Name me');
  });

  it('should swap the static text for an input on click', () => {
    // before
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // action
    const field = enterEditing();

    // result
    expect(field).toHaveValue('Untitled');
  });

  it('should report the editing state as it enters and leaves edit mode', () => {
    // mock
    const onEditingChange = vi.fn();

    // before
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} onEditingChange={onEditingChange} value="Untitled" />);

    // action
    const field = enterEditing();

    // result
    expect(onEditingChange).toHaveBeenLastCalledWith(true);

    // action
    fireEvent.blur(field);

    // result
    expect(onEditingChange).toHaveBeenLastCalledWith(false);
  });

  it('should enter edit mode on Enter and on Space for keyboard users', () => {
    // before
    const { unmount } = render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // action
    fireEvent.keyDown(screen.getByRole('button', { name: 'name' }), { key: 'Enter' });

    // result
    expect(screen.getByRole('textbox', { name: 'name' })).toBeInTheDocument();

    // before
    unmount();
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // action
    fireEvent.keyDown(screen.getByRole('button', { name: 'name' }), { key: ' ' });

    // result
    expect(screen.getByRole('textbox', { name: 'name' })).toBeInTheDocument();
  });

  it('should ignore other keys on the static text', () => {
    // before
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // action
    fireEvent.keyDown(screen.getByRole('button', { name: 'name' }), { key: 'a' });

    // result
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should commit a trimmed, changed value on blur and return to display mode', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<EditableInput ariaLabel="name" onChange={onChange} value="Untitled" />);
    const field = enterEditing();

    // action
    fireEvent.change(field, { target: { value: '  Screenshots  ' } });
    fireEvent.blur(field);

    // result
    expect(onChange).toHaveBeenCalledWith('Screenshots');
    expect(screen.getByRole('button', { name: 'name' })).toBeInTheDocument();
  });

  it('should not commit and should revert when the draft is empty on blur', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<EditableInput ariaLabel="name" onChange={onChange} value="Untitled" />);
    const field = enterEditing();

    // action
    fireEvent.change(field, { target: { value: '   ' } });
    fireEvent.blur(field);

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'name' })).toHaveTextContent('Untitled');
  });

  it('should not commit when the draft is unchanged on blur', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<EditableInput ariaLabel="name" onChange={onChange} value="Untitled" />);
    const field = enterEditing();

    // action
    fireEvent.change(field, { target: { value: 'Untitled' } });
    fireEvent.blur(field);

    // result
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should commit on Enter by blurring the field', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<EditableInput ariaLabel="name" onChange={onChange} value="Untitled" />);
    const field = enterEditing();

    // action
    fireEvent.change(field, { target: { value: 'Renamed' } });
    fireEvent.keyDown(field, { key: 'Enter' });

    // result
    expect(onChange).toHaveBeenCalledWith('Renamed');
  });

  it('should discard the draft and revert on Escape', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<EditableInput ariaLabel="name" onChange={onChange} value="Untitled" />);
    const field = enterEditing();

    // action
    fireEvent.change(field, { target: { value: 'Discarded' } });
    fireEvent.keyDown(field, { key: 'Escape' });

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'name' })).toHaveTextContent('Untitled');
  });

  it('should sync the displayed text when the value prop changes', () => {
    // before
    const { rerender } = render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // action
    rerender(<EditableInput ariaLabel="name" onChange={vi.fn()} value="External" />);

    // result
    expect(screen.getByRole('button', { name: 'name' })).toHaveTextContent('External');
  });
});

describe('EditableInput action slot', () => {
  it('should render the action next to the field in display mode', () => {
    // before
    render(<EditableInput action={<span>menu</span>} ariaLabel="name" className="custom" onChange={vi.fn()} value="Untitled" />);

    // result
    expect(screen.getByRole('button', { name: 'name' })).toHaveTextContent('Untitled');
    expect(screen.getByText('menu')).toBeInTheDocument();
  });

  it('should hide the action while the field is being edited', () => {
    // before
    render(<EditableInput action={<span>menu</span>} ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'name' }));

    // result
    expect(screen.getByRole('textbox', { name: 'name' })).toBeInTheDocument();
    expect(screen.queryByText('menu')).not.toBeInTheDocument();
  });
});
