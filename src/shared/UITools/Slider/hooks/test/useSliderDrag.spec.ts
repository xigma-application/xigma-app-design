import { PointerEvent as ReactPointerEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSliderDrag } from '../useSliderDrag';

const createTrack = (): HTMLDivElement => {
  const track = document.createElement('div');

  vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({ height: 24, left: 0, top: 0, width: 100 } as DOMRect);

  return track;
};

const createEvent = (clientX: number, buttons = 1): ReactPointerEvent<HTMLDivElement> =>
  ({
    buttons,
    clientX,
    clientY: 0,
    currentTarget: { releasePointerCapture: vi.fn(), setPointerCapture: vi.fn() },
    pointerId: 1,
  }) as unknown as ReactPointerEvent<HTMLDivElement>;

describe('useSliderDrag', () => {
  it('should not call onChange on pointer down when the track ref is not yet attached', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSliderDrag({ max: 100, min: 0, onChange }));

    // action
    result.current.onPointerDown(createEvent(50));

    // result
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not call onChange on pointer move when the track ref is not yet attached', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSliderDrag({ max: 100, min: 0, onChange }));

    // action
    result.current.onPointerMove(createEvent(50));

    // result
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should capture the pointer, call onDragStart, and report a value derived from the range on pointer down', () => {
    // mock
    const onChange = vi.fn();
    const onDragStart = vi.fn();

    // before
    const { result } = renderHook(() => useSliderDrag({ max: 100, min: 0, onChange, onDragStart }));

    result.current.trackRef.current = createTrack();

    const event = createEvent(25);

    // action
    result.current.onPointerDown(event);

    // result
    expect(event.currentTarget.setPointerCapture).toHaveBeenCalledWith(1);
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(25);
  });

  it('should scale the reported value to an arbitrary min/max range', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSliderDrag({ max: 200, min: 100, onChange }));

    result.current.trackRef.current = createTrack();

    // action
    result.current.onPointerDown(createEvent(25));

    // result
    expect(onChange).toHaveBeenCalledWith(125);
  });

  it('should report a value on pointer move while the button is held', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSliderDrag({ max: 100, min: 0, onChange }));

    result.current.trackRef.current = createTrack();

    // action
    result.current.onPointerMove(createEvent(75));

    // result
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it('should ignore pointer move while no button is pressed', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSliderDrag({ max: 100, min: 0, onChange }));

    result.current.trackRef.current = createTrack();

    // action
    result.current.onPointerMove(createEvent(75, 0));

    // result
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should release the pointer and call onDragEnd on pointer up', () => {
    // mock
    const onChange = vi.fn();
    const onDragEnd = vi.fn();

    // before
    const { result } = renderHook(() => useSliderDrag({ max: 100, min: 0, onChange, onDragEnd }));

    const event = createEvent(0);

    // action
    result.current.onPointerUp(event);

    // result
    expect(event.currentTarget.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
