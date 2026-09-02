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

  it('should start in edit mode when autoEdit is set', () => {
    // before
    render(<EditableInput ariaLabel="name" autoEdit onChange={vi.fn()} value="Page 2" />);

    // result
    expect(screen.getByRole('textbox', { name: 'name' })).toHaveValue('Page 2');
  });

  it('should enter edit mode when autoEdit flips to true on an already-mounted field', () => {
    // before
    const { rerender } = render(<EditableInput ariaLabel="name" autoEdit={false} onChange={vi.fn()} value="Page 2" />);

    // result
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    // action
    rerender(<EditableInput ariaLabel="name" autoEdit onChange={vi.fn()} value="Page 2" />);

    // result
    expect(screen.getByRole('textbox', { name: 'name' })).toHaveValue('Page 2');
  });

  it('should select the whole text when the field is focused', () => {
    // before
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);
    const field = enterEditing();

    // action
    fireEvent.focus(field);

    // result
    expect(field.selectionStart).toBe(0);
    expect(field.selectionEnd).toBe('Untitled'.length);
  });

  it('should bypass global keyboard shortcuts while editing', () => {
    // before
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // action
    const field = enterEditing();

    // result
    expect(field).toHaveAttribute('data-test-bypass-global-shortcuts', 'true');
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

  it('should mark the display as selected when the selected prop is true', () => {
    // before
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} selected value="Untitled" />);

    // result
    expect(screen.getByRole('button', { name: 'name' }).className).toMatch(/EditableInput--selected/);
  });

  it('should not mark the display as selected by default', () => {
    // before
    render(<EditableInput ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // result
    expect(screen.getByRole('button', { name: 'name' }).className).not.toMatch(/EditableInput--selected/);
  });

  it('should not enter edit mode on a single click when editOnDoubleClick is set', () => {
    // before
    render(<EditableInput ariaLabel="name" editOnDoubleClick onChange={vi.fn()} value="Untitled" />);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'name' }));

    // result
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should enter edit mode on a double click when editOnDoubleClick is set', () => {
    // before
    render(<EditableInput ariaLabel="name" editOnDoubleClick onChange={vi.fn()} value="Untitled" />);

    // action
    fireEvent.doubleClick(screen.getByRole('button', { name: 'name' }));

    // result
    expect(screen.getByRole('textbox', { name: 'name' })).toBeInTheDocument();
  });

  it('should still enter edit mode on Enter when editOnDoubleClick is set', () => {
    // before
    render(<EditableInput ariaLabel="name" editOnDoubleClick onChange={vi.fn()} value="Untitled" />);

    // action
    fireEvent.keyDown(screen.getByRole('button', { name: 'name' }), { key: 'Enter' });

    // result
    expect(screen.getByRole('textbox', { name: 'name' })).toBeInTheDocument();
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

  it('should toggle the action open state on click, without entering edit mode', () => {
    // before
    render(<EditableInput action={<span>menu</span>} ariaLabel="name" onChange={vi.fn()} value="Untitled" />);
    const actionWrapper = screen.getByText('menu').parentElement as HTMLElement;

    // result
    expect(actionWrapper).toHaveAttribute('data-state', 'closed');

    // action
    fireEvent.click(actionWrapper);

    // result
    expect(actionWrapper).toHaveAttribute('data-state', 'open');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    // action
    fireEvent.click(actionWrapper);

    // result
    expect(actionWrapper).toHaveAttribute('data-state', 'closed');
  });

  it('should stay open when the mousedown lands inside the action', () => {
    // before
    render(<EditableInput action={<span>menu</span>} ariaLabel="name" onChange={vi.fn()} value="Untitled" />);
    const actionWrapper = screen.getByText('menu').parentElement as HTMLElement;

    // action
    fireEvent.click(actionWrapper);

    // result
    expect(actionWrapper).toHaveAttribute('data-state', 'open');

    // action
    fireEvent.mouseDown(actionWrapper);

    // result
    expect(actionWrapper).toHaveAttribute('data-state', 'open');
  });

  it('should close the open action when clicking outside it', () => {
    // before
    render(<EditableInput action={<span>menu</span>} ariaLabel="name" onChange={vi.fn()} value="Untitled" />);
    const actionWrapper = screen.getByText('menu').parentElement as HTMLElement;

    // action
    fireEvent.click(actionWrapper);

    // result
    expect(actionWrapper).toHaveAttribute('data-state', 'open');

    // action
    fireEvent.mouseDown(document.body);

    // result
    expect(actionWrapper).toHaveAttribute('data-state', 'closed');
  });

  it('should reflect a controlled actionOpen prop as the data-state, without needing a click', () => {
    // before
    render(<EditableInput action={<span>menu</span>} actionOpen ariaLabel="name" onChange={vi.fn()} value="Untitled" />);

    // result
    expect(screen.getByText('menu').parentElement).toHaveAttribute('data-state', 'open');
  });

  it('should leave opening to the controlled action itself, instead of also toggling on the wrapper click', () => {
    // mock
    const onActionOpenChange = vi.fn();

    // before
    render(
      <EditableInput
        action={
          <button onClick={(): void => onActionOpenChange(true)} type="button">
            menu
          </button>
        }
        actionOpen={false}
        ariaLabel="name"
        onActionOpenChange={onActionOpenChange}
        onChange={vi.fn()}
        value="Untitled"
      />,
    );

    // action
    fireEvent.click(screen.getByText('menu'));

    // result — a controlled action owns its own open click; the wrapper doesn't
    // independently re-toggle on the same click and undo it
    expect(onActionOpenChange).toHaveBeenCalledTimes(1);
    expect(onActionOpenChange).toHaveBeenCalledWith(true);
  });

  it('should not auto-close a controlled action on outside click, leaving that to its own trigger', () => {
    // mock
    const onActionOpenChange = vi.fn();

    // before
    render(
      <EditableInput
        action={<span>menu</span>}
        actionOpen
        ariaLabel="name"
        onActionOpenChange={onActionOpenChange}
        onChange={vi.fn()}
        value="Untitled"
      />,
    );

    // action
    fireEvent.mouseDown(document.body);

    // result
    expect(onActionOpenChange).not.toHaveBeenCalled();
    expect(screen.getByText('menu').parentElement).toHaveAttribute('data-state', 'open');
  });
});
