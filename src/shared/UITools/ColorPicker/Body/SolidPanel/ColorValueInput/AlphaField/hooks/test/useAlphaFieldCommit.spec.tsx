import { renderHook } from '@testing-library/react';

// hooks
import { useAlphaFieldCommit } from '../useAlphaFieldCommit';

const createBlurEvent = (value: string): React.FocusEvent<HTMLInputElement> =>
  ({ target: { value } }) as unknown as React.FocusEvent<HTMLInputElement>;

const createKeyDownEvent = (value: string, key: string): React.KeyboardEvent<HTMLInputElement> =>
  ({ currentTarget: { blur: vi.fn(), value }, key }) as unknown as React.KeyboardEvent<HTMLInputElement>;

describe('useAlphaFieldCommit', () => {
  it('should commit a clamped alpha value on blur', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useAlphaFieldCommit(100, onCommit));

    // action
    result.current.onBlur(createBlurEvent('150'));

    // result
    expect(onCommit).toHaveBeenCalledWith(100);
  });

  it('should not commit a non-numeric value and restore the previous value', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useAlphaFieldCommit(42, onCommit));
    const event = createBlurEvent('abc');

    // action
    result.current.onBlur(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.target.value).toBe('42');
  });

  it('should restore the previous value when the field is cleared', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useAlphaFieldCommit(42, onCommit));
    const event = createBlurEvent('');

    // action
    result.current.onBlur(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.target.value).toBe('42');
  });

  it('should commit and blur the field when Enter is pressed', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useAlphaFieldCommit(0, onCommit));
    const event = createKeyDownEvent('40', 'Enter');

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).toHaveBeenCalledWith(40);
    expect(event.currentTarget.blur).toHaveBeenCalled();
  });

  it('should not commit on a non-Enter key press', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useAlphaFieldCommit(0, onCommit));

    // action
    result.current.onKeyDown(createKeyDownEvent('40', 'Tab'));

    // result
    expect(onCommit).not.toHaveBeenCalled();
  });
});
