import { PointerEvent as ReactPointerEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useGlassLightDrag } from './useGlassLightDrag';

const createEvent = (clientX: number, clientY: number): ReactPointerEvent<HTMLDivElement> =>
  ({
    clientX,
    clientY,
    currentTarget: { releasePointerCapture: vi.fn(), setPointerCapture: vi.fn() },
    pointerId: 1,
  }) as unknown as ReactPointerEvent<HTMLDivElement>;

describe('useGlassLightDrag', () => {
  it('should start a gesture on pointer down, follow the pointer while it is down and end the gesture on pointer up', () => {
    // mock
    const onChange = vi.fn();
    const onDragEnd = vi.fn();
    const onDragStart = vi.fn();
    const { result } = renderHook(() => useGlassLightDrag({ onChange, onDragEnd, onDragStart }));

    (result.current.ref as { current: unknown }).current = {
      getBoundingClientRect: (): object => ({ height: 50, left: 0, top: 0, width: 50 }),
    };

    // action
    result.current.onPointerMove(createEvent(50, 25));
    result.current.onPointerDown(createEvent(50, 25));
    result.current.onPointerMove(createEvent(25, 50));
    result.current.onPointerUp(createEvent(25, 50));
    result.current.onPointerMove(createEvent(0, 25));

    // result — pointer moves outside a drag are ignored
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenNthCalledWith(1, 90);
    expect(onChange).toHaveBeenNthCalledWith(2, 180);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
