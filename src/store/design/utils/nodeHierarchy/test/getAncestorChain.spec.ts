// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getAncestorChain } from '../getAncestorChain';

const rect = (id: string, parentId: string | null = null): TRectangleNode => ({
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
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

const frame = (id: string, parentId: string | null = null): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  height: 10,
  id,
  name: 'Frame',
  parentId,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

describe('getAncestorChain', () => {
  const inner = frame('inner', 'outer');
  const outer = frame('outer', null);
  const a = rect('a', 'inner');
  const loose = rect('loose');
  const nodesById: Record<string, TSceneNode> = { a, inner, loose, outer };

  it('should return every ancestor from the immediate parent out to the root, excluding the node itself', () => {
    expect(getAncestorChain(a, nodesById).map((node) => node.id)).toEqual(['inner', 'outer']);
  });

  it('should return an empty array for a top-level node', () => {
    expect(getAncestorChain(loose, nodesById)).toEqual([]);
  });

  it('should stop at the deepest resolvable ancestor when a parent id dangles', () => {
    const orphan = rect('orphan', 'gone');

    expect(getAncestorChain(orphan, { orphan })).toEqual([]);
  });
});
