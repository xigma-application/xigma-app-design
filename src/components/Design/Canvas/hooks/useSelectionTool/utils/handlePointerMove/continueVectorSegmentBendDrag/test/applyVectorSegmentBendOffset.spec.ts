// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

// utils
import { applyVectorSegmentBendOffset } from '../applyVectorSegmentBendOffset';

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
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('applyVectorSegmentBendOffset', () => {
  it('should offset both tangents by the same 4/3-scaled drag delta and switch the cursor to bend', () => {
    // mock
    const nodeId = addVectorNode();
    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const bendState: Extract<TVectorSegmentBendDragState, { status: 'committed' }> = {
      dragStart: { x: 0, y: 0 },
      nodeId,
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      status: 'committed',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    };
    const setClassName = vi.fn();

    // before — dx=30, dy=60, scaled by 4/3 -> offset (40, 80)
    applyVectorSegmentBendOffset(node, bendState, 30, 60, store.dispatch, setClassName);

    // result
    const updated = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(updated.segments.s1.tangentStart).toEqual({ x: 70, y: 80 });
    expect(updated.segments.s1.tangentEnd).toEqual({ x: 10, y: 80 });
    expect(setClassName).toHaveBeenCalledWith('bend');
  });
});
