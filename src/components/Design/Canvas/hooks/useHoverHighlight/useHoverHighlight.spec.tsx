import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// core
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useClassNames } from 'components/Design/core/ClassNamesProvider/hooks/useClassNames';
import { useHoverHighlight } from './useHoverHighlight';

// store
import { addNode, groupNodes, setActiveTool, setSelection, startTextEdit, stopTextEdit } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TDistanceGuides } from '../../utils/getDistanceGuides/types';

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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#ffffff', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectangleNode = (x: number, y: number, size: number, cornerRadius: number): string => {
  store.dispatch(
    addNode({
      cornerRadius,
      fill: '#ff0000',
      height: size,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addPolygonNode = (x: number, y: number, size: number, sides: number, cornerRadius: number): string => {
  store.dispatch(
    addNode({
      cornerRadius,
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: size,
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides,
      type: NodeType.polygon,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addStarNode = (x: number, y: number, size: number, points: number, ratio: number, cornerRadius: number): string => {
  store.dispatch(
    addNode({
      cornerRadius,
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: size,
      name: 'Star',
      parentId: null,
      points,
      ratio,
      rotation: 0,
      type: NodeType.star,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addEllipseNode = (x: number, y: number, size: number, arcStartAngle?: number, arcEndAngle?: number, arcRatio?: number): string => {
  store.dispatch(
    addNode({
      arcEndAngle,
      arcRatio,
      arcStartAngle,
      fill: '#ff0000',
      height: size,
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const renderHoverHighlight = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
): { classNameRef: RefObject<string | null>; distanceGuidesRef: RefObject<TDistanceGuides | null>; hoverRef: RefObject<string | null> } => {
  const hoverRef: RefObject<string | null> = { current: null };
  const classNameRef: RefObject<string | null> = { current: null };
  const distanceGuidesRef: RefObject<TDistanceGuides | null> = { current: null };

  renderHook(
    () => {
      useHoverHighlight(createCanvasRefs({ canvasRef, hover: { hoverRef }, transform: { distanceGuidesRef } }));
      classNameRef.current = useClassNames().className;
    },
    {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <ClassNamesProvider>{children}</ClassNamesProvider>
        </Provider>
      ),
    },
  );

  return { classNameRef, distanceGuidesRef, hoverRef };
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
    const { hoverRef } = renderHoverHighlight(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5, 5));

    // result
    expect(hoverRef.current).toBeNull();
    expect(idA).toBeTruthy();
  });

  it('should still show a hover outline over a node while the Comment tool is active', () => {
    // mock
    const idA = addFrameNode(150, 150);

    store.dispatch(setActiveTool(ToolName.comment));

    const canvasRef = createCanvasRef();

    // before
    const { hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 160, 160));
    });

    // result
    expect(hoverRef.current).toBe(idA);
  });

  it('should not reset the comment cursor class when hovering over a node under the Comment tool', () => {
    // mock — the plain-node-hover fallback would normally null the cursor class out
    addFrameNode(170, 170);

    store.dispatch(setActiveTool(ToolName.comment));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 175, 175));
    });

    // result
    expect(classNameRef.current).toBe('comment');
  });

  it('should keep the comment cursor class when the pointer leaves the canvas under the Comment tool', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.comment));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef } = renderHoverHighlight(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5, 5));
    });
    expect(classNameRef.current).toBe('comment');

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerleave', 5, 5));
    });

    // result
    expect(classNameRef.current).toBe('comment');
  });

  it('should set the hovered node id when the pointer moves over a node', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvasRef = createCanvasRef();

    // before
    const { hoverRef } = renderHoverHighlight(canvasRef);

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
    const { hoverRef } = renderHoverHighlight(canvasRef);

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
    const { hoverRef } = renderHoverHighlight(canvasRef);

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
    const { hoverRef } = renderHoverHighlight(canvasRef);

    // action
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 405, 405, { buttons: 1 }));

    // result
    expect(hoverRef.current).toBeNull();
  });

  it('should re-evaluate hover on pointerup at the current position, even without a following pointermove', () => {
    // mock — a drag (e.g. dragging a corner-radius handle) ends away from the shape that was
    // hovered before the drag started; without moving the mouse again afterward, hover must not
    // stay stuck on that shape
    const idA = addFrameNode(400, 400);
    const canvasRef = createCanvasRef();
    const { hoverRef } = renderHoverHighlight(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 405, 405));
    expect(hoverRef.current).toBe(idA);

    // action — dragging away (ignored, button held), then releasing at that same far position
    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 900, 900, { buttons: 1 }));
    expect(hoverRef.current).toBe(idA); // still frozen mid-drag

    canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 900, 900));

    // result
    expect(hoverRef.current).toBeNull();
  });

  it('should re-evaluate the hovered group into its individual child as soon as Control is pressed, without a new pointermove', () => {
    // mock
    const idA = addFrameNode(600, 600);
    const idB = addFrameNode(700, 600);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    store.dispatch(setSelection([]));

    const canvasRef = createCanvasRef();
    const { hoverRef } = renderHoverHighlight(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 610, 610));
    expect(hoverRef.current).not.toBe(idA);

    // action
    window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'Control' }));

    // result
    expect(hoverRef.current).toBe(idA);
  });

  it('should re-evaluate the hovered child back to its group as soon as Control is released, without a new pointermove', () => {
    // mock
    const idA = addFrameNode(800, 600);
    const idB = addFrameNode(900, 600);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    store.dispatch(setSelection([]));

    const canvasRef = createCanvasRef();
    const { hoverRef } = renderHoverHighlight(canvasRef);

    canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 810, 610, { ctrlKey: true }));
    expect(hoverRef.current).toBe(idA);

    // action
    window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control' }));

    // result
    expect(hoverRef.current).not.toBe(idA);
  });

  it('should ignore an unrelated key press and do nothing before the pointer has ever moved over the canvas', () => {
    // mock
    addFrameNode(1000, 600);

    const canvasRef = createCanvasRef();
    const { hoverRef } = renderHoverHighlight(canvasRef);

    // action
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'Control' }));

    // result
    expect(hoverRef.current).toBeNull();
  });

  it("should apply the positioning cursor class when hovering a selected line's endpoint", () => {
    // mock
    const idA = addLineNode(500, 500, 600, 500);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 500, 500));
    });

    // result
    expect(classNameRef.current).toBe('positioning');
    expect(hoverRef.current).toBe(idA);
  });

  it('should remove the positioning cursor class when the pointer moves off a line endpoint', () => {
    // mock
    const idA = addLineNode(700, 500, 800, 500);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef } = renderHoverHighlight(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 700, 500));
    });
    expect(classNameRef.current).toBe('positioning');

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 900, 900));
    });

    // result
    expect(classNameRef.current).not.toBe('positioning');
  });

  it('should remove the positioning cursor class when the pointer leaves the canvas', () => {
    // mock
    const idA = addLineNode(1000, 500, 1100, 500);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef } = renderHoverHighlight(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 1000, 500));
    });
    expect(classNameRef.current).toBe('positioning');

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerleave', 1000, 500));
    });

    // result
    expect(classNameRef.current).not.toBe('positioning');
  });

  it('should not apply the positioning cursor class over a line endpoint that is not selected', () => {
    // mock
    addLineNode(1200, 500, 1300, 500);

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 1200, 500));
    });

    // result
    expect(classNameRef.current).not.toBe('positioning');
  });

  it("should clear the hovered node id and the positioning class when hovering a selected node's resize handle", () => {
    // mock
    const idA = addFrameNode(2000, 2000, 100);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action — exactly on the "nw" corner handle of the selected node
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2000, 2000));
    });

    // result
    expect(hoverRef.current).toBeNull();
    expect(classNameRef.current).not.toBe('positioning');
  });

  it('should use the scale cursor (not the resize cursor) over a resize handle when the Scale tool is active', () => {
    // mock
    const idA = addFrameNode(2100, 2100, 100);

    store.dispatch(setSelection([idA]));
    store.dispatch(setActiveTool(ToolName.scale));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action — exactly on the "nw" corner handle of the selected node
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2100, 2100));
    });

    // result — same hover/positioning behavior as the default tool, just via the scale cursor branch
    expect(hoverRef.current).toBeNull();
    expect(classNameRef.current).not.toBe('positioning');
  });

  it("should clear the hovered node id and the positioning class in the rotate ring just outside a selected node's resize handle", () => {
    // mock — the "nw" corner sits at (3000, 3000); the rotate ring starts just past the resize
    const idA = addFrameNode(3000, 3000, 100);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action — 10 world units above the corner, inside the rotate ring but outside the resize radius
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 3000, 2990));
    });

    // result
    expect(hoverRef.current).toBeNull();
    expect(classNameRef.current).not.toBe('positioning');
  });

  it("should apply the radius cursor class and keep the node's own id hovered over a selected rectangle's corner-radius handle", () => {
    // mock — a 100x100 rectangle with cornerRadius 20 has its ne handle at (5100, 5020)
    const idA = addRectangleNode(5000, 5000, 100, 20);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5080, 5020));
    });

    // result — the handle stays visible (hoverRef keeps the node's own id) while it's being hovered
    expect(classNameRef.current).toBe('radius');
    expect(hoverRef.current).toBe(idA);
  });

  it("should apply the radius cursor class and keep the node's own id hovered over a selected polygon's corner-radius handle", () => {
    // mock — top vertex of a 100x100 triangle at (5200, 5000) sits at (5250, 5000); radius 15 moves
    const idA = addPolygonNode(5200, 5000, 100, 3, 15);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5250, 5030));
    });

    // result — the handle stays visible (hoverRef keeps the node's own id) while it's being hovered
    expect(classNameRef.current).toBe('radius');
    expect(hoverRef.current).toBe(idA);
  });

  it("should apply the radius cursor class and keep the node's own id hovered over a selected star's corner-radius handle", () => {
    // mock — top vertex of a 100x100 5-point star at (5300, 5000) sits at (5350, 5000); radius 15
    const idA = addStarNode(5300, 5000, 100, 5, 0.5, 15);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5350, 5033.893272));
    });

    // result — the handle stays visible (hoverRef keeps the node's own id) while it's being hovered
    expect(classNameRef.current).toBe('radius');
    expect(hoverRef.current).toBe(idA);
  });

  it("should apply the vertices cursor class and keep the node's own id hovered over a selected polygon's vertex-count handle", () => {
    // mock — vertex index 1 of a 100x100 triangle at (5400, 5000) sits at (5493.301270, 5075)
    const idA = addPolygonNode(5400, 5000, 100, 3, 0);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5493.30127, 5075));
    });

    // result — the handle stays visible (hoverRef keeps the node's own id) while it's being hovered
    expect(classNameRef.current).toBe('vertices');
    expect(hoverRef.current).toBe(idA);
  });

  it("should apply the vertices cursor class and keep the node's own id hovered over a selected star's vertex-count handle", () => {
    // mock — vertex index 2 of a 100x100 5-point star at (5500, 5000) sits at (5597.552826, 5034.549150)
    const idA = addStarNode(5500, 5000, 100, 5, 0.5, 0);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5597.552826, 5034.54915));
    });

    // result — the handle stays visible (hoverRef keeps the node's own id) while it's being hovered
    expect(classNameRef.current).toBe('vertices');
    expect(hoverRef.current).toBe(idA);
  });

  it("should apply the radius cursor class and keep the node's own id hovered over a selected ellipse's Sweep handle", () => {
    // mock — a 100x100 ellipse at (5800, 5000), center (5850, 5050); default arcEndAngle (90°) puts
    // the Sweep handle at the east rim (5900, 5050)
    const idA = addEllipseNode(5800, 5000, 100);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5900, 5050));
    });

    // result — the handle stays visible (hoverRef keeps the node's own id) while it's being hovered
    expect(classNameRef.current).toBe('radius');
    expect(hoverRef.current).toBe(idA);
  });

  it("should apply the radius cursor class and keep the node's own id hovered over a selected ellipse's Start (rotate) handle", () => {
    // mock — a 100x100 ellipse at (6000, 5000), center (6050, 5050), cut from the default
    // arcStartAngle (90°) to arcEndAngle 0°; the Start handle stays at its own east rim (6100, 5050)
    const idA = addEllipseNode(6000, 5000, 100, 90, 0);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 6100, 5050));
    });

    // result — the handle stays visible (hoverRef keeps the node's own id) while it's being hovered
    expect(classNameRef.current).toBe('radius');
    expect(hoverRef.current).toBe(idA);
  });

  it("should apply the radius cursor class and keep the node's own id hovered over a selected ellipse's Ratio handle", () => {
    // mock — a 100x100 ellipse at (6200, 5000); the Ratio handle rests at dead center (6250, 5050)
    // while arcRatio is 0, even on an uncut ellipse
    const idA = addEllipseNode(6200, 5000, 100);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 6250, 5050));
    });

    // result — the handle stays visible (hoverRef keeps the node's own id) while it's being hovered
    expect(classNameRef.current).toBe('radius');
    expect(hoverRef.current).toBe(idA);
  });

  it('should give a 4-sided polygon vertex-count handle priority over the coincident resize handle at the same point', () => {
    // mock — vertex index 1 of a 100x100 4-sided polygon at (5600, 5000) sits at (5700, 5050), exactly
    // the same point as the bounding box's own "e" (east edge midpoint) resize handle
    const idA = addPolygonNode(5600, 5000, 100, 4, 0);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5700, 5050));
    });

    // result — the vertex-count handle wins over the resize cursor/hover-clearing behavior
    expect(classNameRef.current).toBe('vertices');
    expect(hoverRef.current).toBe(idA);
  });

  it("should apply the hand cursor class when hovering a selected path-text node's start-offset handle", () => {
    // mock — a 200x200 path-text box at (4000, 4000); the offset-0 handle sits at its rightmost edge (4200, 4100)
    const idA = addPathTextNode(4000, 4000, 200);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4200, 4100));
    });

    // result
    expect(classNameRef.current).toBe('hand');
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
    const { classNameRef } = renderHoverHighlight(canvasRef);

    // action — exactly on the "nw" corner handle of the node being edited
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 2200, 2200));
    });

    // result — no resize cursor; the point lands on the editing text itself, so it gets the text
    expect(canvasRef.current?.style.cursor).toBe('text');
    expect(classNameRef.current).not.toBe('positioning');
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

  it("should still apply the hand cursor over a path-text node's start-offset handle while it is being edited", () => {
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
    const { classNameRef, hoverRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4500, 4400));
    });

    // result
    expect(classNameRef.current).toBe('hand');
    expect(hoverRef.current).toBe(idA);
  });

  it('should show the text (I-beam) cursor when hovering the content of a straight-text box currently being edited', () => {
    // mock — a freshly-drawn, uncommitted straight-text box
    store.dispatch(
      startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 200, x: 5000, y: 5000 }, content: 'Hello' }),
    );

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef } = renderHoverHighlight(canvasRef);

    // action — over the rendered "H"
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 5005, 5010));
    });

    // result
    expect(canvasRef.current?.style.cursor).toBe('text');
    expect(classNameRef.current).toBeNull();
  });

  it('should show the text (I-beam) cursor when hovering the content of a path-text box currently being edited', () => {
    // mock — a 200x200 circle at (4300,4300)-(4500,4500); "Hi" starts at the rightmost point
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
      }),
    );

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 4493, 4405));
    });

    // result
    expect(canvasRef.current?.style.cursor).toBe('text');
    expect(classNameRef.current).toBeNull();
  });

  it('should show distance guides and the shadow-cursor class when Alt-hovering another node while one is selected', () => {
    // mock
    const idA = addFrameNode(7000, 7000);
    const idB = addFrameNode(7100, 7000);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { classNameRef, distanceGuidesRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 7110, 7010, { altKey: true }));
    });

    // result
    expect(classNameRef.current).toBe('distance-measure');
    expect(distanceGuidesRef.current).not.toBeNull();
    expect(idB).toBeTruthy();
  });

  it('should clear distance guides when Alt is not held', () => {
    // mock
    const idA = addFrameNode(7200, 7000);

    addFrameNode(7300, 7000);
    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { distanceGuidesRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 7310, 7010));
    });

    // result
    expect(distanceGuidesRef.current).toBeNull();
  });

  it('should not show distance guides when Alt-hovering the already-selected node itself', () => {
    // mock
    const idA = addFrameNode(7400, 7000);

    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { distanceGuidesRef } = renderHoverHighlight(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 7410, 7010, { altKey: true }));
    });

    // result
    expect(distanceGuidesRef.current).toBeNull();
  });

  it('should clear distance guides when the pointer leaves the canvas', () => {
    // mock
    const idA = addFrameNode(7500, 7000);

    addFrameNode(7600, 7000);
    store.dispatch(setSelection([idA]));

    const canvasRef = createCanvasRef();

    // before
    const { distanceGuidesRef } = renderHoverHighlight(canvasRef);

    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 7610, 7010, { altKey: true }));
    });
    expect(distanceGuidesRef.current).not.toBeNull();

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerleave', 7610, 7010));
    });

    // result
    expect(distanceGuidesRef.current).toBeNull();
  });
});
