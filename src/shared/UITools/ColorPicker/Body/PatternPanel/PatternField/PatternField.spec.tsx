import { fireEvent, render, screen } from '@testing-library/react';

// components
import PatternField from './PatternField';

describe('PatternField behaviors', () => {
  it('should show the value and the "%" unit', () => {
    // before
    render(<PatternField ariaLabel="Scale" e2eValue="scale" icon="AspectRatio" onChange={vi.fn()} value={100} />);

    // result
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
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
    const input = screen.getByDisplayValue('100');

    // action
    fireEvent.change(input, { target: { value: '2000' } });
    fireEvent.blur(input);

    // result
    expect(onChange).toHaveBeenCalledWith(1000);
  });
});
