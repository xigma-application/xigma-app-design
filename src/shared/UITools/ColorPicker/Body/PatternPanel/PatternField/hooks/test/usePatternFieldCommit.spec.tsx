import { renderHook } from '@testing-library/react';

// hooks
import { usePatternFieldCommit } from '../usePatternFieldCommit';

const createBlurEvent = (value: string): React.FocusEvent<HTMLInputElement> =>
  ({ target: { value } }) as unknown as React.FocusEvent<HTMLInputElement>;

const createKeyDownEvent = (value: string, key: string): React.KeyboardEvent<HTMLInputElement> =>
  ({ currentTarget: { blur: vi.fn(), value }, key }) as unknown as React.KeyboardEvent<HTMLInputElement>;

describe('usePatternFieldCommit', () => {
  it('should commit a clamped value on blur', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => usePatternFieldCommit(50, 0, 1000, onCommit));

    // action
    result.current.onBlur(createBlurEvent('2000'));

    // result
    expect(onCommit).toHaveBeenCalledWith(1000);
  });

  it('should strip a trailing % sign before parsing', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => usePatternFieldCommit(0, 0, 1000, onCommit));

    // action
    result.current.onBlur(createBlurEvent('60%'));

    // result
    expect(onCommit).toHaveBeenCalledWith(60);
  });

  it('should not commit a non-numeric value and restore the previous value with a % sign', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => usePatternFieldCommit(40, 0, 1000, onCommit));
    const event = createBlurEvent('abc');

    // action
    result.current.onBlur(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.target.value).toBe('40%');
  });

  it('should restore the previous value when the field is cleared', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => usePatternFieldCommit(40, 0, 1000, onCommit));
    const event = createBlurEvent('');

    // action
    result.current.onBlur(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.target.value).toBe('40%');
  });

  it('should respect a non-zero minimum', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => usePatternFieldCommit(50, 10, 1000, onCommit));

    // action
    result.current.onBlur(createBlurEvent('-20'));

    // result
    expect(onCommit).toHaveBeenCalledWith(10);
  });

  it('should commit and blur the field when Enter is pressed', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => usePatternFieldCommit(0, 0, 1000, onCommit));
    const event = createKeyDownEvent('75', 'Enter');

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).toHaveBeenCalledWith(75);
    expect(event.currentTarget.blur).toHaveBeenCalled();
  });

  it('should not commit on a non-Enter key press', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => usePatternFieldCommit(0, 0, 1000, onCommit));

    // action
    result.current.onKeyDown(createKeyDownEvent('40', 'Tab'));

    // result
    expect(onCommit).not.toHaveBeenCalled();
  });
});
