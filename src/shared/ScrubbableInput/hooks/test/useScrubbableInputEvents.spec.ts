import { MouseEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useScrubbableInputEvents } from '../useScrubbableInputEvents';

describe('useScrubbableInputEvents', () => {
  it('should start with no scrub in progress', () => {
    // before
    const { result } = renderHook(() => useScrubbableInputEvents({ current: null }, false, 100, 0, vi.fn(), vi.fn(), vi.fn(), 50));

    // result
    expect(result.current.mousePosition).toBeNull();
  });

  it('should track the pointer from mouse down, scrub on move and stop on mouse up', () => {
    // mock
    const onChange = vi.fn();
    const onMouseDown = vi.fn();
    const onMouseUp = vi.fn();

    // before
    const { result } = renderHook(() => useScrubbableInputEvents({ current: null }, false, 100, 0, onChange, onMouseDown, onMouseUp, 50));

    // action
    act(() => result.current.onMouseDown({ clientX: 3, clientY: 4 } as MouseEvent<HTMLElement>));

    // result
    expect(result.current.mousePosition).toEqual({ x: 3, y: 4 });
    expect(onMouseDown).toHaveBeenCalledTimes(1);

    // action
    act(() => {
      window.dispatchEvent(new window.MouseEvent('mousemove', { movementX: 10 }));
    });

    // result
    expect(onChange).toHaveBeenCalledWith(55);

    // action
    act(() => result.current.onMouseUp({} as MouseEvent<HTMLElement>));

    // result
    expect(result.current.mousePosition).toBeNull();
    expect(onMouseUp).toHaveBeenCalledTimes(1);
  });
});
