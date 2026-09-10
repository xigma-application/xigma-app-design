import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnDimensionsFieldReveal } from '../useColumnDimensionsFieldReveal';

describe('useColumnDimensionsFieldReveal', () => {
  it('should start out not revealed', () => {
    // before
    const { result } = renderHook(() => useColumnDimensionsFieldReveal());

    // result
    expect(result.current.isRevealed).toBe(false);
  });

  it('should reveal on mouse enter, and stop revealing on mouse leave', () => {
    // before
    const { result } = renderHook(() => useColumnDimensionsFieldReveal());

    // action
    act(() => result.current.onMouseEnter());

    // result
    expect(result.current.isRevealed).toBe(true);

    // action
    act(() => result.current.onMouseLeave());

    // result
    expect(result.current.isRevealed).toBe(false);
  });

  it('should forward the hover callbacks it was given on enter and leave', () => {
    // mock
    const onHoverStart = vi.fn();
    const onHoverEnd = vi.fn();

    // before
    const { result } = renderHook(() => useColumnDimensionsFieldReveal({ onHoverEnd, onHoverStart }));

    // action
    act(() => result.current.onMouseEnter());

    // result
    expect(onHoverStart).toHaveBeenCalledTimes(1);
    expect(onHoverEnd).not.toHaveBeenCalled();

    // action
    act(() => result.current.onMouseLeave());

    // result
    expect(onHoverEnd).toHaveBeenCalledTimes(1);
  });

  it('should stay revealed via the menu-open state, even after the mouse leaves', () => {
    // before
    const { result } = renderHook(() => useColumnDimensionsFieldReveal());

    // action
    act(() => result.current.onMouseEnter());
    act(() => result.current.onMenuOpenChange(true));
    act(() => result.current.onMouseLeave());

    // result
    expect(result.current.isRevealed).toBe(true);

    // action
    act(() => result.current.onMenuOpenChange(false));

    // result
    expect(result.current.isRevealed).toBe(false);
  });
});
