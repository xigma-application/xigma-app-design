import { act, renderHook } from '@testing-library/react';

// hooks
import { useCommentPinHover } from '../useCommentPinHover';

describe('useCommentPinHover behaviors', () => {
  it('should start collapsed', () => {
    // before
    const { result } = renderHook(() => useCommentPinHover());

    // result
    expect(result.current.visible).toBe(false);
  });

  it('should expand on mouse enter', () => {
    // before
    const { result } = renderHook(() => useCommentPinHover());

    // action
    act(() => {
      result.current.onMouseEnter();
    });

    // result
    expect(result.current.visible).toBe(true);
  });

  it('should collapse on mouse leave', () => {
    // before
    const { result } = renderHook(() => useCommentPinHover());

    act(() => {
      result.current.onMouseEnter();
    });

    // action
    act(() => {
      result.current.onMouseLeave();
    });

    // result
    expect(result.current.visible).toBe(false);
  });
});
