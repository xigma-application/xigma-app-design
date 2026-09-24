// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { hasBooleanAncestor } from '../hasBooleanAncestor';

const nodesById = {
  boolean: { id: 'boolean', parentId: 'group', type: NodeType.boolean },
  group: { id: 'group', parentId: null, type: NodeType.group },
  nested: { id: 'nested', parentId: 'boolean', type: NodeType.rectangle },
  sibling: { id: 'sibling', parentId: 'group', type: NodeType.rectangle },
} as unknown as Record<string, TSceneNode>;

describe('hasBooleanAncestor', () => {
  it('should detect a node inside a boolean', () => {
    // action / result
    expect(hasBooleanAncestor(nodesById.nested, nodesById)).toBe(true);
  });

  it('should ignore nodes outside any boolean', () => {
    // action / result
    expect(hasBooleanAncestor(nodesById.sibling, nodesById)).toBe(false);
    expect(hasBooleanAncestor(nodesById.boolean, nodesById)).toBe(false);
  });
});
