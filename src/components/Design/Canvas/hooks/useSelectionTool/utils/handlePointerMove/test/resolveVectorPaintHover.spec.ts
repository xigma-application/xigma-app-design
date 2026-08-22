// store
import { addNode, setActiveTool, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorPaintHover } from '../resolveVectorPaintHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, buttons = 0): PointerEvent =>
  new PointerEvent('pointermove', { buttons, clientX: x, clientY: y });

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

describe('resolveVectorPaintHover', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should clear the hovered face ref and leave the cursor className untouched when Paint is not the active tool', () => {
    // mock
    const nodeId = addTriangleVectorNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorPaintHover(canvas, pointerEvent(50, 40), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorPaintFaceKeyRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the hovered face ref when no node is in Vector Edit Mode', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.paint));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorPaintHover(canvas, pointerEvent(50, 40), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorPaintFaceKeyRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the hovered face ref while a pointer button is held', () => {
    // mock
    const nodeId = addTriangleVectorNode();
    store.dispatch(setActiveTool(ToolName.paint));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorPaintHover(canvas, pointerEvent(50, 40, 1), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorPaintFaceKeyRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it("should set the hovered face key and the 'paint-add' cursor when hovering an unfilled face", () => {
    // mock
    const nodeId = addTriangleVectorNode();
    store.dispatch(setActiveTool(ToolName.paint));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorPaintHover(canvas, pointerEvent(50, 40), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorPaintFaceKeyRef.current).toEqual({ faceKey: 's1,s2,s3', isFilled: false, nodeId });
    expect(setClassName).toHaveBeenCalledWith('paint-add');
  });

  it("should set the 'paint-remove' cursor when hovering an already-filled face", () => {
    // mock
    const nodeId = addTriangleVectorNode();
    store.dispatch(updateNode({ changes: { filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'] }, id: nodeId }));
    store.dispatch(setActiveTool(ToolName.paint));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorPaintHover(canvas, pointerEvent(50, 40), canvasRefs, setClassName);

    // result
    expect(setClassName).toHaveBeenCalledWith('paint-remove');
  });

  it('should hover a face on the second of several open nodes, not just the first', () => {
    // mock — two open nodes, the pointer sits over the second one's face
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
    store.dispatch(setActiveTool(ToolName.paint));
    store.dispatch(setVectorEditingNodeIds([firstNodeId, secondNodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before — inside the second node's face, far from the first node's face
    resolveVectorPaintHover(canvas, pointerEvent(550, 540), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorPaintFaceKeyRef.current).toEqual({ faceKey: 's1,s2,s3', isFilled: false, nodeId: secondNodeId });
    expect(setClassName).toHaveBeenCalledWith('paint-add');
  });

  it("should fall back to the idle 'paint' cursor and a null hovered face key when the pointer misses every face", () => {
    // mock
    const nodeId = addTriangleVectorNode();
    store.dispatch(setActiveTool(ToolName.paint));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    resolveVectorPaintHover(canvas, pointerEvent(500, 500), canvasRefs, setClassName);

    // result
    expect(canvasRefs.hoveredVectorPaintFaceKeyRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('paint');
  });
});
