import { PointerEvent as ReactPointerEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useGradientBarDrag } from '../useGradientBarDrag';

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

const createEvent = <TElement extends HTMLElement>(
  clientX: number,
  options: { buttons?: number; sameAsCurrentTarget?: boolean } = {},
): ReactPointerEvent<TElement> => {
  const target = {};
  const currentTarget = { releasePointerCapture: vi.fn(), setPointerCapture: vi.fn() };

  return {
    buttons: options.buttons ?? 1,
    clientX,
    currentTarget,
    pointerId: 1,
    stopPropagation: vi.fn(),
    target: options.sameAsCurrentTarget === false ? target : currentTarget,
  } as unknown as ReactPointerEvent<TElement>;
};

describe('useGradientBarDrag', () => {
  it('should add a stop at the clicked position when it is far from every existing stop', () => {
    // mock
    const onAddStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop, onMoveStop: vi.fn(), onSelectStop: vi.fn(), stops: STOPS }));
    result.current.barRef.current = createBar();

    // action
    result.current.onTrackPointerDown(createEvent(100));

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
    result.current.onTrackPointerDown(createEvent(4));

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
    result.current.onTrackPointerDown(createEvent(100, { sameAsCurrentTarget: false }));

    // result
    expect(onAddStop).not.toHaveBeenCalled();
  });

  it('should select the stop and capture the pointer on thumb pointer down', () => {
    // mock
    const onSelectStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop: vi.fn(), onMoveStop: vi.fn(), onSelectStop, stops: STOPS }));
    result.current.barRef.current = createBar();

    const event = createEvent<HTMLButtonElement>(50);

    // action
    result.current.getThumbHandlers('stop-1').onPointerDown(event);

    // result
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.currentTarget.setPointerCapture).toHaveBeenCalledWith(1);
    expect(onSelectStop).toHaveBeenCalledWith('stop-1');
  });

  it('should move the stop to the dragged position while the button is pressed', () => {
    // mock
    const onMoveStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop: vi.fn(), onMoveStop, onSelectStop: vi.fn(), stops: STOPS }));
    result.current.barRef.current = createBar();

    // action
    result.current.getThumbHandlers('stop-1').onPointerMove(createEvent<HTMLButtonElement>(150));

    // result
    expect(onMoveStop).toHaveBeenCalledWith('stop-1', 0.75);
  });

  it('should not move the stop on pointer move once the button is released', () => {
    // mock
    const onMoveStop = vi.fn();

    // before
    const { result } = renderHook(() => useGradientBarDrag({ onAddStop: vi.fn(), onMoveStop, onSelectStop: vi.fn(), stops: STOPS }));
    result.current.barRef.current = createBar();

    // action
    result.current.getThumbHandlers('stop-1').onPointerMove(createEvent<HTMLButtonElement>(150, { buttons: 0 }));

    // result
    expect(onMoveStop).not.toHaveBeenCalled();
  });

  it('should release the pointer capture on thumb pointer up', () => {
    // before
    const { result } = renderHook(() =>
      useGradientBarDrag({ onAddStop: vi.fn(), onMoveStop: vi.fn(), onSelectStop: vi.fn(), stops: STOPS }),
    );
    const event = createEvent<HTMLButtonElement>(0);

    // action
    result.current.getThumbHandlers('stop-1').onPointerUp(event);

    // result
    expect(event.currentTarget.releasePointerCapture).toHaveBeenCalledWith(1);
  });
});
