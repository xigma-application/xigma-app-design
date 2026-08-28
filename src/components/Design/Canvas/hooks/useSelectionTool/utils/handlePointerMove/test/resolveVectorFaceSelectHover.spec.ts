// store
import { addNode, setActiveTool, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorFaceSelectHover } from '../resolveVectorFaceSelectHover';

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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorFaceSelectHover', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should clear the hovered face ref when Move is not the active tool', () => {
    // mock
    const nodeId = addTriangleVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    resolveVectorFaceSelectHover(canvas, pointerEvent(50, 40), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorFaceSelectRef.current).toBeNull();
  });

  it('should clear the hovered face ref when no node is in Vector Edit Mode', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.move));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    resolveVectorFaceSelectHover(canvas, pointerEvent(50, 40), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorFaceSelectRef.current).toBeNull();
  });

  it('should clear the hovered face ref while a pointer button is held', () => {
    // mock
    const nodeId = addTriangleVectorNode();

    store.dispatch(setActiveTool(ToolName.move));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(updateNode({ changes: { filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'] }, id: nodeId }));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    resolveVectorFaceSelectHover(canvas, pointerEvent(50, 40, 1), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorFaceSelectRef.current).toBeNull();
  });

  it('should set the hovered face when hovering a face that has no fill', () => {
    // mock
    const nodeId = addTriangleVectorNode();

    store.dispatch(setActiveTool(ToolName.move));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    resolveVectorFaceSelectHover(canvas, pointerEvent(50, 40), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorFaceSelectRef.current).toEqual({ faceKey: 's1,s2,s3', nodeId });
  });

  it('should set the hovered face when hovering an already-filled face', () => {
    // mock
    const nodeId = addTriangleVectorNode();

    store.dispatch(setActiveTool(ToolName.move));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(updateNode({ changes: { filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'] }, id: nodeId }));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    resolveVectorFaceSelectHover(canvas, pointerEvent(50, 40), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorFaceSelectRef.current).toEqual({ faceKey: 's1,s2,s3', nodeId });
  });

  it('should clear the hovered face ref when the pointer misses every face', () => {
    // mock
    const nodeId = addTriangleVectorNode();

    store.dispatch(setActiveTool(ToolName.move));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(updateNode({ changes: { filledFaceKeys: ['s1[v:v1|v:v2],s2[v:v2|v:v3],s3[v:v1|v:v3]'] }, id: nodeId }));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    // before
    resolveVectorFaceSelectHover(canvas, pointerEvent(500, 500), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorFaceSelectRef.current).toBeNull();
  });
});
