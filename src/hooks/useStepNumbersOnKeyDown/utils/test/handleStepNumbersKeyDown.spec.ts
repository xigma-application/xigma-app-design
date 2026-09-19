import { KeyboardEvent } from 'react';

// utils
import { handleStepNumbersKeyDown } from '../handleStepNumbersKeyDown';

const createEvent = (key: string, value: string, start: number, end: number, shiftKey = false): KeyboardEvent<HTMLInputElement> => {
  const input = document.createElement('input');

  input.value = value;
  input.setSelectionRange(start, end);

  return { currentTarget: input, key, preventDefault: vi.fn(), shiftKey } as unknown as KeyboardEvent<HTMLInputElement>;
};

describe('handleStepNumbersKeyDown', () => {
  it('should step all numbers up on ArrowUp with everything selected and report the new text', () => {
    // before
    const onStep = vi.fn();
    const event = createEvent('ArrowUp', '8, 4', 0, 4);

    // action
    handleStepNumbersKeyDown(event, { onStep });

    // result
    expect(event.currentTarget.value).toBe('9, 5');
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onStep).toHaveBeenCalledWith('9, 5');
  });

  it('should step only the number at the caret down, by the shift step when Shift is held', () => {
    // before
    const event = createEvent('ArrowDown', '20, 40', 4, 4, true);

    // action
    handleStepNumbersKeyDown(event, { min: 0 });

    // result
    expect(event.currentTarget.value).toBe('20, 30');
    expect(event.currentTarget.selectionStart).toBe(4);
    expect(event.currentTarget.selectionEnd).toBe(6);
  });

  it('should ignore other keys', () => {
    // before
    const event = createEvent('a', '8', 0, 1);

    // action
    handleStepNumbersKeyDown(event, {});

    // result
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.currentTarget.value).toBe('8');
  });
});
