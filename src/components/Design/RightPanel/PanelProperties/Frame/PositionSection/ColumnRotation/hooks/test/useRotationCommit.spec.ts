import { FocusEvent } from 'react';

// hooks
import { useRotationCommit } from '../useRotationCommit';

const focusEventFor = (input: HTMLInputElement): FocusEvent<HTMLInputElement> =>
  ({ target: input }) as unknown as FocusEvent<HTMLInputElement>;

describe('useRotationCommit', () => {
  it('should commit the parsed numeric value', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '45°' });

    // action
    useRotationCommit(0, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).toHaveBeenCalledWith(45);
  });

  it('should commit a negative numeric value', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '-90°' });

    // action
    useRotationCommit(0, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).toHaveBeenCalledWith(-90);
  });

  it('should reset the input to the current value when the typed value is blank', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '   ' });

    // action
    useRotationCommit(42, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('42°');
  });

  it('should reset the input when the typed value is not a number', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: 'abc' });

    // action
    useRotationCommit(7, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('7°');
  });
});
