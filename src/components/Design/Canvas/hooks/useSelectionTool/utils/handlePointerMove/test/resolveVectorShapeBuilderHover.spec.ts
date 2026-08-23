// store
import { addNode, setActiveTool, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorShapeBuilderHover } from '../resolveVectorShapeBuilderHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, buttons = 0, altKey = false): PointerEvent =>
  new PointerEvent('pointermove', { altKey, buttons, clientX: x, clientY: y });

const addTriangleVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: '#000000',
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 50, y: 100 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorShapeBuilderHover', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should clear the hovered face ref and leave the cursor untouched when Shape Builder is not the active tool', () => {
    // mock
    const nodeId = addTriangleVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorShapeBuilderHover(canvas, pointerEvent(50, 40), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorShapeBuilderFaceRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the hovered face ref when no node is in Vector Edit Mode', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.shapeBuilder));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorShapeBuilderHover(canvas, pointerEvent(50, 40), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorShapeBuilderFaceRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the hovered face ref while a pointer button is held (an active drag drives its own preview)', () => {
    // mock
    const nodeId = addTriangleVectorNode();
    store.dispatch(setActiveTool(ToolName.shapeBuilder));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorShapeBuilderHover(canvas, pointerEvent(50, 40, 1), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorShapeBuilderFaceRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it("should set the hovered face key and re-assert the 'add' cursor when the pointer sits over a face", () => {
    // mock — an earlier resolver in the idle-hover chain (e.g. segment hover) may have already reset
    // the cursor className this frame; this resolver runs last and must win regardless of a hit/miss
    const nodeId = addTriangleVectorNode();
    store.dispatch(setActiveTool(ToolName.shapeBuilder));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorShapeBuilderHover(canvas, pointerEvent(50, 40), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorShapeBuilderFaceRef.current).toEqual({ faceKey: 's1,s2,s3', nodeId });
    expect(setClassName).toHaveBeenCalledWith('add');
  });

  it("should record subtract mode and set the 'remove' cursor from alt held while hovering, before any drag has started", () => {
    // mock
    const nodeId = addTriangleVectorNode();
    store.dispatch(setActiveTool(ToolName.shapeBuilder));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorShapeBuilderHover(canvas, pointerEvent(50, 40, 0, true), canvasRefs, setClassName);

    // result
    expect(canvasRefs.isVectorShapeBuilderSubtractRef.current).toBe(true);
    expect(setClassName).toHaveBeenCalledWith('remove');
  });

  it('should hover a face on the second of several open nodes, not just the first', () => {
    // mock
    const firstNodeId = addTriangleVectorNode();
    const secondNodeId = addTriangleVectorNode();

    store.dispatch(
      updateNode({
        changes: {
          segments: {
            s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
            s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
            s3: { endId: 'v1', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
          },
          vertices: { v1: { id: 'v1', x: 500, y: 500 }, v2: { id: 'v2', x: 600, y: 500 }, v3: { id: 'v3', x: 550, y: 600 } },
        },
        id: secondNodeId,
      }),
    );
    store.dispatch(setActiveTool(ToolName.shapeBuilder));
    store.dispatch(setVectorEditingNodeIds([firstNodeId, secondNodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorShapeBuilderHover(canvas, pointerEvent(550, 540), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorShapeBuilderFaceRef.current).toEqual({ faceKey: 's1,s2,s3', nodeId: secondNodeId });
  });

  it("should clear the hovered face ref but still re-assert the 'add' cursor when the pointer misses every face", () => {
    // mock
    const nodeId = addTriangleVectorNode();
    store.dispatch(setActiveTool(ToolName.shapeBuilder));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorShapeBuilderHover(canvas, pointerEvent(500, 500), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorShapeBuilderFaceRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('add');
  });
});
