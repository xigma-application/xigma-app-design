import { renderHook } from '@testing-library/react';

// hooks
import { useTrackIsDragging } from '../useTrackIsDragging';

describe('useTrackIsDragging', () => {
  it('should start with isDraggingRef false', () => {
    // before
    const { result } = renderHook(() => useTrackIsDragging());

    // result
    expect(result.current.isDraggingRef.current).toBe(false);
  });

  it('should set isDraggingRef true and call the given onDragStart when handleDragStart fires', () => {
    // mock
    const onDragStart = vi.fn();

    // before
    const { result } = renderHook(() => useTrackIsDragging(onDragStart));

    // action
    result.current.handleDragStart();

    // result
    expect(result.current.isDraggingRef.current).toBe(true);
    expect(onDragStart).toHaveBeenCalledTimes(1);
  });

  it('should set isDraggingRef false and call the given onDragEnd when handleDragEnd fires', () => {
    // mock
    const onDragEnd = vi.fn();

    // before
    const { result } = renderHook(() => useTrackIsDragging(undefined, onDragEnd));

    result.current.handleDragStart();

    // action
    result.current.handleDragEnd();

    // result
    expect(result.current.isDraggingRef.current).toBe(false);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('should not throw when no onDragStart/onDragEnd callbacks are given', () => {
    // before
    const { result } = renderHook(() => useTrackIsDragging());

    // result
    expect(() => result.current.handleDragStart()).not.toThrow();
    expect(() => result.current.handleDragEnd()).not.toThrow();
  });
});
