// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getGroupLeafNodes } from '../getGroupLeafNodes';

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

describe('getGroupLeafNodes', () => {
  const a = rect('a', 'inner');
  const b = rect('b', 'outer');
  const inner = group('inner', ['a'], 'outer');
  const outer = group('outer', ['inner', 'b']);
  const loose = rect('loose');
  const nodesById: Record<string, TSceneNode> = { a, b, inner, loose, outer };

  it('should flatten a nested group to its leaf nodes', () => {
    expect(getGroupLeafNodes(outer, nodesById).map((node) => node.id)).toEqual(['a', 'b']);
  });

  it('should return a non-group node as a single-item list', () => {
    expect(getGroupLeafNodes(loose, nodesById)).toEqual([loose]);
  });

  it('should skip child ids that no longer resolve', () => {
    expect(getGroupLeafNodes(group('g', ['gone']), {})).toEqual([]);
  });
});
