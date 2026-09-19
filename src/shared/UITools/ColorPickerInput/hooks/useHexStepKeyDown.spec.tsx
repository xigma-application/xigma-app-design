import { renderHook } from '@testing-library/react';
import { KeyboardEvent } from 'react';

// hooks
import { useHexStepKeyDown } from './useHexStepKeyDown';

const createEvent = (key: string, value: string, start: number, end: number): KeyboardEvent<HTMLInputElement> => {
  const input = document.createElement('input');

  input.value = value;
  input.setSelectionRange(start, end);

  return { currentTarget: input, key, preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLInputElement>;
};

describe('useHexStepKeyDown', () => {
  it('should step the hex under the caret and commit it', () => {
    // before
    const onCommit = vi.fn();
    const { result } = renderHook(() => useHexStepKeyDown(onCommit));
    const event = createEvent('ArrowUp', '000000', 0, 0);

    // action
    result.current(event);

    // result
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onCommit).toHaveBeenCalledWith('#010000');
  });

  it('should ignore other keys and invalid hex', () => {
    // before
    const onCommit = vi.fn();
    const { result } = renderHook(() => useHexStepKeyDown(onCommit));

    // action
    result.current(createEvent('a', '000000', 0, 0));
    result.current(createEvent('ArrowUp', 'zz', 0, 0));

    // result
    expect(onCommit).not.toHaveBeenCalled();
  });
});
