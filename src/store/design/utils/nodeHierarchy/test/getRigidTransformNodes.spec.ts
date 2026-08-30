// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getRigidTransformNodes } from '../getRigidTransformNodes';

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

describe('getRigidTransformNodes', () => {
  const a = rect('a', 'inner');
  const b = rect('b', 'outer');
  const inner = group('inner', ['a'], 'outer');
  const outer = group('outer', ['inner', 'b']);
  const nodesById: Record<string, TSceneNode> = { a, b, inner, outer };

  it('should flatten selected group subtrees, deduped', () => {
    expect(getRigidTransformNodes([outer, inner], nodesById).map((node) => node.id)).toEqual(['outer', 'inner', 'a', 'b']);
  });
});
