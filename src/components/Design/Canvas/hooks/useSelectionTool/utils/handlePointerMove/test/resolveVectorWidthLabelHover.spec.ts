// store
import { addNode, setActiveTool, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorWidthLabelHover } from '../resolveVectorWidthLabelHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, buttons = 0): PointerEvent =>
  new PointerEvent('pointermove', { buttons, clientX: x, clientY: y });

const addSelectedWidthPointNode = (): string => {
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
  const nodeId = rootOrder[rootOrder.length - 1];

  store.dispatch(
    updateNode({
      changes: { widthProfile: { points: { p1: { id: 'p1', leftOffset: 6, position: 0.2, rightOffset: 6 } } } },
      id: nodeId,
    }),
  );

  return nodeId;
};

describe('resolveVectorWidthLabelHover', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should clear the hovered-label ref when Variable Width is not the active tool', () => {
    // mock
    const nodeId = addSelectedWidthPointNode();
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvasRefs = createCanvasRefs();
    canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId, pointId: 'p1', side: 'right' }];

    // before
    resolveVectorWidthLabelHover(createCanvas(), pointerEvent(20, -34), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthLabelRef.current).toBeNull();
  });

  it('should clear the hovered-label ref while a pointer button is held', () => {
    // mock
    const nodeId = addSelectedWidthPointNode();
    store.dispatch(setActiveTool(ToolName.variableWidth));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvasRefs = createCanvasRefs();
    canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId, pointId: 'p1', side: 'right' }];

    // before
    resolveVectorWidthLabelHover(createCanvas(), pointerEvent(20, -34, 1), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthLabelRef.current).toBeNull();
  });

  it('should set the hovered-label ref when the pointer sits over the selected width point’s value label', () => {
    // mock — anchor (20,0), right handle (20,-6), label centre 28px further along -normal at (20,-34)
    const nodeId = addSelectedWidthPointNode();
    store.dispatch(setActiveTool(ToolName.variableWidth));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvasRefs = createCanvasRefs();
    canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId, pointId: 'p1', side: 'right' }];

    // before
    resolveVectorWidthLabelHover(createCanvas(), pointerEvent(20, -34), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthLabelRef.current?.nodeId).toBe(nodeId);
    expect(canvasRefs.hover.hoveredVectorWidthLabelRef.current?.segmentId).toBe('s1');
    expect(canvasRefs.hover.hoveredVectorWidthLabelRef.current?.t).toBeCloseTo(0.2, 5);
  });

  it('should clear the hovered-label ref when the pointer misses the label', () => {
    // mock
    const nodeId = addSelectedWidthPointNode();
    store.dispatch(setActiveTool(ToolName.variableWidth));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvasRefs = createCanvasRefs();
    canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [{ nodeId, pointId: 'p1', side: 'right' }];

    // before — far from the label
    resolveVectorWidthLabelHover(createCanvas(), pointerEvent(20, 200), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthLabelRef.current).toBeNull();
  });

  it('should clear the hovered-label ref when no width handle is selected, so no label is on screen', () => {
    // mock
    const nodeId = addSelectedWidthPointNode();
    store.dispatch(setActiveTool(ToolName.variableWidth));
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    const canvasRefs = createCanvasRefs();

    // before
    resolveVectorWidthLabelHover(createCanvas(), pointerEvent(20, -34), canvasRefs);

    // result
    expect(canvasRefs.hover.hoveredVectorWidthLabelRef.current).toBeNull();
  });
});
