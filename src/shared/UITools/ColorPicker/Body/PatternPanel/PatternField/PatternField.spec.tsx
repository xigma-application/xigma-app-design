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
    render(<PatternField ariaLabel="Spacing X" e2eValue="spacing-x" adornmentLabel="X" onChange={vi.fn()} value={0} />);

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

  it('should use a custom suffix instead of "%" when given one', () => {
    // before
    render(<PatternField ariaLabel="Offset X" e2eValue="offset-x" adornmentLabel="X" onChange={vi.fn()} suffix="px" value={0} />);

    // result
    expect(screen.getByDisplayValue('0px')).toBeInTheDocument();
  });

  it('should allow a negative value when a custom negative min is given', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(
      <PatternField
        ariaLabel="Offset X"
        e2eValue="offset-x"
        adornmentLabel="X"
        max={500}
        min={-500}
        onChange={onChange}
        suffix="px"
        value={0}
      />,
    );
    const input = screen.getByDisplayValue('0px');

    // action
    fireEvent.change(input, { target: { value: '-200' } });
    fireEvent.blur(input);

    // result
    expect(onChange).toHaveBeenCalledWith(-200);
  });

  it('should clamp to a custom max instead of the default 1000', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(
      <PatternField
        ariaLabel="Offset X"
        e2eValue="offset-x"
        adornmentLabel="X"
        max={500}
        min={-500}
        onChange={onChange}
        suffix="px"
        value={0}
      />,
    );
    const input = screen.getByDisplayValue('0px');

    // action
    fireEvent.change(input, { target: { value: '9000' } });
    fireEvent.blur(input);

    // result
    expect(onChange).toHaveBeenCalledWith(500);
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
