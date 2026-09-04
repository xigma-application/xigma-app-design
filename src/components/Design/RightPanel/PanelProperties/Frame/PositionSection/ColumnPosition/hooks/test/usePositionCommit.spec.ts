import { FocusEvent } from 'react';

// hooks
import { usePositionCommit } from '../usePositionCommit';

const focusEventFor = (input: HTMLInputElement): FocusEvent<HTMLInputElement> =>
  ({ target: input }) as unknown as FocusEvent<HTMLInputElement>;

describe('usePositionCommit', () => {
  it('should commit the parsed numeric value', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '-1010' });

    // action
    usePositionCommit(0, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).toHaveBeenCalledWith(-1010);
  });

  it('should reset the input to the current value when the typed value is blank', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '   ' });

    // action
    usePositionCommit(42, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('42');
  });

  it('should reset the input when the typed value is not a number', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: 'abc' });

    // action
    usePositionCommit(7, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('7');
  });
});
