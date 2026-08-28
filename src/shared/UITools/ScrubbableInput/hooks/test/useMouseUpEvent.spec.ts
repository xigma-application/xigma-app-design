import { renderHook } from '@testing-library/react';

// hooks
import { useMouseUpEvent } from '../useMouseUpEvent';

const setMousePosition = vi.fn();
const onMouseUp = vi.fn();

describe('useMouseUpEvent', () => {
  it('should clear the position, notify the caller and exit pointer lock', () => {
    // spy
    const exitPointerLock = vi.spyOn(document, 'exitPointerLock').mockImplementation(vi.fn());

    // before
    const { result } = renderHook(() => useMouseUpEvent(onMouseUp, setMousePosition));

    // action
    result.current();

    // result
    expect(setMousePosition).toHaveBeenCalledWith(null);
    expect(onMouseUp).toHaveBeenCalledTimes(1);
    expect(exitPointerLock).toHaveBeenCalledTimes(1);
  });
});
