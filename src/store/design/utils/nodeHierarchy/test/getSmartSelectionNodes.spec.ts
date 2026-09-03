// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getSmartSelectionNodes } from '../getSmartSelectionNodes';

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

describe('getSmartSelectionNodes', () => {
  const a = rect('a', 'g');
  const b = rect('b', 'g');
  const outer = rect('outer');
  const g = group('g', ['a', 'b']);
  const nodesById: Record<string, TSceneNode> = { a, b, g, outer };

  it('should expand a lone selected group to its leaf children', () => {
    expect(getSmartSelectionNodes([g], nodesById)).toEqual([a, b]);
  });

  it('should flatten a nested group down to its leaves', () => {
    const inner = group('inner', ['a', 'b'], 'nested');
    const nested = group('nested', ['inner']);

    expect(getSmartSelectionNodes([nested], { a, b, inner, nested })).toEqual([a, b]);
  });

  it('should leave a multi-node selection untouched', () => {
    expect(getSmartSelectionNodes([outer, g], nodesById)).toEqual([outer, g]);
  });

  it('should leave a lone non-group selection untouched', () => {
    expect(getSmartSelectionNodes([outer], nodesById)).toEqual([outer]);
  });

  it('should return an empty list for an empty selection', () => {
    expect(getSmartSelectionNodes([], nodesById)).toEqual([]);
  });
});
