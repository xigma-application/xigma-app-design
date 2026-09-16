import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useTriggerFileInput } from '../useTriggerFileInput';

describe('useTriggerFileInput', () => {
  it('should click the referenced input element', () => {
    // mock
    const input = document.createElement('input');

    vi.spyOn(input, 'click');

    const inputRef: RefObject<HTMLInputElement | null> = { current: input };

    // before
    const { result } = renderHook(() => useTriggerFileInput(inputRef));

    // action
    result.current();

    // result
    expect(input.click).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when the ref is not yet attached', () => {
    // before
    const inputRef: RefObject<HTMLInputElement | null> = { current: null };
    const { result } = renderHook(() => useTriggerFileInput(inputRef));

    // action & result — must not throw
    expect(() => result.current()).not.toThrow();
  });
});
