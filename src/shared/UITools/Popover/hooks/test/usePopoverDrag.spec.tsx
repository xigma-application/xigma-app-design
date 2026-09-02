import { act, renderHook } from '@testing-library/react';

// hooks
import { usePopoverDrag } from '../usePopoverDrag';

const createPointerDownEvent = (
  target: HTMLElement,
  clientX: number,
  clientY: number,
  containsTarget = true,
): React.PointerEvent<HTMLDivElement> =>
  ({
    buttons: 1,
    clientX,
    clientY,
    currentTarget: {
      contains: () => containsTarget,
      hasPointerCapture: () => false,
      releasePointerCapture: vi.fn(),
      setPointerCapture: vi.fn(),
    },
    pointerId: 1,
    target,
  }) as unknown as React.PointerEvent<HTMLDivElement>;

describe('usePopoverDrag', () => {
  it('should start at a zero offset', () => {
    // before
    const { result } = renderHook(() => usePopoverDrag(true));

    // result
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it('should move the offset while dragging from a non-interactive target', () => {
    // mock
    const background = document.createElement('div');

    // before
    const { result } = renderHook(() => usePopoverDrag(true));

    // action
    act(() => result.current.onPointerDown(createPointerDownEvent(background, 100, 100)));
    act(() => result.current.onPointerMove(createPointerDownEvent(background, 130, 90)));

    // result
    expect(result.current.offset).toEqual({ x: 30, y: -10 });
  });

  it('should not start a drag when the pointerdown target is interactive', () => {
    // mock
    const button = document.createElement('button');

    // before
    const { result } = renderHook(() => usePopoverDrag(true));

    // action
    act(() => result.current.onPointerDown(createPointerDownEvent(button, 100, 100)));
    act(() => result.current.onPointerMove(createPointerDownEvent(button, 130, 90)));

    // result
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it('should not start a drag when the pointerdown target only bubbled here via a portal (not a real DOM descendant)', () => {
    // mock — a node from an unrelated portal (e.g. the color sampler's mask), which
    // still reaches this handler through React's tree even though it isn't physically
    // inside the panel
    const portalledNode = document.createElement('div');
    const downEvent = createPointerDownEvent(portalledNode, 100, 100, false);

    // before
    const { result } = renderHook(() => usePopoverDrag(true));

    // action
    act(() => result.current.onPointerDown(downEvent));
    act(() => result.current.onPointerMove(createPointerDownEvent(portalledNode, 130, 90, false)));

    // result — never captured the pointer onto this panel, so a later pointerup/click
    // triggered by that portalled node's own gesture isn't redirected here instead
    expect(downEvent.currentTarget.setPointerCapture).not.toHaveBeenCalled();
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it('should not start a drag when the pointerdown target opts out via data-no-drag', () => {
    // mock
    const slider = document.createElement('div');
    slider.setAttribute('data-no-drag', '');

    // before
    const { result } = renderHook(() => usePopoverDrag(true));

    // action
    act(() => result.current.onPointerDown(createPointerDownEvent(slider, 100, 100)));
    act(() => result.current.onPointerMove(createPointerDownEvent(slider, 130, 90)));

    // result
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it('should stop moving once the drag ends', () => {
    // mock
    const background = document.createElement('div');

    // before
    const { result } = renderHook(() => usePopoverDrag(true));
    act(() => result.current.onPointerDown(createPointerDownEvent(background, 100, 100)));
    act(() => result.current.onPointerMove(createPointerDownEvent(background, 130, 90)));
    act(() => result.current.onPointerUp(createPointerDownEvent(background, 130, 90)));

    // action
    act(() => result.current.onPointerMove(createPointerDownEvent(background, 200, 200)));

    // result
    expect(result.current.offset).toEqual({ x: 30, y: -10 });
  });

  it('should release pointer capture on pointer up when the target still holds it', () => {
    // mock
    const releasePointerCapture = vi.fn();
    const event = {
      currentTarget: { hasPointerCapture: () => true, releasePointerCapture },
      pointerId: 1,
    } as unknown as React.PointerEvent<HTMLDivElement>;

    // before
    const { result } = renderHook(() => usePopoverDrag(true));

    // action
    act(() => result.current.onPointerUp(event));

    // result
    expect(releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('should reset the offset to zero when the popover opens while moveable', () => {
    // mock
    const background = document.createElement('div');

    // before
    const { result } = renderHook(() => usePopoverDrag(true));
    act(() => result.current.onPointerDown(createPointerDownEvent(background, 100, 100)));
    act(() => result.current.onPointerMove(createPointerDownEvent(background, 130, 90)));

    // action
    act(() => result.current.handleOpenChange(true));

    // result
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it('should not reset the offset when not moveable', () => {
    // before
    const { result } = renderHook(() => usePopoverDrag(false));

    // action
    act(() => result.current.handleOpenChange(true));

    // result
    expect(result.current.offset).toEqual({ x: 0, y: 0 });
  });

  it('should forward the open state to the provided onOpenChange callback', () => {
    // mock
    const onOpenChange = vi.fn();

    // before
    const { result } = renderHook(() => usePopoverDrag(true, onOpenChange));

    // action
    act(() => result.current.handleOpenChange(true));

    // result
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
