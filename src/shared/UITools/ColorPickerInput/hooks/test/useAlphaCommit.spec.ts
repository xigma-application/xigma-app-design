import { FocusEvent } from 'react';

// hooks
import { useAlphaCommit } from '../useAlphaCommit';

const focusEventFor = (input: HTMLInputElement): FocusEvent<HTMLInputElement> =>
  ({ target: input }) as unknown as FocusEvent<HTMLInputElement>;

describe('useAlphaCommit', () => {
  it('should commit a clamped numeric value', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '150' });

    // action
    useAlphaCommit(100, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).toHaveBeenCalledWith(100);
  });

  it('should reset the input to the current alpha when the value is blank', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '   ' });

    // action
    useAlphaCommit(37.6, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('38');
  });

  it('should reset the input when the value is not a number', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: 'abc' });

    // action
    useAlphaCommit(40, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('40');
  });
});
