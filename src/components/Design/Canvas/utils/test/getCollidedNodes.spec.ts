// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPathNode, TPolygonNode, TSceneNode, TSectionNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { getCollidedNodes } from '../getCollidedNodes';

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

describe('getCollidedNodes', () => {
  it('should return a node the area only partially overlaps, when full containment is not required', () => {
    // mock
    const node = buildNode({ height: 20, width: 20, x: 10, y: 10 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([node], area, false, { [node.id]: node })).toEqual([node]);
  });

  it('should not return a node the area only partially overlaps, when full containment is required', () => {
    // mock
    const node = buildNode({ height: 20, width: 20, x: 10, y: 10 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([node], area, true, { [node.id]: node })).toEqual([]);
  });

  it('should return a node fully inside the area regardless of the containment mode', () => {
    // mock
    const node = buildNode({ height: 10, width: 10, x: 5, y: 5 });
    const area = { height: 50, width: 50, x: 0, y: 0 };

    expect(getCollidedNodes([node], area, false, { [node.id]: node })).toEqual([node]);
    expect(getCollidedNodes([node], area, true, { [node.id]: node })).toEqual([node]);
  });

  it('should not return a node entirely outside the area', () => {
    // mock
    const node = buildNode({ height: 10, width: 10, x: 100, y: 100 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    expect(getCollidedNodes([node], area, false, { [node.id]: node })).toEqual([]);
    expect(getCollidedNodes([node], area, true, { [node.id]: node })).toEqual([]);
  });

  it('should return a node whose edge exactly touches the area boundary', () => {
    // mock
    const node = buildNode({ height: 10, width: 10, x: 10, y: 0 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([node], area, false, { [node.id]: node })).toEqual([node]);
  });

  it('should collide against the rotated bounding box, not the unrotated one', () => {
    // mock — a 20x10 rect rotated 90deg around its center (10, 5) occupies x:[5,15], y:[-5,15];
    const node = buildNode({ height: 10, rotation: 90, width: 20, x: 0, y: 0 });
    const area = { height: 2, width: 2, x: 12, y: -4 };

    // result
    expect(getCollidedNodes([node], area, false, { [node.id]: node })).toEqual([node]);
  });

  it('should never collide a hidden node', () => {
    // mock
    const node = buildNode({ height: 10, hidden: true, width: 10, x: 5, y: 5 });
    const area = { height: 50, width: 50, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([node], area, false, { [node.id]: node })).toEqual([]);
  });

  it('should never collide a locked node', () => {
    // mock
    const node = buildNode({ height: 10, locked: true, width: 10, x: 5, y: 5 });
    const area = { height: 50, width: 50, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([node], area, false, { [node.id]: node })).toEqual([]);
  });

  it('should require full enclosure for a top-level frame that has children, even in touch mode', () => {
    // mock — a frame with a child, only partially inside the area
    const frame = buildNode({ childIds: ['child-1'], height: 20, width: 20, x: 10, y: 10 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    // result — touch mode would normally include it, but a top-level frame-with-children needs full enclosure
    expect(getCollidedNodes([frame], area, false, { [frame.id]: frame })).toEqual([]);
  });

  it('should collide a fully-enclosed frame that has children', () => {
    // mock
    const frame = buildNode({ childIds: ['child-1'], height: 10, width: 10, x: 5, y: 5 });
    const area = { height: 50, width: 50, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([frame], area, false, { [frame.id]: frame })).toEqual([frame]);
  });

  it('should still include a partially-overlapped empty frame in touch mode', () => {
    // mock — no children, so the normal touch rule applies
    const frame = buildNode({ childIds: [], height: 20, width: 20, x: 10, y: 10 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    // result
    expect(getCollidedNodes([frame], area, false, { [frame.id]: frame })).toEqual([frame]);
  });

  it('should apply the normal touch rule to a frame nested directly inside another frame', () => {
    // mock — a frame with children, but its own parent is a frame, so it is not click-through
    const outer = buildNode({ childIds: ['nested'], id: 'outer', x: 0, y: 0 });
    const nested = buildNode({ childIds: ['child-1'], height: 20, id: 'nested', parentId: 'outer', width: 20, x: 10, y: 10 });
    const area = { height: 10, width: 10, x: 0, y: 0 };

    // result — only partially overlapped, but selectable like any normal node since it isn't click-through
    expect(getCollidedNodes([nested], area, false, { [outer.id]: outer, [nested.id]: nested })).toEqual([nested]);
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
    expect(getCollidedNodes([line], area, false, { [line.id]: line })).toEqual([line]);
    expect(getCollidedNodes([line], area, true, { [line.id]: line })).toEqual([]);
  });
});
