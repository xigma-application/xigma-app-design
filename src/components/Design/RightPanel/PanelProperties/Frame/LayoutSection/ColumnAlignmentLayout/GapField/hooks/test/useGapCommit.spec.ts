import { FocusEvent } from 'react';

// hooks
import { useGapCommit } from '../useGapCommit';

const focusEventFor = (input: HTMLInputElement): FocusEvent<HTMLInputElement> =>
  ({ target: input }) as unknown as FocusEvent<HTMLInputElement>;

describe('useGapCommit', () => {
  it('should commit the parsed numeric value', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '24' });

    // action
    useGapCommit(false, 'Auto', 0, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).toHaveBeenCalledWith(24);
  });

  it('should reset the input to the current value when the typed value is blank and mode is not auto', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: '   ' });

    // action
    useGapCommit(false, 'Auto', 42, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('42');
  });

  it('should reset the input to the auto label when the typed value is blank and mode is auto', () => {
    // mock
    const onCommit = vi.fn();
    const input = Object.assign(document.createElement('input'), { value: 'not a number' });

    // action
    useGapCommit(true, 'Auto', 42, onCommit)(focusEventFor(input));

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(input.value).toBe('Auto');
  });
});
