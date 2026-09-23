// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPathNode, TPolygonNode, TSceneNode, TSectionNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { isPointInGroupBounds } from '../isPointInGroupBounds';

const buildNode = (
  overrides: Partial<Exclude<TBoxSceneNode, TPathNode | TPolygonNode | TSectionNode | TStarNode | TMediaNode | TTextNode>>,
): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ff0000',
    height: 10,
    id: 'node',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('isPointInGroupBounds', () => {
  it('should return true for a point in the gap between two same-parent selected nodes', () => {
    // mock
    const a = buildNode({ id: 'a', x: 0, y: 0 });
    const b = buildNode({ id: 'b', x: 40, y: 0 });

    // result
    expect(isPointInGroupBounds({ x: 25, y: 5 }, [a, b])).toBe(true);
  });

  it('should return false when the point falls outside the combined bounds', () => {
    // mock
    const a = buildNode({ id: 'a', x: 0, y: 0 });
    const b = buildNode({ id: 'b', x: 40, y: 0 });

    // result
    expect(isPointInGroupBounds({ x: 200, y: 200 }, [a, b])).toBe(false);
  });

  it('should return false for a single selected node (not a group)', () => {
    // mock
    const a = buildNode({ id: 'a', x: 0, y: 0 });

    // result
    expect(isPointInGroupBounds({ x: 5, y: 5 }, [a])).toBe(false);
  });

  it('should return false for a point in the gap between two selected nodes with different parents, since each parent has its own group', () => {
    // mock
    const a = buildNode({ id: 'a', parentId: 'frame-1', x: 0, y: 0 });
    const b = buildNode({ id: 'b', parentId: 'frame-2', x: 40, y: 0 });

    // result
    expect(isPointInGroupBounds({ x: 25, y: 5 }, [a, b])).toBe(false);
  });

  it('should return true for a point in the gap of one same-parent group even when another group is selected too', () => {
    // mock
    const a = buildNode({ id: 'a', parentId: 'frame-1', x: 0, y: 0 });
    const b = buildNode({ id: 'b', parentId: 'frame-1', x: 40, y: 0 });
    const c = buildNode({ id: 'c', parentId: 'frame-2', x: 200, y: 0 });

    // result
    expect(isPointInGroupBounds({ x: 25, y: 5 }, [a, b, c])).toBe(true);
  });
});
