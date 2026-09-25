import { FocusEvent } from 'react';

// hooks
import { useGlassNumberBlur } from '../useGlassNumberBlur';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

const blurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('useGlassNumberBlur', () => {
  it('should commit a changed clamped value and show it with its unit', () => {
    // mock
    const onChange = vi.fn();
    const event = blurEvent('150');

    // before
    useGlassNumberBlur(0, 100, 20, '%', onChange)(event);

    // result
    expect(onChange).toHaveBeenCalledWith(100);
    expect(event.target.value).toBe('100%');
  });

  it('should not commit an unchanged value', () => {
    // mock
    const onChange = vi.fn();
    const event = blurEvent('20');

    // before
    useGlassNumberBlur(0, 100, 20, '°', onChange)(event);

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(event.target.value).toBe('20°');
  });

  it('should restore the value, or Mixed without one, for invalid input', () => {
    // mock
    const onChange = vi.fn();
    const withValue = blurEvent('abc');
    const withoutValue = blurEvent('abc');

    // before
    useGlassNumberBlur(0, 100, 20, '', onChange)(withValue);
    useGlassNumberBlur(0, 100, undefined, '', onChange)(withoutValue);

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(withValue.target.value).toBe('20');
    expect(withoutValue.target.value).toBe(MIXED_LABEL);
  });
});
