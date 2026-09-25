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

  it('should put the field before the slider and accept typed values past the slider range', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { container } = render(
      <SliderInput ariaLabel="Amount" inputMax={1000} inputPosition="start" max={100} min={0} onChange={onChange} value={40} />,
    );

    // action
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '250' } });
    fireEvent.blur(screen.getByLabelText('Amount'));

    // result
    expect((container.firstChild as HTMLElement).className).toContain('inputStart');
    expect(onChange).toHaveBeenCalledWith(250);
  });

  it('should commit a rounded value when the slider moves', () => {
    // mock
    const onChange = vi.fn();

    // before
    render(<SliderInput ariaLabel="Amount" max={100} min={0} onChange={onChange} value={40} />);

    // spy
    const track = screen.getByRole('slider') as HTMLDivElement;

    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 300 } as DOMRect);

    // action
    track.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 124, clientY: 0, pointerId: 1 }));

    // result
    expect(onChange).toHaveBeenCalledWith(41);
  });
});
