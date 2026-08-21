// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { createSelectionToolRefs } from '../../../hooks/useSelectionToolRefs/createSelectionToolRefs';
import { disarmVectorHandleDrag } from '../disarmVectorHandleDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

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

describe('disarmVectorHandleDrag', () => {
  it('should do nothing when no vector handle drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const selectionRefs = createSelectionToolRefs();
    const setClassName = vi.fn();

    // before
    disarmVectorHandleDrag(canvas, pointerEvent(), dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the vector-handle-drag ref and the snapped-handle ref, release pointer capture, and reset the cursor', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({ snappedVectorHandleRef: { current: { end: 'end', segmentId: 'segment-1' } } });
    const dispatch = vi.fn();
    const selectionRefs = createSelectionToolRefs({
      vectorHandleDragRef: { current: { end: 'end', nodeId: 'path-1', segmentId: 'segment-1', vertexId: 'vertex-1' } },
    });
    const setClassName = vi.fn();

    // before
    disarmVectorHandleDrag(canvas, pointerEvent(2), dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(selectionRefs.vectorHandleDragRef.current).toBeNull();
    expect(canvasRefs.snappedVectorHandleRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should commit the first candidate for a pending ambiguous corner-handle drag released without ever moving', () => {
    // mock — e.g. a plain Ctrl+click on a branch vertex with no drag at all
    const nodeId = addBranchingVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = store.dispatch;
    const setClassName = vi.fn();
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

    // before
    disarmVectorHandleDrag(canvas, pointerEvent(2), dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.vertexHandleModes).toEqual({ v1: 'symmetric' });
    expect(canvasRefs.selectedVectorHandlesRef.current).toEqual([{ end: 'start', segmentId: 's1' }]);
    expect(selectionRefs.pendingVectorCornerHandleDragRef.current).toBeNull();
    expect(selectionRefs.vectorHandleDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should just clear the pending ref for a drag whose node can no longer be found', () => {
    // mock — e.g. the node got deleted mid-gesture
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const setClassName = vi.fn();
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
    disarmVectorHandleDrag(canvas, pointerEvent(2), dispatch, canvasRefs, selectionRefs, setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(selectionRefs.pendingVectorCornerHandleDragRef.current).toBeNull();
    expect(selectionRefs.vectorHandleDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });
});
