import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import EditableInputField from './EditableInputField';

const handlers = (): { onBlur: TFunc; onChange: TFunc; onFocus: TFunc; onKeyDown: TFunc } => ({
  onBlur: vi.fn(),
  onChange: vi.fn(),
  onFocus: vi.fn(),
  onKeyDown: vi.fn(),
});

describe('EditableInputField behaviors', () => {
  it('should render a focused text input with the value, label, placeholder, class and extra props', () => {
    // before
    render(<EditableInputField {...handlers()} ariaLabel="name" className="extra" maxLength={10} placeholder="Name me" value="Page 1" />);

    // find
    const input = screen.getByRole('textbox', { name: 'name' });

    // result
    expect(input).toHaveValue('Page 1');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('placeholder', 'Name me');
    expect(input).toHaveAttribute('maxlength', '10');
    expect(input.className).toContain('extra');
  });

  it('should forward its ref and every input event', () => {
    // mock
    const ref = createRef<HTMLInputElement>();
    const props = handlers();

    // before
    render(<EditableInputField {...props} ref={ref} value="Page 1" />);

    // find
    const input = screen.getByRole('textbox');

    // action
    fireEvent.change(input, { target: { value: 'Page 2' } });
    fireEvent.keyDown(input, { key: 'a' });
    fireEvent.blur(input);
    fireEvent.focus(input);

    // result
    expect(ref.current).toBe(input);
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onKeyDown).toHaveBeenCalledTimes(1);
    expect(props.onBlur).toHaveBeenCalledTimes(1);
    expect(props.onFocus).toHaveBeenCalled();
  });
});
