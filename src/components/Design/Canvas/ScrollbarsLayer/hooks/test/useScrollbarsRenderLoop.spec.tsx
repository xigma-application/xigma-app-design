import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useScrollbarsRenderLoop } from '../useScrollbarsRenderLoop';

// store
import { addNode, deleteNode } from 'store/design/slice';
import { selectActivePage, selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TLayoutRefs } from 'types/design/canvas/types';
import { TScrollbarDragRefs, TScrollbarElementRefs } from '../../types';

// utils
import { getScrollbarThumb } from '../../utils/getScrollbarThumb';
import { getScrollGeometry } from '../../utils/getScrollGeometry';

const createElements = (): TScrollbarElementRefs => ({
  horizontalThumbRef: { current: document.createElement('div') },
  horizontalTrackRef: { current: document.createElement('div') },
  verticalThumbRef: { current: document.createElement('div') },
  verticalTrackRef: { current: document.createElement('div') },
});

const createDragging = (x = false, y = false): TScrollbarDragRefs => ({ x: { current: x }, y: { current: y } });

const createLayout = (leftPanelWidth = 0, rightPanelWidth = 0): TLayoutRefs => ({
  leftPanelWidthRef: { current: leftPanelWidth },
  rightPanelWidthRef: { current: rightPanelWidth },
});

const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height, width } as DOMRect);

  return canvas;
};

const renderLoop = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  layout: TLayoutRefs,
  elements: TScrollbarElementRefs,
  dragging: TScrollbarDragRefs = createDragging(),
): ReturnType<typeof renderHook> => renderHook(() => useScrollbarsRenderLoop(canvasRef, layout, elements, dragging));

describe('useScrollbarsRenderLoop', () => {
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    rafCallbacks = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);

      return rafCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should position both tracks and thumbs to match the computed scroll geometry on each frame', () => {
    // mock
    const canvas = createCanvas(800, 600);
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };
    const layout = createLayout(200, 100);
    const elements = createElements();

    // before — mount only schedules the first frame
    renderLoop(canvasRef, layout, elements);
    expect(rafCallbacks).toHaveLength(1);

    // action
    rafCallbacks[rafCallbacks.length - 1](0);

    // result — recompute the same geometry independently and compare against what got written
    const state = store.getState();
    const { range, visibleRect } = getScrollGeometry(
      canvas.getBoundingClientRect(),
      200,
      100,
      selectOrderedNodes(state),
      selectViewport(state),
    );
    const horizontal = getScrollbarThumb(visibleRect.width, visibleRect.x, visibleRect.width, range.x, range.width);
    const vertical = getScrollbarThumb(visibleRect.height, visibleRect.y, visibleRect.height, range.y, range.height);

    expect(elements.horizontalTrackRef.current?.style.left).toBe(`${visibleRect.x}px`);
    expect(elements.horizontalTrackRef.current?.style.width).toBe(`${visibleRect.width}px`);
    expect(elements.horizontalThumbRef.current?.style.left).toBe(`${horizontal.offset}px`);
    expect(elements.horizontalThumbRef.current?.style.width).toBe(`${horizontal.size}px`);
    expect(elements.verticalTrackRef.current?.style.right).toBe('100px');
    expect(elements.verticalTrackRef.current?.style.top).toBe(`${visibleRect.y}px`);
    expect(elements.verticalTrackRef.current?.style.height).toBe(`${visibleRect.height}px`);
    expect(elements.verticalThumbRef.current?.style.top).toBe(`${vertical.offset}px`);
    expect(elements.verticalThumbRef.current?.style.height).toBe(`${vertical.size}px`);
  });

  it('should hide both tracks while nothing overflows the visible area', () => {
    // mock — empty page, viewport at origin: content fallback exactly fills the view
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: createCanvas(800, 600) };
    const elements = createElements();

    // before
    renderLoop(canvasRef, createLayout(), elements);
    rafCallbacks[rafCallbacks.length - 1](0);

    // result
    expect(elements.horizontalTrackRef.current?.style.display).toBe('none');
    expect(elements.verticalTrackRef.current?.style.display).toBe('none');
  });

  it('should show each track again once its own axis overflows the visible area', () => {
    // mock — a node far past both the right and bottom edges of an 800×600 view
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: createCanvas(800, 600) };
    const elements = createElements();
    const nodeId = store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 100,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 100,
        x: 5000,
        y: 5000,
      }),
    ).payload.id;

    // before
    renderLoop(canvasRef, createLayout(), elements);
    rafCallbacks[rafCallbacks.length - 1](0);

    // result
    expect(elements.horizontalTrackRef.current?.style.display).toBe('');
    expect(elements.verticalTrackRef.current?.style.display).toBe('');

    // after — restore the shared store
    store.dispatch(deleteNode(nodeId));
    expect(selectActivePage(store.getState()).rootOrder).toEqual([]);
  });

  it('should keep a track visible while its axis is being dragged, even with nothing overflowing', () => {
    // mock — empty page (no overflow), but the horizontal drag is in progress
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: createCanvas(800, 600) };
    const elements = createElements();

    // before
    renderLoop(canvasRef, createLayout(), elements, createDragging(true, false));
    rafCallbacks[rafCallbacks.length - 1](0);

    // result — the grabbed bar stays put, the other one still hides
    expect(elements.horizontalTrackRef.current?.style.display).toBe('');
    expect(elements.verticalTrackRef.current?.style.display).toBe('none');
  });

  it('should read the current panel widths on every frame, without needing a re-render', () => {
    // mock
    const canvas = createCanvas(800, 600);
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: canvas };
    const layout = createLayout(0, 0);
    const elements = createElements();

    // before
    renderLoop(canvasRef, layout, elements);
    rafCallbacks[rafCallbacks.length - 1](0);
    const initialLeft = elements.horizontalTrackRef.current?.style.left;
    const initialRight = elements.verticalTrackRef.current?.style.right;

    // action — the panels resize live, no re-render needed
    layout.leftPanelWidthRef.current = 300;
    layout.rightPanelWidthRef.current = 150;
    rafCallbacks[rafCallbacks.length - 1](0);

    // result
    expect(initialLeft).toBe('0px');
    expect(initialRight).toBe('0px');
    expect(elements.horizontalTrackRef.current?.style.left).toBe('300px');
    expect(elements.verticalTrackRef.current?.style.right).toBe('150px');
  });

  it('should keep scheduling frames until unmounted', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: createCanvas(800, 600) };
    const elements = createElements();

    // before
    const { unmount } = renderLoop(canvasRef, createLayout(), elements);

    // action
    unmount();

    // result
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when the canvas ref is empty', () => {
    // before
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: null };

    // result
    expect(() => renderLoop(canvasRef, createLayout(), createElements())).not.toThrow();
    expect(rafCallbacks).toHaveLength(0);
  });

  it('should skip a frame where a track or thumb element has not mounted yet', () => {
    // mock
    const canvasRef: RefObject<HTMLCanvasElement | null> = { current: createCanvas(800, 600) };
    const elements = createElements();

    elements.horizontalThumbRef.current = null;

    // before
    renderLoop(canvasRef, createLayout(), elements);

    // result
    expect(() => rafCallbacks[rafCallbacks.length - 1](0)).not.toThrow();
    expect(elements.horizontalTrackRef.current?.style.left).toBe('');
  });
});
