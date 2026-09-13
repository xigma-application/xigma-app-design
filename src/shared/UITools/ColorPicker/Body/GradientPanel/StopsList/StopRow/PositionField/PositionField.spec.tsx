import { fireEvent, render, screen } from '@testing-library/react';

// components
import PositionField from './PositionField';

describe('PositionField behaviors', () => {
  it('should display the given percentage with the % sign in the value itself', () => {
    // before
    render(<PositionField onCommit={vi.fn()} positionPercent={50} />);

    // result
    expect(screen.getByDisplayValue('50%')).toBeInTheDocument();
  });

  it('should commit a percentage on blur, stripping the % sign', () => {
    // mock
    const onCommit = vi.fn();

    // before
    render(<PositionField onCommit={onCommit} positionPercent={0} />);
    const input = screen.getByLabelText('Stop position');

    // action
    fireEvent.change(input, { target: { value: '25%' } });
    fireEvent.blur(input);

    // result
    expect(onCommit).toHaveBeenCalledWith(25);
  });

  it('should select the whole value when the input is clicked', () => {
    // before
    render(<PositionField onCommit={vi.fn()} positionPercent={50} />);
    const input = screen.getByLabelText('Stop position') as HTMLInputElement;

    // action
    fireEvent.click(input);

    // result
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
  });
});
