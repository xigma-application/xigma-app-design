import { fireEvent, render, screen } from '@testing-library/react';

// components
import EditableInput from './EditableInput';

describe('EditableInput snapshots', () => {
  it('should render EditableInput with its value', () => {
    // before
    const { asFragment } = render(<EditableInput onChange={vi.fn()} value="Untitled" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the action slot when provided', () => {
    // before
    render(<EditableInput action={<button type="button">menu</button>} onChange={vi.fn()} value="Untitled" />);

    // result
    expect(screen.getByRole('button', { name: 'menu' })).toBeInTheDocument();
  });
});

describe('EditableInput behaviors', () => {
  it('should show the value as the field content', () => {
    // before
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // result
    expect(screen.getByRole('textbox', { name: 'name' })).toHaveValue('Untitled');
  });

  it('should commit a trimmed, changed value on blur', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<EditableInput ariaLabel="name" onChange={onChange} value="Untitled" />);
    const field = screen.getByRole('textbox', { name: 'name' });

    // action
    fireEvent.change(field, { target: { value: '  Screenshots  ' } });
    fireEvent.blur(field);

    // result
    expect(onChange).toHaveBeenCalledWith('Screenshots');
  });

  it('should not commit and should revert to the value when the draft is empty on blur', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<EditableInput ariaLabel="name" onChange={onChange} value="Untitled" />);
    const field = screen.getByRole('textbox', { name: 'name' });

    // action
    fireEvent.change(field, { target: { value: '   ' } });
    fireEvent.blur(field);

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(field).toHaveValue('Untitled');
  });

  it('should not commit when the draft is unchanged on blur', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<EditableInput ariaLabel="name" onChange={onChange} value="Untitled" />);
    const field = screen.getByRole('textbox', { name: 'name' });

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
    const field = screen.getByRole('textbox', { name: 'name' });
    field.focus();

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
    const field = screen.getByRole('textbox', { name: 'name' });
    field.focus();

    // action
    fireEvent.change(field, { target: { value: 'Discarded' } });
    fireEvent.keyDown(field, { key: 'Escape' });

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(field).toHaveValue('Untitled');
  });

  it('should sync the field when the value prop changes', () => {
    // before
    const { rerender } = render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // action
    rerender(<EditableInput ariaLabel="name" onChange={vi.fn()} value="External" />);

    // result
    expect(screen.getByRole('textbox', { name: 'name' })).toHaveValue('External');
  });
});
