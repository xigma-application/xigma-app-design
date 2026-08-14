import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useHoverHighlight } from './useHoverHighlight';

// store
import { addNode, setActiveTool, setSelection, startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return { current: canvas };
};

const pointerEvent = (type: string, x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, ...options });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: size,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#ffffff', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addPathTextNode = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: size,
      name: 'Text',
      parentId: null,
      pathFlip: false,
      pathId: 'ellipse-1',
      pathStartOffset: 0,
      rotation: 0,
      type: NodeType.text,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const renderHoverHighlight = (canvasRef: RefObject<HTMLCanvasElement | null>): RefObject<string | null> => {
  const hoverRef: RefObject<string | null> = { current: null };

  renderHook(() => useHoverHighlight(canvasRef, hoverRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  return hoverRef;
};

describe('useHoverHighlight behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setSelection([]));
    store.dispatch(stopTextEdit());
  });

  it('should not react to pointer events when the default tool is not active', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.frame));

    const idA = addFrameNode(0, 0);
    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5, 5));

    // result
    expect(hoverRef.current).toBeNull();
    expect(idA).toBeTruthy();
  });

  it('should set the hovered node id when the pointer moves over a node', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 110, 110));

    // result
    expect(hoverRef.current).toBe(idA);
  });

  it('should clear the hovered node id when the pointer moves over empty canvas', () => {
    // mock
    const idA = addFrameNode(200, 200);
    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 205, 205));
    expect(hoverRef.current).toBe(idA);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 900, 900));

    // result
    expect(hoverRef.current).toBeNull();
  });

  it('should clear the hovered node id when the pointer leaves the canvas', () => {
    // mock
    const idA = addFrameNode(300, 300);
    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 305, 305));
    expect(hoverRef.current).toBe(idA);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerleave', 305, 305));

    // result
    expect(hoverRef.current).toBeNull();
  });

  it('should ignore pointer moves while a button is held (mid-drag elsewhere)', () => {
    // mock
    addFrameNode(400, 400);

    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 405, 405, { buttons: 1 }));

    // result
    expect(hoverRef.current).toBeNull();
  });

  it("should apply the positioning cursor class when hovering a selected line's endpoint", () => {
    // mock
    const idA = addLineNode(500, 500, 600, 500);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 500, 500));

    // result
    expect(canvasRef.current?.className).toContain('positioning');
    expect(hoverRef.current).toBe(idA);
  });

  it('should remove the positioning cursor class when the pointer moves off a line endpoint', () => {
    // mock
    const idA = addLineNode(700, 500, 800, 500);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderHoverHighlight(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 700, 500));
    expect(canvasRef.current?.className).toContain('positioning');

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 900, 900));

    // result
    expect(canvasRef.current?.className).not.toContain('positioning');
  });

  it('should remove the positioning cursor class when the pointer leaves the canvas', () => {
    // mock
    const idA = addLineNode(1000, 500, 1100, 500);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    renderHoverHighlight(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 1000, 500));
    expect(canvasRef.current?.className).toContain('positioning');

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointerleave', 1000, 500));

    // result
    expect(canvasRef.current?.className).not.toContain('positioning');
  });

  it('should not apply the positioning cursor class over a line endpoint that is not selected', () => {
    // mock
    addLineNode(1200, 500, 1300, 500);

    const canvasRef = createCanvasRef();

    // before
    renderHoverHighlight(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 1200, 500));

    // result
    expect(canvasRef.current?.className).not.toContain('positioning');
  });

  it("should clear the hovered node id and the positioning class when hovering a selected node's resize handle", () => {
    // mock
    const idA = addFrameNode(2000, 2000, 100);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    // action — exactly on the "nw" corner handle of the selected node
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2000, 2000));

    // result
    expect(hoverRef.current).toBeNull();
    expect(canvasRef.current?.className).not.toContain('positioning');
  });

  it('should use the scale cursor (not the resize cursor) over a resize handle when the Scale tool is active', () => {
    // mock
    const idA = addFrameNode(2100, 2100, 100);

    store.dispatch(setSelection([idA]));
    store.dispatch(setActiveTool(ToolName.scale));

    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    // action — exactly on the "nw" corner handle of the selected node
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2100, 2100));

    // result — same hover/positioning behavior as the default tool, just via the scale cursor branch
    expect(hoverRef.current).toBeNull();
    expect(canvasRef.current?.className).not.toContain('positioning');
  });

  it("should clear the hovered node id and the positioning class in the rotate ring just outside a selected node's resize handle", () => {
    // mock — the "nw" corner sits at (3000, 3000); the rotate ring starts just past the resize
    const idA = addFrameNode(3000, 3000, 100);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    // action — 10 world units above the corner, inside the rotate ring but outside the resize radius
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 3000, 2990));

    // result
    expect(hoverRef.current).toBeNull();
    expect(canvasRef.current?.className).not.toContain('positioning');
  });

  it("should apply the positioning cursor class when hovering a selected path-text node's start-offset handle", () => {
    // mock — a 200x200 path-text box at (4000, 4000); the offset-0 handle sits at its rightmost edge (4200, 4100)
    const idA = addPathTextNode(4000, 4000, 200);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4200, 4100));

    // result
    expect(canvasRef.current?.className).toContain('positioning');
    expect(hoverRef.current).toBe(idA);
  });

  it("should not show the resize cursor over a selected node's resize handle while it is being edited", () => {
    // mock — the node stays selected during its own edit session, but its handles must not be live
    const idA = addFrameNode(2200, 2200, 100);

    store.dispatch(setSelection([idA]));
    store.dispatch(
      startTextEdit({
        box: { flipX: false, flipY: false, height: 100, rotation: 0, width: 100, x: 2200, y: 2200 },
        content: 'Hi',
        id: idA,
      }),
    );

    const canvasRef = createCanvasRef();

    // before
    renderHoverHighlight(canvasRef);

    // action — exactly on the "nw" corner handle of the node being edited
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2200, 2200));

    // result — no resize cursor, falls through to the plain node-hover branch instead
    expect(canvasRef.current?.style.cursor).toBe('');
    expect(canvasRef.current?.className).not.toContain('positioning');
  });

  it("should not show the rotate cursor in a selected node's rotate ring while it is being edited", () => {
    // mock — the "nw" corner sits at (2300, 2300); the rotate ring starts just past the resize
    const idA = addFrameNode(2300, 2300, 100);

    store.dispatch(setSelection([idA]));
    store.dispatch(
      startTextEdit({
        box: { flipX: false, flipY: false, height: 100, rotation: 0, width: 100, x: 2300, y: 2300 },
        content: 'Hi',
        id: idA,
      }),
    );

    const canvasRef = createCanvasRef();

    // before
    renderHoverHighlight(canvasRef);

    // action — inside the rotate ring but outside the resize radius
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2300, 2290));

    // result — no rotate cursor, falls through to the plain node-hover branch instead
    expect(canvasRef.current?.style.cursor).toBe('');
  });

  it("should still apply the positioning cursor over a path-text node's start-offset handle while it is being edited", () => {
    // mock — a 200x200 path-text box at (4300, 4300); the offset-0 handle sits at its rightmost
    const idA = addPathTextNode(4300, 4300, 200);

    store.dispatch(setSelection([idA]));
    store.dispatch(
      startTextEdit({
        box: {
          flipX: false,
          flipY: false,
          height: 200,
          pathId: 'ellipse-1',
          pathStartOffset: 0,
          rotation: 0,
          width: 200,
          x: 4300,
          y: 4300,
        },
        content: 'Hi',
        id: idA,
      }),
    );

    const canvasRef = createCanvasRef();

    // before
    const hoverRef = renderHoverHighlight(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4500, 4400));

    // result
    expect(canvasRef.current?.className).toContain('positioning');
    expect(hoverRef.current).toBe(idA);
  });
});
