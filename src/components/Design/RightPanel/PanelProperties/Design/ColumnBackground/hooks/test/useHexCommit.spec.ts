import { FocusEvent } from 'react';

// hooks
import { useHexCommit } from '../useHexCommit';

const focusEventFor = (input: HTMLInputElement): FocusEvent<HTMLInputElement> =>
  ({ target: input }) as unknown as FocusEvent<HTMLInputElement>;

describe('useHexCommit', () => {
  it('should commit a normalised hex when the typed value is valid', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: 'ABC' });

    // action
    useHexCommit('#000000', onCommit)(focusEventFor(input));

    // result
    expect(onCommit).toHaveBeenCalledWith('#aabbcc');
  });

  it('should reset the input to the current hex when the typed value is invalid', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: 'nope' });

    // action
    useHexCommit('#123456', onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('123456');
  });
});
