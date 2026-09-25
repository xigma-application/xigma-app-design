// store
import { addNodes, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { armBakeVectorRotationOnPointerDown } from '../armBakeVectorRotationOnPointerDown';

vi.mock('../../../../../../utils/bakeVectorNodeRotation', () => ({
  bakeVectorNodeRotation: (node: TVectorNode): unknown => ({ baked: node.id }),
}));

const vector = (id: string, rotation: number): TVectorNode =>
  ({
    filledFaceKeys: [],
    id,
    name: id,
    parentId: null,
    rotation,
    segments: {},
    strokeColor: '#000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices: {},
  }) as unknown as TVectorNode;

describe('armBakeVectorRotationOnPointerDown', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should bake the rotation of every rotated vector being edited and never claim the pointer', () => {
    // mock
    const dispatch = vi.fn();
    store.dispatch(addNodes({ nodes: [vector('bake-rotated', 30), vector('bake-flat', 0)], rootIds: ['bake-rotated', 'bake-flat'] }));
    store.dispatch(setVectorEditingNodeIds(['bake-rotated', 'bake-flat', 'bake-missing']));

    // before
    const result = armBakeVectorRotationOnPointerDown({ dispatch } as never);

    // result
    expect(result).toBeUndefined();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(updateNode({ changes: { baked: 'bake-rotated' } as never, id: 'bake-rotated' }));
  });
});
