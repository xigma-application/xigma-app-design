import { MouseEvent, RefObject } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useMouseDownEvent } from '../useMouseDownEvent';

const setMousePosition = vi.fn();
const onMouseDown = vi.fn();
const requestPointerLock = vi.fn();
const inputRef = { current: { requestPointerLock } } as unknown as RefObject<HTMLDivElement>;

describe('useMouseDownEvent', () => {
  it('should seed the position, notify the caller and request pointer lock', () => {
    // before
    const { result } = renderHook(() => useMouseDownEvent(inputRef, onMouseDown, setMousePosition));

    // action
    result.current({ clientX: 3, clientY: 4 } as MouseEvent);

    // result
    expect(setMousePosition).toHaveBeenCalledWith({ x: 3, y: 4 });
    expect(onMouseDown).toHaveBeenCalledTimes(1);
    expect(requestPointerLock).toHaveBeenCalledTimes(1);
  });
});
