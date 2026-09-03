import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// hooks
import { useScrollbarDrag } from '../useScrollbarDrag';

// store
import { selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { setViewport } from 'store/design/slice';
import { store } from 'store';

// types
import { TLayoutRefs } from 'types/design/canvas/types';
import { TScrollbarAxis } from '../../types';

// utils
import { applyPan } from '../../../hooks/useCanvasPanZoom/utils/applyPan';
import { getScrollGeometry } from '../../utils/getScrollGeometry';

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createLayout = (leftPanelWidth = 0, rightPanelWidth = 0): TLayoutRefs => ({
  leftPanelWidthRef: { current: leftPanelWidth },
  rightPanelWidthRef: { current: rightPanelWidth },
});

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 800 } as DOMRect);

  return canvas;
};

const createThumb = (): HTMLDivElement => {
  const thumb = document.createElement('div');

  thumb.setPointerCapture = vi.fn();
  thumb.releasePointerCapture = vi.fn();

  return thumb;
};

const pointerEvent = (type: string, clientX: number, clientY: number, button = 0): PointerEvent =>
  new PointerEvent(type, { button, clientX, clientY, pointerId: 1 });

const renderScrollbarDrag = (
  axis: TScrollbarAxis,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  layout: TLayoutRefs,
  thumbRef: RefObject<HTMLDivElement | null>,
  draggingRef: RefObject<boolean> = { current: false },
): ReturnType<typeof renderHook> =>
  renderHook(() => useScrollbarDrag(axis, canvasRef, layout, thumbRef, draggingRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

describe('useScrollbarDrag', () => {
  beforeEach(() => {
    store.dispatch(setViewport(DEFAULT_VIEWPORT));
  });

  it("should pan viewport.x by the horizontal drag delta, scaled to the scroll range's ratio to the track", () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };
    const layout = createLayout();

    renderScrollbarDrag('x', canvasRef, layout, { current: thumb });

    const stateBefore = store.getState();
    const viewportBefore = selectViewport(stateBefore);
    const { range, visibleRect } = getScrollGeometry(canvas.getBoundingClientRect(), 0, 0, selectOrderedNodes(stateBefore), viewportBefore);
    const expectedViewport = applyPan(viewportBefore, 100 * (range.width / visibleRect.width), 0);

    // action
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0));
      thumb.dispatchEvent(pointerEvent('pointermove', 110, 0));
    });

    // result
    expect(selectViewport(store.getState())).toEqual(expectedViewport);
    expect(thumb.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it("should pan viewport.y by the vertical drag delta, scaled to the scroll range's ratio to the track", () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };
    const layout = createLayout();

    renderScrollbarDrag('y', canvasRef, layout, { current: thumb });

    const stateBefore = store.getState();
    const viewportBefore = selectViewport(stateBefore);
    const { range, visibleRect } = getScrollGeometry(canvas.getBoundingClientRect(), 0, 0, selectOrderedNodes(stateBefore), viewportBefore);
    const expectedViewport = applyPan(viewportBefore, 0, 50 * (range.height / visibleRect.height));

    // action
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 0, 20));
      thumb.dispatchEvent(pointerEvent('pointermove', 0, 70));
    });

    // result
    expect(selectViewport(store.getState())).toEqual(expectedViewport);
  });

  it('should account for the current panel widths when converting the drag delta', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };
    const layout = createLayout(200, 100);

    renderScrollbarDrag('x', canvasRef, layout, { current: thumb });

    const stateBefore = store.getState();
    const viewportBefore = selectViewport(stateBefore);
    const { range, visibleRect } = getScrollGeometry(
      canvas.getBoundingClientRect(),
      200,
      100,
      selectOrderedNodes(stateBefore),
      viewportBefore,
    );
    const expectedViewport = applyPan(viewportBefore, 100 * (range.width / visibleRect.width), 0);

    // action
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0));
      thumb.dispatchEvent(pointerEvent('pointermove', 110, 0));
    });

    // result
    expect(selectViewport(store.getState())).toEqual(expectedViewport);
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };

    renderScrollbarDrag('x', canvasRef, createLayout(), { current: thumb });

    // action
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0, 1));
      thumb.dispatchEvent(pointerEvent('pointermove', 110, 0));
    });

    // result
    expect(selectViewport(store.getState())).toEqual(DEFAULT_VIEWPORT);
    expect(thumb.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should stop panning once the pointer is released', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };

    renderScrollbarDrag('x', canvasRef, createLayout(), { current: thumb });

    // action
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0));
      thumb.dispatchEvent(pointerEvent('pointerup', 10, 0));
      thumb.dispatchEvent(pointerEvent('pointermove', 999, 0));
    });

    // result
    expect(selectViewport(store.getState())).toEqual(DEFAULT_VIEWPORT);
    expect(thumb.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('should flag the drag as active for the whole gesture so the render loop keeps its bar visible', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };
    const draggingRef: RefObject<boolean> = { current: false };

    renderScrollbarDrag('x', canvasRef, createLayout(), { current: thumb }, draggingRef);

    // action — press and hold
    act(() => thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0)));

    // result
    expect(draggingRef.current).toBe(true);

    // action — release
    act(() => thumb.dispatchEvent(pointerEvent('pointerup', 10, 0)));

    // result
    expect(draggingRef.current).toBe(false);
  });

  it('should clear the drag flag on unmount, even if the pointer was still down', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };
    const draggingRef: RefObject<boolean> = { current: false };

    const { unmount } = renderScrollbarDrag('x', canvasRef, createLayout(), { current: thumb }, draggingRef);

    act(() => thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0)));
    expect(draggingRef.current).toBe(true);

    // action
    unmount();

    // result
    expect(draggingRef.current).toBe(false);
  });

  it('should ignore a pointer-move that was not preceded by a pointer-down', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };

    renderScrollbarDrag('x', canvasRef, createLayout(), { current: thumb });

    // action
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointermove', 110, 0));
    });

    // result
    expect(selectViewport(store.getState())).toEqual(DEFAULT_VIEWPORT);
  });

  it('should do nothing when the thumb or canvas ref is empty', () => {
    // mock
    const emptyThumbRef: RefObject<HTMLDivElement | null> = { current: null };
    const emptyCanvasRef: RefObject<HTMLCanvasElement | null> = { current: null };

    // result
    expect(() => renderScrollbarDrag('x', emptyCanvasRef, createLayout(), { current: createThumb() })).not.toThrow();
    expect(() => renderScrollbarDrag('x', { current: createCanvas() }, createLayout(), emptyThumbRef)).not.toThrow();
  });

  it('should remove its listeners and stop tracking on unmount', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };

    const { unmount } = renderScrollbarDrag('x', canvasRef, createLayout(), { current: thumb });

    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0));
    });

    // action
    unmount();

    // result — dispatched after unmount, must not throw or affect the store
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointermove', 999, 0));
    });
    expect(selectViewport(store.getState())).toEqual(DEFAULT_VIEWPORT);
  });
});
