// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { armVectorGroupDrag } from '../armVectorGroupDrag';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerdown', { pointerId });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 100 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('armVectorGroupDrag', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should snapshot the canonical multi-select box when grabbing an already-selected member of a 2+ selection, so a group drag started this way (not from the box’s own interior) keeps the box in sync too', () => {
    // mock — v1(0,0)/v2(100,100) both selected; grabbing v1's own dot (not the box interior) still
    // moves the whole group, so the box must be snapshotted here exactly like armVectorMultiSelectBoxOnPointerDown does
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1', 'v2'];

    // before
    armVectorGroupDrag(canvas, pointerEvent(3), canvasRefs, { x: 0, y: 0 }, { id: 'v1', kind: 'vertex' });

    // result
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.boxOrigin).toEqual({ height: 100, width: 100, x: 0, y: 0 });
    expect(canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1,v2',
    });
  });

  it('should not snapshot a box when fewer than 2 points/handles are selected', () => {
    // mock — a single selected vertex dragged directly, no group/box concept applies
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = ['v1'];

    // before
    armVectorGroupDrag(canvas, pointerEvent(3), canvasRefs, { x: 0, y: 0 }, { id: 'v1', kind: 'vertex' });

    // result
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.boxOrigin).toBeNull();
    expect(canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toBeNull();
  });

  it('should include vertices reachable through a selected segment in both the drag and the box, since a lone selected segment resolves to its two endpoints', () => {
    // mock — only the segment is "selected" (not its own vertices individually); the drag needs to move
    // both endpoints, and the box now treats a segment's endpoints the same as an explicit vertex selection
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = ['s1'];

    // before
    armVectorGroupDrag(canvas, pointerEvent(3), canvasRefs, { x: 0, y: 0 }, { id: 's1', kind: 'segment' });

    // result
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.vertexOrigins).toEqual({ v1: { x: 0, y: 0 }, v2: { x: 100, y: 100 } });
    expect(canvasRefs.vectorMultiSelect.vectorMultiDragRef.current?.boxOrigin).toEqual({ height: 100, width: 100, x: 0, y: 0 });
    expect(canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toEqual({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      rotation: 0,
      selectionKey: 'v1,v2',
    });
  });
});
