import { fireEvent, render, screen } from '@testing-library/react';

// components
import EditableInputDisplay from './EditableInputDisplay';

describe('EditableInputDisplay behaviors', () => {
  it('should show the text as a focusable button with the given label and class', () => {
    // before
    render(<EditableInputDisplay ariaLabel="name" className="extra" onKeyDown={vi.fn()} text="Untitled" />);

    // find
    const display = screen.getByRole('button', { name: 'name' });

    // result
    expect(display).toHaveTextContent('Untitled');
    expect(display).toHaveAttribute('tabindex', '0');
    expect(display.className).toContain('extra');
  });

  it('should forward click, double click and key down', () => {
    // mock
    const onClick = vi.fn();
    const onDoubleClick = vi.fn();
    const onKeyDown = vi.fn();

    // before
    render(<EditableInputDisplay onClick={onClick} onDoubleClick={onDoubleClick} onKeyDown={onKeyDown} text="Untitled" />);

    // find
    const display = screen.getByRole('button');

    // action
    fireEvent.click(display);
    fireEvent.doubleClick(display);
    fireEvent.keyDown(display, { key: 'Enter' });

    // result
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});
