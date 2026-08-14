// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPathNode, TPolygonNode, TSceneNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { getSelectionBounds } from '../getSelectionBounds';

const buildNode = (
  overrides: Partial<Exclude<TBoxSceneNode, TPathNode | TPolygonNode | TStarNode | TMediaNode | TTextNode>>,
): TSceneNode => ({
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

describe('getSelectionBounds', () => {
  it('should return the bounds of a single node', () => {
    // result
    expect(getSelectionBounds([buildNode({ height: 20, width: 30, x: 5, y: 5 })])).toEqual({
      height: 20,
      width: 30,
      x: 5,
      y: 5,
    });
  });

  it('should return the combined bounds of several non-overlapping nodes', () => {
    // mock
    const a = buildNode({ height: 10, width: 10, x: 0, y: 0 });
    const b = buildNode({ height: 10, width: 10, x: 40, y: 40 });

    // result
    expect(getSelectionBounds([a, b])).toEqual({ height: 50, width: 50, x: 0, y: 0 });
  });

  it('should return the combined bounds regardless of node order', () => {
    // mock
    const a = buildNode({ height: 10, width: 10, x: 40, y: 40 });
    const b = buildNode({ height: 10, width: 10, x: 0, y: 0 });

    // result
    expect(getSelectionBounds([a, b])).toEqual({ height: 50, width: 50, x: 0, y: 0 });
  });

  it('should widen the bounds of a rotated node to its true axis-aligned extent', () => {
    // mock — a 10x10 square rotated 45deg around its center (5, 5) has an axis-aligned bbox of
    const node = buildNode({ height: 10, rotation: 45, width: 10, x: 0, y: 0 });
    const expectedSide = 10 * Math.sqrt(2);

    // result
    const bounds = getSelectionBounds([node]);

    expect(bounds.width).toBeCloseTo(expectedSide);
    expect(bounds.height).toBeCloseTo(expectedSide);
    expect(bounds.x).toBeCloseTo(5 - expectedSide / 2);
    expect(bounds.y).toBeCloseTo(5 - expectedSide / 2);
  });

  it('should include a line node by deriving its bounds from its two endpoints', () => {
    // mock
    const box = buildNode({ height: 10, width: 10, x: 0, y: 0 });
    const line: TSceneNode = {
      id: 'line',
      name: 'Line',
      parentId: null,
      stroke: '#000',
      type: NodeType.line,
      x1: 30,
      x2: 40,
      y1: 5,
      y2: 20,
    };

    // result
    expect(getSelectionBounds([box, line])).toEqual({ height: 20, width: 40, x: 0, y: 0 });
  });
});
