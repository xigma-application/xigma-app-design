import { FocusEvent } from 'react';

// hooks
import { useSliderInputBlur } from './useSliderInputBlur';

const blurWith = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as unknown as FocusEvent<HTMLInputElement>;

describe('useSliderInputBlur', () => {
  it('should commit a changed value and show it clamped', () => {
    // mock
    const onChange = vi.fn();
    const event = blurWith('300');

    // action
    useSliderInputBlur(0, 100, 20, onChange)(event);

    // result
    expect(onChange).toHaveBeenCalledWith(100);
    expect(event.target.value).toBe('100');
  });

  it('should not commit an unchanged value and should restore the text when the input is not a number', () => {
    // mock
    const onChange = vi.fn();
    const event = blurWith('nope');

    // action
    useSliderInputBlur(0, 100, 20, onChange)(event);
    useSliderInputBlur(0, 100, 20, onChange)(blurWith('20'));

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(event.target.value).toBe('20');
  });
});
