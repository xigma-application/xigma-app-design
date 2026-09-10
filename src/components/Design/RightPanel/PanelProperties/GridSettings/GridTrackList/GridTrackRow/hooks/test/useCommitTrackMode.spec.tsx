import { renderHook } from '@testing-library/react';

// hooks
import { useCommitTrackMode } from '../useCommitTrackMode';

// types
import { SizingMode } from 'types/design/enums';

describe('useCommitTrackMode', () => {
  it('should seed the rounded resolved size when switching to fixed', () => {
    // mock
    const onChangeMode = vi.fn();
    const { result } = renderHook(() => useCommitTrackMode(onChangeMode, 123.456));

    // action
    result.current(SizingMode.fixed);

    // result
    expect(onChangeMode).toHaveBeenCalledWith(SizingMode.fixed, 123.46);
  });

  it('should pass no value when switching to a non-fixed mode', () => {
    // mock
    const onChangeMode = vi.fn();
    const { result } = renderHook(() => useCommitTrackMode(onChangeMode, 100));

    // action
    result.current(SizingMode.hug);

    // result
    expect(onChangeMode).toHaveBeenCalledWith(SizingMode.hug, undefined);
  });
});
