import { RefObject } from 'react';

// store
import { addNode, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

// utils
import { cancelVectorSegmentBendDrag } from '../cancelVectorSegmentBendDrag';

const keyDownEvent = (key: string): KeyboardEvent => new KeyboardEvent('keydown', { key });

const createVectorSegmentBendDragRef = (
  value: TVectorSegmentBendDragState | null = null,
): RefObject<TVectorSegmentBendDragState | null> => ({ current: value });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: { x: 20, y: 40 }, tangentStart: { x: 60, y: 40 } } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('cancelVectorSegmentBendDrag', () => {
  beforeEach(() => {
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should do nothing when the key pressed is not Escape, even mid-drag', () => {
    // mock
    const nodeId = addVectorNode();
    const dragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId,
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      tangentEnd: { x: 20, y: 40 },
      tangentStart: { x: 60, y: 40 },
    });
    const setClassName = vi.fn();

    // before
    cancelVectorSegmentBendDrag(keyDownEvent('a'), store.dispatch, dragRef, setClassName);

    // result
    expect(dragRef.current).not.toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should do nothing on Escape when no bend drag is in progress', () => {
    // mock
    const setClassName = vi.fn();

    // before
    cancelVectorSegmentBendDrag(keyDownEvent('Escape'), store.dispatch, createVectorSegmentBendDragRef(), setClassName);

    // result
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should revert the segment’s tangents to their pre-drag values, clear the drag ref, and reset the cursor on Escape', () => {
    // mock — the drag already bent the segment away from its original tangents
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const dragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId,
      originalTangentEnd: { x: 20, y: 40 },
      originalTangentStart: { x: 60, y: 40 },
      segmentId: 's1',
      tangentEnd: { x: 200, y: 400 },
      tangentStart: { x: 600, y: 400 },
    });
    const setClassName = vi.fn();

    // before
    cancelVectorSegmentBendDrag(keyDownEvent('Escape'), store.dispatch, dragRef, setClassName);

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentStart).toEqual({ x: 60, y: 40 });
    expect(node.segments.s1.tangentEnd).toEqual({ x: 20, y: 40 });
    expect(dragRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should revert straight back to null tangents when the segment had none before the drag started', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const dragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId,
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      tangentEnd: { x: 200, y: 400 },
      tangentStart: { x: 600, y: 400 },
    });
    const setClassName = vi.fn();

    // before
    cancelVectorSegmentBendDrag(keyDownEvent('Escape'), store.dispatch, dragRef, setClassName);

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentStart).toBeNull();
    expect(node.segments.s1.tangentEnd).toBeNull();
  });

  it('should still clear the drag ref and reset the cursor on Escape even when the vector-editing node can no longer be found', () => {
    // mock — e.g. the node got deleted mid-drag
    const dragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId: 'missing-node',
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      tangentEnd: { x: 200, y: 400 },
      tangentStart: { x: 600, y: 400 },
    });
    const setClassName = vi.fn();
    const dispatch = vi.fn();

    // before
    cancelVectorSegmentBendDrag(keyDownEvent('Escape'), dispatch, dragRef, setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(dragRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
