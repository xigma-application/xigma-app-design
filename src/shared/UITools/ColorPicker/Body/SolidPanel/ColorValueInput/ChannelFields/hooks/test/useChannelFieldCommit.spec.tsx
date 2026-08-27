import { renderHook } from '@testing-library/react';

// hooks
import { useChannelFieldCommit } from '../useChannelFieldCommit';

const createBlurEvent = (value: string): React.FocusEvent<HTMLInputElement> =>
  ({ target: { value } }) as unknown as React.FocusEvent<HTMLInputElement>;

const createKeyDownEvent = (value: string, key: string): React.KeyboardEvent<HTMLInputElement> =>
  ({ currentTarget: { blur: vi.fn(), value }, key }) as unknown as React.KeyboardEvent<HTMLInputElement>;

describe('useChannelFieldCommit', () => {
  it('should commit a clamped channel value on blur, preserving the other channels', () => {
    // mock
    const onCommit = vi.fn();
    const values = { b: 0, g: 128, r: 255 };

    // before
    const { result } = renderHook(() => useChannelFieldCommit(values, onCommit));

    // action
    result.current.onBlur('b', 255)(createBlurEvent('300'));

    // result
    expect(onCommit).toHaveBeenCalledWith({ b: 255, g: 128, r: 255 });
  });

  it('should not commit a non-numeric value and restore the previous value for that channel', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useChannelFieldCommit({ r: 12 }, onCommit));
    const event = createBlurEvent('abc');

    // action
    result.current.onBlur('r', 255)(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.target.value).toBe('12');
  });

  it('should restore the previous value when the field is cleared', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useChannelFieldCommit({ r: 12 }, onCommit));
    const event = createBlurEvent('');

    // action
    result.current.onBlur('r', 255)(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.target.value).toBe('12');
  });

  it('should commit and blur the field when Enter is pressed', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useChannelFieldCommit({ h: 0 }, onCommit));
    const event = createKeyDownEvent('180', 'Enter');

    // action
    result.current.onKeyDown('h', 360)(event);

    // result
    expect(onCommit).toHaveBeenCalledWith({ h: 180 });
    expect(event.currentTarget.blur).toHaveBeenCalled();
  });

  it('should not commit on a non-Enter key press', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useChannelFieldCommit({ h: 0 }, onCommit));

    // action
    result.current.onKeyDown('h', 360)(createKeyDownEvent('180', 'Tab'));

    // result
    expect(onCommit).not.toHaveBeenCalled();
  });
});
