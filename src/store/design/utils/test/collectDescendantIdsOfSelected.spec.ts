// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { collectDescendantIdsOfSelected } from '../collectDescendantIdsOfSelected';

const nodes = {
  child: { id: 'child', parentId: 'group', type: NodeType.rectangle },
  grandchild: { id: 'grandchild', parentId: 'inner', type: NodeType.rectangle },
  group: { childIds: ['child', 'inner'], id: 'group', type: NodeType.group },
  inner: { childIds: ['grandchild'], id: 'inner', parentId: 'group', type: NodeType.group },
  loose: { id: 'loose', type: NodeType.rectangle },
} as unknown as Record<string, TSceneNode>;

describe('collectDescendantIdsOfSelected', () => {
  it('should collect every descendant of the selected containers, but not the selected nodes themselves', () => {
    // result
    expect([...collectDescendantIdsOfSelected([nodes.group, nodes.loose], nodes)]).toEqual(['child', 'inner', 'grandchild']);
  });

  it('should skip missing selected entries', () => {
    // result
    expect(collectDescendantIdsOfSelected([undefined as unknown as TSceneNode], nodes).size).toBe(0);
  });
});
