// store
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { bakeEditingNodeRotation } from '../bakeEditingNodeRotation';
import { bakeVectorNodeRotation } from '../../../../../utils/bakeVectorNodeRotation';

const node: TVectorNode = {
  fillColor: null,
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 90,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {
    v1: { id: 'v1', x: 10, y: 10 },
    v2: { id: 'v2', x: 110, y: 10 },
    v3: { id: 'v3', x: 110, y: 110 },
    v4: { id: 'v4', x: 10, y: 110 },
  },
};

describe('bakeEditingNodeRotation', () => {
  it('should dispatch a baked-rotation update when the editing node has a non-zero rotation', () => {
    // mock
    const dispatch = vi.fn();

    // before
    bakeEditingNodeRotation(dispatch, node);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: bakeVectorNodeRotation(node), id: 'vector-1' }));
  });

  it('should do nothing when the editing node has no rotation', () => {
    // mock
    const dispatch = vi.fn();

    // before
    bakeEditingNodeRotation(dispatch, { ...node, rotation: 0 });

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should do nothing when there is no editing node', () => {
    // mock
    const dispatch = vi.fn();

    // before
    bakeEditingNodeRotation(dispatch, null);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
