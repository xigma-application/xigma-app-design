// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { createSelectionToolRefs } from '../../../hooks/useSelectionToolRefs/createSelectionToolRefs';
import { resolveVectorCornerHandleDrag } from '../resolveVectorCornerHandleDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

// v1 is shared by s1 (toward v2, "right", 0°) and s2 (toward v3, "down", 90°)
const addBranchingVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v1', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 0, y: 90 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('resolveVectorCornerHandleDrag', () => {
  it('should do nothing when there is no pending corner-handle drag', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const selectionRefs = createSelectionToolRefs();

    // before
    resolveVectorCornerHandleDrag(canvas, pointerEvent(30, 60), dispatch, canvasRefs, selectionRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(selectionRefs.vectorHandleDragRef.current).toBeNull();
  });

  it('should stay pending while the drag remains below the minimum drag distance', () => {
    // mock
    const nodeId = addBranchingVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const selectionRefs = createSelectionToolRefs({
      pendingVectorCornerHandleDragRef: {
        current: {
          candidates: [
            { angle: 0, end: 'start', segmentId: 's1' },
            { angle: 90, end: 'start', segmentId: 's2' },
          ],
          dragStart: { x: 0, y: 0 },
          nodeId,
          vertexId: 'v1',
        },
      },
    });

    // before — a 1px nudge, under MIN_DRAG_DISTANCE_PX
    resolveVectorCornerHandleDrag(canvas, pointerEvent(1, 0), dispatch, canvasRefs, selectionRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(selectionRefs.pendingVectorCornerHandleDragRef.current).not.toBeNull();
    expect(selectionRefs.vectorHandleDragRef.current).toBeNull();
  });

  it('should resolve to the candidate matching the first drag direction once past the minimum drag distance', () => {
    // mock
    const nodeId = addBranchingVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = store.dispatch;
    const selectionRefs = createSelectionToolRefs({
      pendingVectorCornerHandleDragRef: {
        current: {
          candidates: [
            { angle: 0, end: 'start', segmentId: 's1' },
            { angle: 90, end: 'start', segmentId: 's2' },
          ],
          dragStart: { x: 0, y: 0 },
          nodeId,
          vertexId: 'v1',
        },
      },
    });

    // before — dragged straight down (0, 60): matches s2's 90° candidate, not s1's first-created 0°
    resolveVectorCornerHandleDrag(canvas, pointerEvent(0, 60), dispatch, canvasRefs, selectionRefs);

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(selectionRefs.pendingVectorCornerHandleDragRef.current).toBeNull();
    expect(selectionRefs.vectorHandleDragRef.current).toEqual({ end: 'start', nodeId, segmentId: 's2', vertexId: 'v1' });
    expect(node.vertexHandleModes).toEqual({ v1: 'symmetric' });
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's2' }]);
  });

  it('should do nothing when the vector-editing node can no longer be found', () => {
    // mock — e.g. the node got deleted mid-drag
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const selectionRefs = createSelectionToolRefs({
      pendingVectorCornerHandleDragRef: {
        current: {
          candidates: [{ angle: 0, end: 'start', segmentId: 's1' }],
          dragStart: { x: 0, y: 0 },
          nodeId: 'missing-node',
          vertexId: 'v1',
        },
      },
    });

    // before
    resolveVectorCornerHandleDrag(canvas, pointerEvent(30, 60), dispatch, canvasRefs, selectionRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(selectionRefs.pendingVectorCornerHandleDragRef.current).not.toBeNull();
    expect(selectionRefs.vectorHandleDragRef.current).toBeNull();
  });
});
