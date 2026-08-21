import { act, renderHook } from '@testing-library/react';

// hooks
import { useCommentDraftEntrance } from '../useCommentDraftEntrance';

describe('useCommentDraftEntrance behaviors', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start as entering', () => {
    // before
    const { result } = renderHook(() => useCommentDraftEntrance());

    // result
    expect(result.current).toBe(true);
  });

  it('should stop entering once the entrance animation duration has elapsed', () => {
    // before
    const { result } = renderHook(() => useCommentDraftEntrance());

    // action
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // result
    expect(result.current).toBe(false);
  });
});
