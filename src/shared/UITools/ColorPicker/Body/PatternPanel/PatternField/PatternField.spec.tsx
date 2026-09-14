import { fireEvent, render, screen } from '@testing-library/react';

// components
import PatternField from './PatternField';

describe('PatternField behaviors', () => {
  it('should show the value with a "%" suffix baked into it, not as a separate adornment', () => {
    // before
    render(<PatternField ariaLabel="Scale" e2eValue="scale" icon="AspectRatio" onChange={vi.fn()} value={100} />);

    // result
    expect(screen.getByDisplayValue('100%')).toBeInTheDocument();
  });

  it('should show a text label instead of an icon when no icon is given', () => {
    // before
    render(<PatternField ariaLabel="Spacing X" e2eValue="spacing-x" label="X" onChange={vi.fn()} value={0} />);

    // result
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('should commit a clamped value on blur', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<PatternField ariaLabel="Scale" e2eValue="scale" icon="AspectRatio" onChange={onChange} value={100} />);
    const input = screen.getByDisplayValue('100%');

    // action
    fireEvent.change(input, { target: { value: '2000' } });
    fireEvent.blur(input);

    // result
    expect(onChange).toHaveBeenCalledWith(1000);
  });

  it('should strip a trailing % sign before parsing on blur', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<PatternField ariaLabel="Scale" e2eValue="scale" icon="AspectRatio" onChange={onChange} value={100} />);
    const input = screen.getByDisplayValue('100%');

    // action
    fireEvent.change(input, { target: { value: '60%' } });
    fireEvent.blur(input);

    // result
    expect(onChange).toHaveBeenCalledWith(60);
  });

  it('should restore the previous value with a % sign when blurred with a non-numeric value', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<PatternField ariaLabel="Scale" e2eValue="scale" icon="AspectRatio" onChange={onChange} value={40} />);
    const input = screen.getByDisplayValue('40%') as HTMLInputElement;

    // action
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('40%');
  });

  it('should commit and blur the field when Enter is pressed', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<PatternField ariaLabel="Scale" e2eValue="scale" icon="AspectRatio" onChange={onChange} value={100} />);
    const input = screen.getByDisplayValue('100%');

    // action
    fireEvent.change(input, { target: { value: '75' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // result
    expect(onChange).toHaveBeenCalledWith(75);
  });
});
