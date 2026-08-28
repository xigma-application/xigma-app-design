// store
import { addNode, setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorCutHover } from '../resolveVectorCutHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, buttons = 0): PointerEvent =>
  new PointerEvent('pointermove', { buttons, clientX: x, clientY: y });

const addSegmentVectorNode = (): string => {
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

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorCutHover', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should clear both hover refs and leave the cursor untouched when Cut is not the active tool', () => {
    // mock
    const nodeId = addSegmentVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorCutHover(canvas, pointerEvent(20, 0), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hover.hoveredVectorCutSegmentRef.current).toBeNull();
    expect(canvasRefs.hover.hoveredVectorCutPointRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear both hover refs and leave the cursor untouched while a button is held (an active cut drag already owns the preview)', () => {
    // mock
    const nodeId = addSegmentVectorNode();
    store.dispatch(setActiveTool(ToolName.cut));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.hover.hoveredVectorCutSegmentRef.current = { nodeId, segmentId: 's1' };
    canvasRefs.hover.hoveredVectorCutPointRef.current = { x: 20, y: 0 };

    // before
    resolveVectorCutHover(canvas, pointerEvent(20, 0, 1), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hover.hoveredVectorCutSegmentRef.current).toBeNull();
    expect(canvasRefs.hover.hoveredVectorCutPointRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should set the "cut-off" cursor and the exact (non-snapped) hovered point when hovering a segment away from its midpoint', () => {
    // mock — segment a(0,0)-b(100,0), hovered well away from its midpoint (50,0)
    const nodeId = addSegmentVectorNode();
    store.dispatch(setActiveTool(ToolName.cut));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorCutHover(canvas, pointerEvent(20, 0), canvasRefs, setClassName);

    // result
    expect(setClassName).toHaveBeenCalledWith('cut-off');
    expect(canvasRefs.hover.hoveredVectorCutSegmentRef.current).toEqual({ nodeId, segmentId: 's1' });
    expect(canvasRefs.hover.hoveredVectorCutPointRef.current).toEqual({ x: 20, y: 0 });
  });

  it('should snap the hovered point to the segment’s exact midpoint when the cursor lands within its snap tolerance', () => {
    // mock — hovering at (49,0), 1px off the true midpoint (50,0)
    const nodeId = addSegmentVectorNode();
    store.dispatch(setActiveTool(ToolName.cut));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorCutHover(canvas, pointerEvent(49, 0), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hover.hoveredVectorCutPointRef.current).toEqual({ x: 50, y: 0 });
  });

  it('should clear both hover refs but still set the "cut-off" cursor when the pointer misses every segment', () => {
    // mock
    const nodeId = addSegmentVectorNode();
    store.dispatch(setActiveTool(ToolName.cut));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorCutHover(canvas, pointerEvent(900, 900), canvasRefs, setClassName);

    // result
    expect(setClassName).toHaveBeenCalledWith('cut-off');
    expect(canvasRefs.hover.hoveredVectorCutSegmentRef.current).toBeNull();
    expect(canvasRefs.hover.hoveredVectorCutPointRef.current).toBeNull();
  });
});
