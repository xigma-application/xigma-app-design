import { PointerEvent as ReactPointerEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { usePointerDrag } from '../usePointerDrag';

const createTrack = (): HTMLDivElement => {
  const track = document.createElement('div');

  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 100, left: 0, top: 0, width: 100 } as DOMRect);

  return track;
};

const createEvent = (clientX: number, clientY: number, buttons = 1): ReactPointerEvent<HTMLDivElement> =>
  ({
    buttons,
    clientX,
    clientY,
    currentTarget: { releasePointerCapture: vi.fn(), setPointerCapture: vi.fn() },
    pointerId: 1,
  }) as unknown as ReactPointerEvent<HTMLDivElement>;

describe('usePointerDrag behaviors', () => {
  it('should not call onChange on pointer down when the track ref is not yet attached', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => usePointerDrag({ onChange }));

    // action
    result.current.onPointerDown(createEvent(50, 50));

    // result
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should capture the pointer and report a normalized x position on pointer down for the x axis', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => usePointerDrag({ onChange }));
    result.current.trackRef.current = createTrack();

    const event = createEvent(25, 90);

    // action
    result.current.onPointerDown(event);

    // result
    expect(event.currentTarget.setPointerCapture).toHaveBeenCalledWith(1);
    expect(onChange).toHaveBeenCalledWith({ x: 0.25, y: 0 });
  });

  it('should report a normalized x and y position on pointer down for the both axis', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => usePointerDrag({ axis: 'both', onChange }));
    result.current.trackRef.current = createTrack();

    // action
    result.current.onPointerDown(createEvent(75, 20));

    // result
    expect(onChange).toHaveBeenCalledWith({ x: 0.75, y: 0.2 });
  });

  it('should clamp a position outside the track bounds', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => usePointerDrag({ axis: 'both', onChange }));
    result.current.trackRef.current = createTrack();

    // action
    result.current.onPointerDown(createEvent(-50, 500));

    // result
    expect(onChange).toHaveBeenCalledWith({ x: 0, y: 1 });
  });

  it('should report a new position on pointer move while the button is pressed', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => usePointerDrag({ onChange }));
    result.current.trackRef.current = createTrack();

    // action
    result.current.onPointerMove(createEvent(60, 0, 1));

    // result
    expect(onChange).toHaveBeenCalledWith({ x: 0.6, y: 0 });
  });

  it('should not report a position on pointer move once the button is released', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => usePointerDrag({ onChange }));
    result.current.trackRef.current = createTrack();

    // action
    result.current.onPointerMove(createEvent(60, 0, 0));

    // result
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should release the pointer capture on pointer up', () => {
    // before
    const { result } = renderHook(() => usePointerDrag({ onChange: vi.fn() }));
    const event = createEvent(0, 0);

    // action
    result.current.onPointerUp(event);

    // result
    expect(event.currentTarget.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('should call onDragStart once on pointer down, before onChange', () => {
    // mock
    const onChange = vi.fn();
    const onDragStart = vi.fn();

    // before
    const { result } = renderHook(() => usePointerDrag({ onChange, onDragStart }));
    result.current.trackRef.current = createTrack();

    // action
    result.current.onPointerDown(createEvent(25, 90));

    // result
    expect(onDragStart).toHaveBeenCalledTimes(1);
  });

  it('should not call onDragStart on pointer down when the track ref is not yet attached', () => {
    // mock
    const onDragStart = vi.fn();

    // before
    const { result } = renderHook(() => usePointerDrag({ onChange: vi.fn(), onDragStart }));

    // action
    result.current.onPointerDown(createEvent(50, 50));

    // result
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('should not call onDragStart on pointer move', () => {
    // mock
    const onDragStart = vi.fn();

    // before
    const { result } = renderHook(() => usePointerDrag({ onChange: vi.fn(), onDragStart }));
    result.current.trackRef.current = createTrack();

    // action
    result.current.onPointerMove(createEvent(60, 0, 1));

    // result
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('should call onDragEnd once on pointer up', () => {
    // mock
    const onDragEnd = vi.fn();

    // before
    const { result } = renderHook(() => usePointerDrag({ onChange: vi.fn(), onDragEnd }));
    const event = createEvent(0, 0);

    // action
    result.current.onPointerUp(event);

    // result
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
