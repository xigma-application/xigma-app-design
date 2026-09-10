import { FocusEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useCommitTrackValueOnBlur } from '../useCommitTrackValueOnBlur';

const createBlurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('useCommitTrackValueOnBlur', () => {
  it('should commit a parsed numeric value', () => {
    // mock
    const onChangeValue = vi.fn();
    const { result } = renderHook(() => useCommitTrackValueOnBlur(onChangeValue));

    // action
    result.current(createBlurEvent('42'));

    // result
    expect(onChangeValue).toHaveBeenCalledWith(42);
  });

  it('should ignore a non-numeric value', () => {
    // mock
    const onChangeValue = vi.fn();
    const { result } = renderHook(() => useCommitTrackValueOnBlur(onChangeValue));

    // action
    result.current(createBlurEvent('not-a-number'));

    // result
    expect(onChangeValue).not.toHaveBeenCalled();
  });
});
