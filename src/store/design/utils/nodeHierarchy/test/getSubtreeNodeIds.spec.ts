// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSubtreeNodeIds } from '../getSubtreeNodeIds';

describe('getSubtreeNodeIds', () => {
  it('should return each node with everything inside a group or boolean, skipping missing ids', () => {
    // mock
    const nodes = {
      child: { id: 'child', parentId: 'union', type: NodeType.rectangle },
      other: { id: 'other', parentId: null, type: NodeType.rectangle },
      union: { childIds: ['child'], id: 'union', parentId: null, type: NodeType.boolean },
    } as unknown as Record<string, TSceneNode>;

    // result
    expect(getSubtreeNodeIds(['union', 'other', 'missing'], nodes)).toEqual(['union', 'child', 'other']);
  });
});
