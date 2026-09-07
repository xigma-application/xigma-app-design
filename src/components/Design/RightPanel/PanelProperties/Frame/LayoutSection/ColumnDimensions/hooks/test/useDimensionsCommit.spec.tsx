import { FocusEvent } from 'react';

// hooks
import { useDimensionsCommit } from '../useDimensionsCommit';

const focusEventFor = (input: HTMLInputElement): FocusEvent<HTMLInputElement> =>
  ({ target: input }) as unknown as FocusEvent<HTMLInputElement>;

describe('useDimensionsCommit', () => {
  it('should commit the parsed numeric value', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '326' });

    // action
    useDimensionsCommit(0, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).toHaveBeenCalledWith(326);
  });

  it('should reset the input to the current value when the typed value is blank', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '   ' });

    // action
    useDimensionsCommit(42, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('42');
  });

  it('should reset the input when the typed value is not a number', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: 'abc' });

    // action
    useDimensionsCommit(7, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('7');
  });
});
