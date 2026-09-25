// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getMaskShapeIds } from '../getMaskShapeIds';

const nodes = {
  leaf: { id: 'leaf', type: NodeType.rectangle },
  maskA: { childIds: ['a1', 'a2'], id: 'maskA', type: NodeType.mask },
  maskB: { childIds: ['b1'], id: 'maskB', type: NodeType.mask },
} as unknown as Record<string, TSceneNode>;

describe('getMaskShapeIds', () => {
  it('should return the last child of every mask, skipping anything that is not a container', () => {
    // action / result
    expect(getMaskShapeIds(['maskA', 'maskB', 'leaf', 'missing'], nodes)).toEqual(['a2', 'b1']);
  });
});
