import { renderHook } from '@testing-library/react';
import { KeyboardEvent } from 'react';

// hooks
import { useStepNumbersThroughBlur } from './useStepNumbersThroughBlur';

const createEvent = (key: string, value: string): KeyboardEvent<HTMLInputElement> => {
  const input = document.createElement('input');

  input.value = value;
  input.setSelectionRange(0, value.length);

  return { currentTarget: input, key, preventDefault: vi.fn(), shiftKey: false } as unknown as KeyboardEvent<HTMLInputElement>;
};

describe('useStepNumbersThroughBlur', () => {
  it('should step the value and commit it through the blur handler while keeping the selection', () => {
    // before
    const onBlur = vi.fn();
    const onKeyDown = vi.fn();
    const { result } = renderHook(() => useStepNumbersThroughBlur({ min: 0 }, onBlur, onKeyDown));
    const event = createEvent('ArrowUp', '50%');

    // action
    result.current?.(event);

    // result
    expect(event.currentTarget.value).toBe('51%');
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledWith(event);
    expect(event.currentTarget.selectionStart).toBe(0);
    expect(event.currentTarget.selectionEnd).toBe(2);
  });

  it('should leave the key handler untouched without step options', () => {
    // before
    const onKeyDown = vi.fn();
    const { result } = renderHook(() => useStepNumbersThroughBlur(undefined, undefined, onKeyDown));

    // result
    expect(result.current).toBe(onKeyDown);
  });
});
