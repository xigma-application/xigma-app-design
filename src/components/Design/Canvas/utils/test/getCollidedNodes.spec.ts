// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPolygonNode, TSceneNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { getCollidedNodes } from '../getCollidedNodes';

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

describe('getCollidedNodes', () => {
  it('should return a node the area only partially overlaps, when full containment is not required', () => {
    // mock
    const node = buildNode({ height: 20, width: 20, x: 10, y: 10 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([node], area, false)).toEqual([node]);
  });

  it('should not return a node the area only partially overlaps, when full containment is required', () => {
    // mock
    const node = buildNode({ height: 20, width: 20, x: 10, y: 10 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([node], area, true)).toEqual([]);
  });

  it('should return a node fully inside the area regardless of the containment mode', () => {
    // mock
    const node = buildNode({ height: 10, width: 10, x: 5, y: 5 });
    const area = { height: 50, width: 50, x: 0, y: 0 };

    expect(getCollidedNodes([node], area, false)).toEqual([node]);
    expect(getCollidedNodes([node], area, true)).toEqual([node]);
  });

  it('should not return a node entirely outside the area', () => {
    // mock
    const node = buildNode({ height: 10, width: 10, x: 100, y: 100 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    expect(getCollidedNodes([node], area, false)).toEqual([]);
    expect(getCollidedNodes([node], area, true)).toEqual([]);
  });

  it('should return a node whose edge exactly touches the area boundary', () => {
    // mock
    const node = buildNode({ height: 10, width: 10, x: 10, y: 0 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([node], area, false)).toEqual([node]);
  });

  it('should collide a line node using the bounding box derived from its endpoints', () => {
    // mock
    const line: TSceneNode = {
      id: 'line',
      name: 'Line',
      parentId: null,
      stroke: '#000',
      type: NodeType.line,
      x1: 5,
      x2: 15,
      y1: 5,
      y2: 15,
    };
    const area = { height: 10, width: 10, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([line], area, false)).toEqual([line]);
    expect(getCollidedNodes([line], area, true)).toEqual([]);
  });
});
