import { fireEvent, render, screen } from '@testing-library/react';

// components
import SliderInput from './SliderInput';

describe('SliderInput', () => {
  it('should show the value in the input and commit a typed value on blur', () => {
    // mock
    const onChange = vi.fn();

    render(<SliderInput ariaLabel="Amount" max={100} min={0} onChange={onChange} value={40} />);

    const input = screen.getByLabelText('Amount') as HTMLInputElement;

    // action
    expect(input.value).toBe('40');
    fireEvent.change(input, { target: { value: '75' } });
    fireEvent.blur(input);

    // result
    expect(onChange).toHaveBeenCalledWith(75);
    expect(screen.getByLabelText('Amount slider')).toBeTruthy();
  });
});
