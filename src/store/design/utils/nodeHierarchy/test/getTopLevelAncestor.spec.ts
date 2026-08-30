// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getTopLevelAncestor } from '../getTopLevelAncestor';

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

describe('getTopLevelAncestor', () => {
  const a = rect('a', 'inner');
  const inner = group('inner', ['a'], 'outer');
  const outer = group('outer', ['inner', 'b']);
  const loose = rect('loose');
  const nodesById: Record<string, TSceneNode> = { a, inner, loose, outer };

  it('should walk parentId up to the root group', () => {
    expect(getTopLevelAncestor(a, nodesById).id).toBe('outer');
  });

  it('should return the node itself when it is already top-level', () => {
    expect(getTopLevelAncestor(loose, nodesById).id).toBe('loose');
  });

  it('should stop at the deepest resolvable ancestor when a parent id dangles', () => {
    const orphan = rect('orphan', 'gone');
    expect(getTopLevelAncestor(orphan, { orphan }).id).toBe('orphan');
  });
});
