// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPolygonNode, TSceneNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { isPointInGroupBounds } from '../isPointInGroupBounds';

const buildNode = (overrides: Partial<Exclude<TBoxSceneNode, TPolygonNode | TStarNode | TMediaNode | TTextNode>>): TSceneNode => ({
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
});

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

  it('should return false when the selected nodes do not share a parent', () => {
    // mock
    const a = buildNode({ id: 'a', parentId: 'frame-1', x: 0, y: 0 });
    const b = buildNode({ id: 'b', parentId: 'frame-2', x: 40, y: 0 });

    // result
    expect(isPointInGroupBounds({ x: 25, y: 5 }, [a, b])).toBe(false);
  });
});
