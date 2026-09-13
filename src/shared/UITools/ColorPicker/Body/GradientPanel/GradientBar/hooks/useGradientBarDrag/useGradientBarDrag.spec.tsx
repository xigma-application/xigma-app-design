import { PointerEvent as ReactPointerEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useGradientBarDrag } from './useGradientBarDrag';

// types
import { TEditableGradientStop } from '../../../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
];

const createBar = (): HTMLDivElement => {
  const bar = document.createElement('div');

  vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue({ height: 16, left: 0, top: 0, width: 200 } as DOMRect);

  return bar;
};

const createPointerDownEvent = <TElement extends HTMLElement>(
  clientX: number,
  options: { sameAsCurrentTarget?: boolean } = {},
): ReactPointerEvent<TElement> => {
  const target = {};
  const currentTarget = {};

  return {
    clientX,
    currentTarget,
    pointerId: 1,
    stopPropagation: vi.fn(),
    target: options.sameAsCurrentTarget === false ? target : currentTarget,
  } as unknown as ReactPointerEvent<TElement>;
};

const dispatchWindowPointerMove = (clientX: number): void => {
  window.dispatchEvent(new PointerEvent('pointermove', { clientX }));
};

const dispatchWindowPointerUp = (): void => {
  window.dispatchEvent(new PointerEvent('pointerup'));
};

describe('useGradientBarDrag', () => {
  it('should add a stop at the clicked position when it is far from every existing stop', () => {
    // mock
    const onAddStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop, onMoveStop: vi.fn(), onSelectStop: vi.fn(), stops: STOPS }));
    result.current.barRef.current = createBar();

    // action
    result.current.onTrackPointerDown(createPointerDownEvent(100));

    // result
    expect(onAddStop).toHaveBeenCalledWith(0.5);
  });

  it('should select the nearby stop instead of adding a duplicate when the click lands close to it', () => {
    // mock
    const onAddStop = vi.fn();
    const onSelectStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop, onMoveStop: vi.fn(), onSelectStop, stops: STOPS }));
    result.current.barRef.current = createBar();

    // action
    result.current.onTrackPointerDown(createPointerDownEvent(4));

    // result
    expect(onSelectStop).toHaveBeenCalledWith('stop-1');
    expect(onAddStop).not.toHaveBeenCalled();
  });

  it('should not add a stop when the pointer down originates from a thumb', () => {
    // mock
    const onAddStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop, onMoveStop: vi.fn(), onSelectStop: vi.fn(), stops: STOPS }));
    result.current.barRef.current = createBar();

    // action
    result.current.onTrackPointerDown(createPointerDownEvent(100, { sameAsCurrentTarget: false }));

    // result
    expect(onAddStop).not.toHaveBeenCalled();
  });

  it('should select the stop on thumb pointer down', () => {
    // mock
    const onSelectStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop: vi.fn(), onMoveStop: vi.fn(), onSelectStop, stops: STOPS }));
    result.current.barRef.current = createBar();

    const event = createPointerDownEvent<HTMLButtonElement>(50);

    // action
    result.current.getThumbHandlers('stop-1').onPointerDown(event);

    // result
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(onSelectStop).toHaveBeenCalledWith('stop-1');
  });

  it('should move the dragged stop on a window-level pointermove after thumb pointer down', () => {
    // mock
    const onMoveStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop: vi.fn(), onMoveStop, onSelectStop: vi.fn(), stops: STOPS }));
    result.current.barRef.current = createBar();

    // action
    result.current.getThumbHandlers('stop-1').onPointerDown(createPointerDownEvent(50));
    act(() => dispatchWindowPointerMove(150));

    // result
    expect(onMoveStop).toHaveBeenCalledWith('stop-1', 0.75);
  });

  it('should keep moving the same dragged stop even after the stops array is reordered mid-drag (crossing another stop)', () => {
    // mock — regression for the bug where crossing another stop briefly "stole" the drag: reordering
    // used to physically move the thumb's DOM node, which silently released native pointer capture
    const onMoveStop = vi.fn();

    // before
    const { rerender, result } = renderHook(
      ({ currentStops }: { currentStops: TEditableGradientStop[] }) =>
        useGradientBarDrag({ onAddStop: vi.fn(), onMoveStop, onSelectStop: vi.fn(), stops: currentStops }),
      { initialProps: { currentStops: STOPS } },
    );
    result.current.barRef.current = createBar();

    result.current.getThumbHandlers('stop-2').onPointerDown(createPointerDownEvent(200));

    // stop-2 crosses stop-1 and the array gets re-sorted by position
    rerender({ currentStops: [STOPS[1], STOPS[0]] });

    // action
    act(() => dispatchWindowPointerMove(10));

    // result — still moving stop-2, not stop-1
    expect(onMoveStop).toHaveBeenCalledWith('stop-2', 0.05);
    expect(onMoveStop).not.toHaveBeenCalledWith('stop-1', expect.anything());
  });

  it('should stop moving any stop after a window-level pointerup', () => {
    // mock
    const onMoveStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop: vi.fn(), onMoveStop, onSelectStop: vi.fn(), stops: STOPS }));
    result.current.barRef.current = createBar();

    result.current.getThumbHandlers('stop-1').onPointerDown(createPointerDownEvent(50));

    // action
    act(() => dispatchWindowPointerUp());
    act(() => dispatchWindowPointerMove(150));

    // result
    expect(onMoveStop).not.toHaveBeenCalled();
  });

  it('should not move any stop from a window pointermove without a preceding thumb pointer down', () => {
    // mock
    const onMoveStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop: vi.fn(), onMoveStop, onSelectStop: vi.fn(), stops: STOPS }));
    result.current.barRef.current = createBar();

    // action
    act(() => dispatchWindowPointerMove(150));

    // result
    expect(onMoveStop).not.toHaveBeenCalled();
  });
});
