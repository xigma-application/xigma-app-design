import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// hooks
import { useScrollbarDrag } from '../useScrollbarDrag';

// store
import { addNode, deleteNode, setViewport } from 'store/design/slice';
import { selectActivePage, selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrozenAxisRange, TScrollbarAxis } from '../../types';
import { TLayoutRefs } from 'types/design/canvas/types';

// utils
import { clamp } from 'utils/math/clamp';
import { getScrollbarThumb } from '../../utils/getScrollbarThumb';
import { getScrollGeometry } from '../../utils/getScrollGeometry';

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const CANVAS_RECT = { height: 600, width: 800 } as DOMRect;

const createLayout = (leftPanelWidth = 0, rightPanelWidth = 0): TLayoutRefs => ({
  leftPanelWidthRef: { current: leftPanelWidth },
  rightPanelWidthRef: { current: rightPanelWidth },
});

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(CANVAS_RECT);

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
  frozenRangeRef: RefObject<TFrozenAxisRange> = { current: null },
): ReturnType<typeof renderHook> =>
  renderHook(() => useScrollbarDrag(axis, canvasRef, layout, thumbRef, draggingRef, frozenRangeRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

// content larger than the 800x600 view on both axes, with the origin viewport sitting inside it
const addOverflowNode = (): void => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 2000,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 3000,
      x: -1100,
      y: -700,
    }),
  );
};

const addOffscreenNode = (): void => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 300,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 500,
      x: 1580,
      y: 300,
    }),
  );
};

// mirrors what handlePointerDown anchors on (live geometry, converted to a thumb offset/size) plus
// what handlePointerMove then derives from it, so these tests assert against the same formula the
// hook itself uses
const captureDragStart = (
  axis: TScrollbarAxis,
  leftPanelWidth: number,
  rightPanelWidth: number,
): {
  thumb0: ReturnType<typeof getScrollbarThumb>;
  trackLength: number;
  viewportValue: number;
  worldPerTrackPx: number;
} => {
  const state = store.getState();
  const viewport = selectViewport(state);
  const geo = getScrollGeometry(CANVAS_RECT, leftPanelWidth, rightPanelWidth, selectOrderedNodes(state), viewport);
  const rangeStart = axis === 'x' ? geo.range.x : geo.range.y;
  const rangeLength = axis === 'x' ? geo.range.width : geo.range.height;
  const visibleStart = axis === 'x' ? geo.visibleRect.x : geo.visibleRect.y;
  const trackLength = axis === 'x' ? geo.visibleRect.width : geo.visibleRect.height;
  const thumb0 = getScrollbarThumb(trackLength, visibleStart, trackLength, rangeStart, rangeLength);

  return {
    thumb0,
    trackLength,
    viewportValue: axis === 'x' ? viewport.x : viewport.y,
    worldPerTrackPx: rangeLength / trackLength,
  };
};

const expectedDragViewport = (axis: TScrollbarAxis, deltaPx: number, leftPanelWidth = 0, rightPanelWidth = 0): number => {
  const start = captureDragStart(axis, leftPanelWidth, rightPanelWidth);
  const desiredOffset = clamp(start.thumb0.offset + deltaPx, 0, start.trackLength - start.thumb0.size);

  return start.viewportValue - (desiredOffset - start.thumb0.offset) * start.worldPerTrackPx;
};

describe('useScrollbarDrag', () => {
  beforeEach(() => {
    store.dispatch(setViewport(DEFAULT_VIEWPORT));
  });

  afterEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should pan proportionally, not jump, when grabbing a thumb that is already pinned because the content sits far off to one side', () => {
    // mock — a frame drawn well outside the view on the right, no panning has happened yet: the thumb
    // renders already clamped to the start of the track the instant it appears
    const canvas = createCanvas();
    const thumb = createThumb();

    addOffscreenNode();
    renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb });
    const expectedX = expectedDragViewport('x', 20);

    // action — grab the pinned thumb and nudge it a tiny amount
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0));
      thumb.dispatchEvent(pointerEvent('pointermove', 30, 0));
    });

    // result — a small, proportional pan, not a multi-hundred-px snap to a boundary
    expect(selectViewport(store.getState()).x).toBe(expectedX);
    expect(Math.abs(selectViewport(store.getState()).x)).toBeLessThan(200);
  });

  it('should render identically right after release as on the last frame of the drag, at the same viewport', () => {
    // mock — the render loop and the drag must agree on offset/size for the identical viewport, or
    // the thumb visibly snaps on release even though nothing was dispatched by pointerup itself
    const canvas = createCanvas();
    const thumb = createThumb();

    addOffscreenNode();
    renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb });

    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0));
      thumb.dispatchEvent(pointerEvent('pointermove', 150, 0));
    });

    // the geometry the render loop would have drawn on the last frame of the drag
    const duringViewport = selectViewport(store.getState());
    const duringGeo = getScrollGeometry(CANVAS_RECT, 0, 0, selectOrderedNodes(store.getState()), duringViewport);
    const duringThumb = getScrollbarThumb(
      duringGeo.visibleRect.width,
      duringGeo.visibleRect.x,
      duringGeo.visibleRect.width,
      duringGeo.range.x,
      duringGeo.range.width,
    );

    // action
    act(() => thumb.dispatchEvent(pointerEvent('pointerup', 150, 0)));

    // the viewport itself must not have moved on release
    expect(selectViewport(store.getState())).toEqual(duringViewport);

    // the geometry the render loop draws on the first frame after release
    const afterGeo = getScrollGeometry(CANVAS_RECT, 0, 0, selectOrderedNodes(store.getState()), selectViewport(store.getState()));
    const afterThumb = getScrollbarThumb(
      afterGeo.visibleRect.width,
      afterGeo.visibleRect.x,
      afterGeo.visibleRect.width,
      afterGeo.range.x,
      afterGeo.range.width,
    );

    // result — same viewport in, same thumb out
    expect(afterThumb).toEqual(duringThumb);
  });

  it('should leave the viewport untouched on a pointer-down alone, even while already pinned, before any move', () => {
    // mock — same already-pinned scenario, but this time only press, never move
    const canvas = createCanvas();
    const thumb = createThumb();

    addOffscreenNode();
    renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb });

    // action
    act(() => thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0)));

    // result
    expect(selectViewport(store.getState())).toEqual(DEFAULT_VIEWPORT);
  });

  it('should pan viewport.x by the drag delta while the thumb is within the track', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();

    addOverflowNode();
    renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb });
    const expectedX = expectedDragViewport('x', 100);

    // action
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0));
      thumb.dispatchEvent(pointerEvent('pointermove', 110, 0));
    });

    // result
    expect(selectViewport(store.getState())).toEqual({ x: expectedX, y: 0, zoom: 1 });
    expect(thumb.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should pan viewport.y by the drag delta while the thumb is within the track', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();

    addOverflowNode();
    renderScrollbarDrag('y', { current: canvas }, createLayout(), { current: thumb });
    const expectedY = expectedDragViewport('y', 50);

    // action
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 0, 20));
      thumb.dispatchEvent(pointerEvent('pointermove', 0, 70));
    });

    // result
    expect(selectViewport(store.getState())).toEqual({ x: 0, y: expectedY, zoom: 1 });
  });

  it('should hard-stop the viewport at the content boundary when dragged well past the end', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();

    addOverflowNode();
    renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb });

    // action — one huge drag, then another in the same direction
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0));
      thumb.dispatchEvent(pointerEvent('pointermove', 6000, 0));
    });
    const afterFirst = selectViewport(store.getState()).x;

    act(() => thumb.dispatchEvent(pointerEvent('pointermove', 12000, 0)));
    const afterSecond = selectViewport(store.getState()).x;

    // result — pinned; dragging further does not move it, and it never reached the raw pan distance
    expect(afterSecond).toBe(afterFirst);
    expect(afterFirst).toBeGreaterThan(-4000);
  });

  it('should account for the current panel widths when converting the drag delta', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();

    addOverflowNode();
    renderScrollbarDrag('x', { current: canvas }, createLayout(200, 100), { current: thumb });
    const expectedX = expectedDragViewport('x', 100, 200, 100);

    // action
    act(() => {
      thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0));
      thumb.dispatchEvent(pointerEvent('pointermove', 110, 0));
    });

    // result
    expect(selectViewport(store.getState()).x).toBe(expectedX);
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();

    renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb });

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

    addOverflowNode();
    renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb });

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
    const draggingRef: RefObject<boolean> = { current: false };

    renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb }, draggingRef);

    // action — press and hold
    act(() => thumb.dispatchEvent(pointerEvent('pointerdown', 10, 0)));

    // result
    expect(draggingRef.current).toBe(true);

    // action — release
    act(() => thumb.dispatchEvent(pointerEvent('pointerup', 10, 0)));

    // result
    expect(draggingRef.current).toBe(false);
  });

  it('should clear the dragging flag on unmount, even if the pointer was still down', () => {
    // mock
    const canvas = createCanvas();
    const thumb = createThumb();
    const draggingRef: RefObject<boolean> = { current: false };

    const { unmount } = renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb }, draggingRef);

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

    renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb });

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

    const { unmount } = renderScrollbarDrag('x', { current: canvas }, createLayout(), { current: thumb });

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
