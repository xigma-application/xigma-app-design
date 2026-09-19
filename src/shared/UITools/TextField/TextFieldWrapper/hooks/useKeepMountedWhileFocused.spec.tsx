import { act, renderHook } from '@testing-library/react';
import { FocusEvent } from 'react';

// hooks
import { useKeepMountedWhileFocused } from './useKeepMountedWhileFocused';

const event = {} as FocusEvent<HTMLInputElement>;

describe('useKeepMountedWhileFocused', () => {
  it('should keep following the default value while not focused', () => {
    // before
    const { rerender, result } = renderHook(({ value }) => useKeepMountedWhileFocused(true, value, undefined, undefined), { initialProps: { value: 'a' } });

    // action
    rerender({ value: 'b' });

    // result
    expect(result.current.inputKey).toBe('b');
  });

  it('should freeze the key while focused and release it on blur, calling the outer handlers', () => {
    // before
    const onBlur = vi.fn();
    const onFocus = vi.fn();
    const { rerender, result } = renderHook(({ value }) => useKeepMountedWhileFocused(true, value, onBlur, onFocus), { initialProps: { value: 'a' } });

    // action
    act(() => result.current.handleFocus(event));
    rerender({ value: 'b' });

    // result
    expect(result.current.inputKey).toBe('a');
    expect(onFocus).toHaveBeenCalled();

    // action
    act(() => result.current.handleBlur(event));

    // result
    expect(result.current.inputKey).toBe('b');
    expect(onBlur).toHaveBeenCalled();
  });

  it('should not freeze when disabled', () => {
    // before
    const { rerender, result } = renderHook(({ value }) => useKeepMountedWhileFocused(false, value, undefined, undefined), { initialProps: { value: 'a' } });

    // action
    act(() => result.current.handleFocus(event));
    rerender({ value: 'b' });

    // result
    expect(result.current.inputKey).toBe('b');
  });
});
