import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useHandleTrackValueClick } from '../useHandleTrackValueClick';

const createClickEvent = (stopPropagation: () => void = vi.fn()): MouseEvent<HTMLInputElement> =>
  ({ stopPropagation }) as unknown as MouseEvent<HTMLInputElement>;

describe('useHandleTrackValueClick', () => {
  it('should always stop the click from propagating to the row', () => {
    // mock
    const stopPropagation = vi.fn();
    const { result } = renderHook(() => useHandleTrackValueClick(false, vi.fn()));

    // action
    result.current(createClickEvent(stopPropagation));

    // result
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('should re-select the number portion when the track is fill-sized', () => {
    // mock
    const selectNumberPortion = vi.fn();
    const { result } = renderHook(() => useHandleTrackValueClick(true, selectNumberPortion));

    // action
    result.current(createClickEvent());

    // result
    expect(selectNumberPortion).toHaveBeenCalled();
  });

  it('should not re-select the number portion for a non-fill track', () => {
    // mock
    const selectNumberPortion = vi.fn();
    const { result } = renderHook(() => useHandleTrackValueClick(false, selectNumberPortion));

    // action
    result.current(createClickEvent());

    // result
    expect(selectNumberPortion).not.toHaveBeenCalled();
  });
});
