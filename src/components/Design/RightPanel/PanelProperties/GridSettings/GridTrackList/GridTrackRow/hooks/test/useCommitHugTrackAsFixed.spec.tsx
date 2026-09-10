import { FocusEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useCommitHugTrackAsFixed } from '../useCommitHugTrackAsFixed';

// types
import { SizingMode } from 'types/design/enums';

const createBlurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('useCommitHugTrackAsFixed', () => {
  it('should switch the track to fixed at the parsed value', () => {
    // mock
    const onChangeMode = vi.fn();
    const { result } = renderHook(() => useCommitHugTrackAsFixed(onChangeMode));

    // action
    result.current(createBlurEvent('276.5'));

    // result
    expect(onChangeMode).toHaveBeenCalledWith(SizingMode.fixed, 276.5);
  });

  it('should do nothing for a non-numeric value', () => {
    // mock
    const onChangeMode = vi.fn();
    const { result } = renderHook(() => useCommitHugTrackAsFixed(onChangeMode));

    // action
    result.current(createBlurEvent(''));

    // result
    expect(onChangeMode).not.toHaveBeenCalled();
  });
});
