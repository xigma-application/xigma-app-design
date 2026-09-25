import { renderHook } from '@testing-library/react';

// hooks
import { useMouseMoveEvent } from '../useMouseMoveEvent';

const moveMouse = (movementX: number, shiftKey = false): void => {
  window.dispatchEvent(new MouseEvent('mousemove', { movementX, shiftKey }));
};

describe('useMouseMoveEvent', () => {
  it('should not listen to mouse moves while no scrub is in progress', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderHook(() => useMouseMoveEvent(100, 0, false, null, onChange, vi.fn(), 50));

    // action
    moveMouse(10);

    // result
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should scrub slowly by default and fast with Shift, moving the tracked position along', () => {
    // mock
    const onChange = vi.fn();
    const setMousePosition = vi.fn();

    // before
    renderHook(() => useMouseMoveEvent(100, 0, false, { x: 10, y: 5 }, onChange, setMousePosition, 50));

    // action
    moveMouse(10);
    moveMouse(10, true);

    // result
    expect(onChange).toHaveBeenNthCalledWith(1, 55);
    expect(onChange).toHaveBeenNthCalledWith(2, 70);
    expect(setMousePosition).toHaveBeenCalledWith({ x: 20, y: 5 });
  });

  it('should clamp the value to the range', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderHook(() => useMouseMoveEvent(100, 0, false, { x: 10, y: 5 }, onChange, vi.fn(), 98));

    // action
    moveMouse(20, true);

    // result
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('should wrap around to the other end of the range when looping at a bound', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderHook(() => useMouseMoveEvent(100, 0, true, { x: 10, y: 5 }, onChange, vi.fn(), 100));

    // action
    moveMouse(20, true);

    // result
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('should stop listening once unmounted', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { unmount } = renderHook(() => useMouseMoveEvent(100, 0, false, { x: 10, y: 5 }, onChange, vi.fn(), 50));

    // action
    unmount();
    moveMouse(10);

    // result
    expect(onChange).not.toHaveBeenCalled();
  });
});
