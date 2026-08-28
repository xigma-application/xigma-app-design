// store
import { addNode, setActiveTool, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorWidthPointHover } from '../resolveVectorWidthPointHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, buttons = 0): PointerEvent =>
  new PointerEvent('pointermove', { buttons, clientX: x, clientY: y });

const addLineVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorWidthPointHover', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should clear the hovered ref and leave the cursor untouched when Variable Width is not the active tool', () => {
    // mock
    const nodeId = addLineVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorWidthPointHover(canvas, pointerEvent(50, 0), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the hovered ref when no node is in Vector Edit Mode', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.variableWidth));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorWidthPointHover(canvas, pointerEvent(50, 0), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the hovered ref and leave the cursor untouched while a pointer button is held', () => {
    // mock
    const nodeId = addLineVectorNode();
    store.dispatch(setActiveTool(ToolName.variableWidth));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorWidthPointHover(canvas, pointerEvent(50, 0, 1), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should hover the stroke and set the controller cursor when the pointer sits on the path', () => {
    // mock
    const nodeId = addLineVectorNode();
    store.dispatch(setActiveTool(ToolName.variableWidth));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorWidthPointHover(canvas, pointerEvent(50, 0), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current).toEqual({ nodeId, segmentId: 's1', t: 0.5 });
    expect(setClassName).toHaveBeenCalledWith('controller');
  });

  it('should hover an existing width-point marker in preference to the bare stroke', () => {
    // mock
    const nodeId = addLineVectorNode();

    store.dispatch(
      updateNode({
        changes: { widthProfile: { points: { p1: { id: 'p1', leftOffset: 6, position: 0.2, rightOffset: 6 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setActiveTool(ToolName.variableWidth));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before — clicking right on the marker at (20, 0)
    resolveVectorWidthPointHover(canvas, pointerEvent(20, 0), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current?.nodeId).toBe(nodeId);
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current?.segmentId).toBe('s1');
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current?.t).toBeCloseTo(0.2, 5);
    expect(setClassName).toHaveBeenCalledWith('controller');
  });

  it('should hover a width-point handle diamond with a resize cursor instead of the controller class', () => {
    // mock — width point at fraction 0.2 of a(0,0)->b(100,0), i.e. anchor (20,0); its left handle
    // sits 6px along the segment's normal (0,1) at (20,6)
    const nodeId = addLineVectorNode();

    store.dispatch(
      updateNode({
        changes: { widthProfile: { points: { p1: { id: 'p1', leftOffset: 6, position: 0.2, rightOffset: 6 } } } },
        id: nodeId,
      }),
    );
    store.dispatch(setActiveTool(ToolName.variableWidth));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before — clicking right on the left handle at (20, 6)
    resolveVectorWidthPointHover(canvas, pointerEvent(20, 6), canvasRefs, setClassName);

    // result — resize-style cursor, not the plain controller class
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current?.nodeId).toBe(nodeId);
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current?.segmentId).toBe('s1');
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current?.t).toBeCloseTo(0.2, 5);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should clear the hovered ref and reset the cursor to null when the pointer misses the stroke and every marker', () => {
    // mock
    const nodeId = addLineVectorNode();
    store.dispatch(setActiveTool(ToolName.variableWidth));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorWidthPointHover(canvas, pointerEvent(500, 500), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthPointRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
