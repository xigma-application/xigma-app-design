// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { isAncestorNode } from '../isAncestorNode';

const rect = (id: string, parentId: string | null = null): TRectangleNode => ({
  fill: '#fff',
  height: 10,
  id,
  name: 'Rectangle',
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const group = (id: string, childIds: string[], parentId: string | null = null): TGroupNode => ({
  childIds,
  height: 10,
  id,
  name: 'Group',
  parentId,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
});

describe('isAncestorNode', () => {
  const a = rect('a', 'inner');
  const inner = group('inner', ['a'], 'outer');
  const outer = group('outer', ['inner', 'b']);
  const b = rect('b', 'outer');
  const loose = rect('loose');
  const nodesById: Record<string, TSceneNode> = { a, b, inner, loose, outer };

  it('should return true for a direct parent', () => {
    expect(isAncestorNode('inner', a, nodesById)).toBe(true);
  });

  it('should return true for a grandparent further up the chain', () => {
    expect(isAncestorNode('outer', a, nodesById)).toBe(true);
  });

  it('should return false for the node itself', () => {
    expect(isAncestorNode('a', a, nodesById)).toBe(false);
  });

  it('should return false for a sibling', () => {
    expect(isAncestorNode('b', a, nodesById)).toBe(false);
  });

  it('should return false for a top-level node with no parent', () => {
    expect(isAncestorNode('outer', loose, nodesById)).toBe(false);
  });

  it('should stop walking when a parent id dangles', () => {
    const orphan = rect('orphan', 'gone');

    expect(isAncestorNode('outer', orphan, { orphan })).toBe(false);
  });
});
